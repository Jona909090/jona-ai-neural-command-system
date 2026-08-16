import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { AI_CONFIG } from '../config/aiConfig'
import { AIService } from '../services/ai/AIService'
import { buildAIHistory, clearConversation, loadConversation, saveConversation } from '../services/ai/ConversationMemory'
import { routeMessage } from './neuralRouter'
import { useNeuralState } from '../state/NeuralStateContext'

const ConversationContext = createContext(null)
export const useConversation = () => useContext(ConversationContext)
const wait = ms => new Promise(resolve => setTimeout(resolve, ms))
const emit = name => window.dispatchEvent(new CustomEvent(name))

export function ConversationProvider({ children }) {
  const [messages, setMessages] = useState(() => loadConversation())
  const [busy, setBusy] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [error, setError] = useState('')
  const requestId = useRef(0)
  const messagesRef = useRef(messages)
  const neural = useNeuralState()

  useEffect(() => {
    messagesRef.current = messages
    saveConversation(messages)
  }, [messages])

  const resetConversation = useCallback(() => {
    if (busy) return false
    requestId.current += 1
    messagesRef.current = []
    setMessages([])
    setError('')
    clearConversation()
    neural.stopAll()
    return true
  }, [busy, neural])

  const submit = useCallback(async input => {
    const clean = input.trim(); if (!clean || busy) return false
    neural.incrementRequests()
    const id = ++requestId.current, route = routeMessage(clean)
    const userMessage = { id: `u-${id}`, role: 'user', text: clean, createdAt: Date.now() }
    const history = buildAIHistory(messagesRef.current)

    setBusy(true); setError('')
    setMessages(current => [...current, userMessage])
    neural.resetActivity(); neural.setAIState('LISTENING'); emit('jona:listening-start')
    neural.setSystemIntensity('LANGUAGE', 1); neural.setSystemIntensity('CONTEXT', .9); neural.activateSystem('LANGUAGE'); neural.sendSignal('INPUT', 'LANGUAGE')
    const controller = new AbortController(), timeout = setTimeout(() => controller.abort(), AI_CONFIG.timeoutMs)
    try {
      await wait(360); neural.sendSignal('LANGUAGE', 'CONTEXT'); neural.activateSystem('CONTEXT')
      await wait(520); neural.setAIState('PROCESSING'); emit('jona:processing-start')
      Object.entries(route.intensities).forEach(([name, value]) => neural.setSystemIntensity(name, value))
      for (let step = 1; step < route.path.length - 2; step++) { neural.sendSignal(route.path[step], route.path[step + 1]); neural.activateSystem(route.path[step + 1]); await wait(390) }
      const assistantId = `a-${id}`; let started = false
      setMessages(current => [...current, { id: assistantId, role: 'assistant', text: '', streaming: true, createdAt: Date.now() }])
      await AIService.streamResponse({ input: clean, history, signal: controller.signal, onToken: token => {
        if (!started) { started = true; neural.setAIState('RESPONDING'); neural.sendSignal('CORE', 'RESPONSE'); neural.activateSystem('RESPONSE'); emit('jona:response-start') }
        setMessages(current => current.map(message => message.id === assistantId ? { ...message, text: message.text + token } : message))
      } })
      setMessages(current => current.map(message => message.id === assistantId ? { ...message, streaming: false } : message)); emit('jona:response-complete')
      await wait(650); neural.setAIState('IDLE'); neural.resetActivity()
    } catch (reason) {
      const message = reason?.name === 'AbortError' ? 'AI servis nije odgovorio na vrijeme. Pokušaj ponovo.' : 'Veza sa AI servisom trenutno nije dostupna.'
      setError(message); setMessages(current => [...current, { id: `e-${id}`, role: 'system', text: message, createdAt: Date.now() }]); neural.setAIState('ERROR'); neural.setSystemIntensity('RESPONSE', 1)
      await wait(1400); neural.setAIState('IDLE'); neural.resetActivity()
    } finally { clearTimeout(timeout); setBusy(false) }
    return true
  }, [busy, neural])

  return <ConversationContext.Provider value={{ messages, busy, expanded, error, submit, resetConversation, toggleExpanded: () => setExpanded(value => !value) }}>{children}</ConversationContext.Provider>
}
