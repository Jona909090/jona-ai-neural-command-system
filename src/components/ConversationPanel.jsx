import { useEffect, useRef } from 'react'
import { useConversation } from '../controllers/ConversationContext'

export default function ConversationPanel() {
  const { messages, expanded, toggleExpanded, busy, error } = useConversation(), scroll = useRef()
  useEffect(() => { if (scroll.current) scroll.current.scrollTop = scroll.current.scrollHeight }, [messages])
  if (!messages.length) return null
  const visible = expanded ? messages : messages.slice(-2)
  return <section className={`conversation ${expanded ? 'expanded' : ''} ${error ? 'error' : ''}`}>
    <header><span>CONVERSATION CHANNEL</span><b>{busy ? 'NEURAL LINK ACTIVE' : 'SESSION MEMORY'}</b><button onClick={toggleExpanded}>{expanded ? 'COLLAPSE' : 'EXPAND'}</button></header>
    <div className="conversation-scroll" ref={scroll}>{visible.map(message => <article key={message.id} className={message.role}>
      <strong>{message.role === 'user' ? 'YOU' : message.role === 'assistant' ? 'JONA AI' : 'SYSTEM'}</strong>
      <p>{message.text}{message.streaming && <i className="stream-cursor" />}</p>
    </article>)}</div>
  </section>
}
