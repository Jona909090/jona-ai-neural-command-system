import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { VOICE_CONFIG } from '../config/voiceConfig'
import { MicrophoneController } from '../services/voice/MicrophoneController'
import { SpeechToTextService } from '../services/voice/SpeechToTextService'
import { TextToSpeechService } from '../services/voice/TextToSpeechService'
import { useConversation } from './ConversationContext'
import { useNeuralState } from '../state/NeuralStateContext'

const VoiceContext = createContext(null)
export const useVoice = () => useContext(VoiceContext)

export function VoiceProvider({ children }) {
  const [status, setStatus] = useState('READY'), [transcript, setTranscript] = useState(''), [amplitude, setAmplitude] = useState(0), [notice, setNotice] = useState('')
  const [settings, setSettings] = useState({ voiceOn: true, autoSpeak: true, sensitivity: VOICE_CONFIG.defaultSensitivity, volume: VOICE_CONFIG.defaultVolume })
  const mic = useRef(new MicrophoneController()), transcriptRef = useRef(''), stopping = useRef(false), listening = useRef(false), lastSpokenId = useRef(null), peakCooldown = useRef(0)
  const conversation = useConversation(), neural = useNeuralState()

  const stopSpeaking = useCallback(() => { TextToSpeechService.stop(); setAmplitude(0); if (status === 'SPEAKING') { setStatus('READY'); neural.setAIState('IDLE'); neural.resetActivity() } }, [status, neural])
  const cancelListening = useCallback(async () => { if (!listening.current) return; stopping.current = true; listening.current = false; SpeechToTextService.cancel(); await mic.current.stop(); transcriptRef.current = ''; setTranscript(''); setAmplitude(0); setStatus('READY'); neural.setAIState('IDLE'); neural.resetActivity(); setTimeout(() => { stopping.current = false }, 0) }, [neural])
  const stopListening = useCallback(async (send = true) => {
    if (!listening.current || stopping.current) return; stopping.current = true; listening.current = false; SpeechToTextService.stop(); await mic.current.stop(); const text = transcriptRef.current.trim(); setAmplitude(0); setStatus(text && send ? 'PROCESSING' : 'READY'); setTranscript('')
    if (text && send) await conversation.submit(text); else { neural.setAIState('IDLE'); neural.resetActivity() }
    setStatus('READY'); transcriptRef.current = ''; stopping.current = false
  }, [conversation, neural])
  const startListening = useCallback(async () => {
    if (status === 'LISTENING') { await stopListening(true); return }
    if (status === 'SPEAKING') stopSpeaking()
    if (conversation.busy && status !== 'SPEAKING') { setNotice('NEURAL PROCESSING IN PROGRESS'); return }
    setNotice(''); setTranscript(''); transcriptRef.current = ''; listening.current = true; neural.setAIState('LISTENING'); neural.activateSystem('LANGUAGE'); neural.activateSystem('CONTEXT'); setStatus('LISTENING')
    try {
      const sttSupported = SpeechToTextService.start({ onUpdate: text => { transcriptRef.current = text; setTranscript(text); window.dispatchEvent(new CustomEvent('jona:transcript-update', { detail: text })) }, onComplete: () => {}, onError: () => setNotice('SPEECH RECOGNITION UNAVAILABLE') })
      if (!sttSupported) setNotice('LIVE TRANSCRIPT NOT SUPPORTED — MANUAL STOP AVAILABLE')
      await mic.current.start({ sensitivity: settings.sensitivity, onLevel: level => setAmplitude(level), onSpeechStart: () => window.dispatchEvent(new CustomEvent('jona:speech-start')), onPeak: level => { const now = performance.now(); if (now - peakCooldown.current > 280) { peakCooldown.current = now; neural.sendSignal('LANGUAGE', 'CONTEXT'); neural.setSystemIntensity('LANGUAGE', Math.min(1, .65 + level)) } }, onSilence: () => { window.dispatchEvent(new CustomEvent('jona:speech-end')); stopListening(true) } })
    } catch (error) { listening.current = false; SpeechToTextService.cancel(); await mic.current.stop(); setStatus('READY'); setNotice(error?.name === 'NotAllowedError' ? 'MICROPHONE ACCESS REQUIRED' : 'MICROPHONE UNAVAILABLE'); neural.setAIState('IDLE'); neural.resetActivity() }
  }, [status, settings.sensitivity, conversation.busy, neural, stopListening, stopSpeaking])

  useEffect(() => { const onKey = event => { if (event.key === 'Escape') cancelListening() }; window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey) }, [cancelListening])
  useEffect(() => {
    const latest = [...conversation.messages].reverse().find(message => message.role === 'assistant' && !message.streaming)
    if (!latest || latest.id === lastSpokenId.current || !settings.voiceOn || !settings.autoSpeak) return
    lastSpokenId.current = latest.id; setStatus('SPEAKING'); neural.setAIState('RESPONDING'); neural.activateSystem('RESPONSE'); neural.setSystemIntensity('RESPONSE', 1)
    TextToSpeechService.speak(latest.text, { volume: settings.volume, onStart: () => window.dispatchEvent(new CustomEvent('jona:speaking-start')), onAmplitude: setAmplitude, onComplete: () => { setAmplitude(0); setStatus('READY'); neural.setAIState('IDLE'); neural.resetActivity(); window.dispatchEvent(new CustomEvent('jona:speaking-complete')) }, onError: () => { setNotice('VOICE OUTPUT UNAVAILABLE'); setStatus('READY'); neural.setAIState('IDLE') } })
  }, [conversation.messages, settings.voiceOn, settings.autoSpeak, settings.volume, neural])
  useEffect(() => { if (status === 'SPEAKING') neural.setAIState('RESPONDING') }, [conversation.busy, status])
  useEffect(() => () => { SpeechToTextService.cancel(); mic.current.stop(); TextToSpeechService.stop() }, [])

  const updateSetting = (name, value) => { if (name === 'voiceOn' && !value) stopSpeaking(); setSettings(current => ({ ...current, [name]: value })) }
  return <VoiceContext.Provider value={{ status, transcript, amplitude, notice, settings, startListening, stopListening, cancelListening, startSpeaking: TextToSpeechService.speak.bind(TextToSpeechService), stopSpeaking, updateSetting }}>{children}</VoiceContext.Provider>
}
