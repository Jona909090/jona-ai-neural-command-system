import { createContext, useCallback, useContext, useRef, useState } from 'react'

const NeuralStateContext = createContext(null)
export const useNeuralState = () => useContext(NeuralStateContext)

export const DEMO_PATH = ['LANGUAGE', 'CONTEXT', 'MEMORY', 'LOGIC', 'PLANNING', 'CORE', 'RESPONSE']

export function NeuralStateProvider({ children }) {
  const [state, setState] = useState('IDLE')
  const [sequence, setSequence] = useState([])
  const [signal, setSignal] = useState({ path: [], step: -1, run: 0 })
  const [focusedSystem, setFocusedSystem] = useState(null)
  const [demoResponse, setDemoResponse] = useState('')
  const runId = useRef(0), timers = useRef([])

  const clearRun = () => { timers.current.forEach(clearTimeout); timers.current = [] }
  const setAIState = useCallback(next => setState(next), [])
  const activateSystem = useCallback(name => setSequence(current => current.includes(name) ? current : [...current, name]), [])
  const sendSignal = useCallback((from, to) => setSignal(current => ({ path: [from, to], step: 0, run: current.run + 1 })), [])
  const focusSystem = useCallback(name => setFocusedSystem(name), [])

  const activate = useCallback(() => {
    clearRun(); const id = ++runId.current
    setDemoResponse(''); setState('LISTENING'); setSequence(['LANGUAGE', 'CONTEXT']); setSignal(s => ({ path: DEMO_PATH, step: -1, run: s.run + 1 }))
    timers.current.push(setTimeout(() => { if (runId.current !== id) return; setState('PROCESSING'); setSignal(s => ({ ...s, step: 0 })); setSequence(['LANGUAGE']) }, 650))
    DEMO_PATH.forEach((name, index) => timers.current.push(setTimeout(() => {
      if (runId.current !== id) return
      setSignal(s => ({ ...s, step: index })); setSequence(DEMO_PATH.slice(Math.max(0, index - 1), index + 1).filter(x => x !== 'CORE'))
      if (name === 'RESPONSE') { setState('RESPONDING'); setSequence(['RESPONSE']); setDemoResponse('Neural processing complete. System ready for AI integration.') }
    }, 1150 + index * 720)))
    timers.current.push(setTimeout(() => { if (runId.current !== id) return; setState('IDLE'); setSequence([]); setSignal(s => ({ ...s, step: -1 })) }, 7100))
  }, [])

  return <NeuralStateContext.Provider value={{ state, sequence, signal, focusedSystem, demoResponse, activate, activateSystem, sendSignal, setAIState, focusSystem }}>{children}</NeuralStateContext.Provider>
}
