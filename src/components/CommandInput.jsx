import { useState } from 'react'
import { useNeuralState } from '../state/NeuralStateContext'
import { useConversation } from '../controllers/ConversationContext'
import { useVoice } from '../controllers/VoiceContext'

export default function CommandInput() {
  const [value, setValue] = useState('')
  const { state } = useNeuralState(), { busy, submit } = useConversation()
  const voice = useVoice()
  const send = async () => { const message = value; if (!message.trim() || busy) return; setValue(''); await submit(message) }
  const onKeyDown = event => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); send() } }
  return <form className={`command ${busy ? 'busy' : ''}`} onSubmit={event => { event.preventDefault(); send() }}>
    <button type="button" className={`mic ${voice.status === 'LISTENING' ? 'active' : ''}`} onClick={voice.startListening} aria-label={voice.status === 'LISTENING' ? 'Stop microphone' : 'Start microphone'}><span /></button>
    {voice.transcript && <span className="live-transcript">{voice.transcript}</span>}
    <textarea rows="1" value={value} disabled={busy || voice.status === 'LISTENING'} onKeyDown={onKeyDown} onChange={event => setValue(event.target.value)} placeholder={voice.status === 'LISTENING' ? 'Listening...' : busy ? `${state.toLowerCase()} neural request...` : 'Ask JONA AI...'} />
    {voice.status === 'LISTENING' && <button type="button" className="voice-cancel" onClick={voice.cancelListening}>CANCEL</button>}
    <span className="command-state">{state}</span>
    <button className="send" disabled={busy || !value.trim()} aria-label="Send">↗</button>
  </form>
}
