import { useState } from 'react'
import { useNeuralState } from '../state/NeuralStateContext'
import { useConversation } from '../controllers/ConversationContext'

export default function CommandInput() {
  const [value, setValue] = useState('')
  const { state } = useNeuralState(), { busy, submit } = useConversation()
  const send = async () => { const message = value; if (!message.trim() || busy) return; setValue(''); await submit(message) }
  const onKeyDown = event => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); send() } }
  return <form className={`command ${busy ? 'busy' : ''}`} onSubmit={event => { event.preventDefault(); send() }}>
    <button type="button" className="mic" aria-label="Microphone"><span /></button>
    <textarea rows="1" value={value} disabled={busy} onKeyDown={onKeyDown} onChange={event => setValue(event.target.value)} placeholder={busy ? `${state.toLowerCase()} neural request...` : 'Ask JONA AI...'} />
    <span className="command-state">{state}</span>
    <button className="send" disabled={busy || !value.trim()} aria-label="Send">↗</button>
  </form>
}
