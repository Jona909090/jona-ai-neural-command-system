const STORAGE_KEY = 'jona.conversation.v1'
const MAX_MESSAGES = 40

function normalizeMessage(message) {
  if (!message || !['user', 'assistant', 'system'].includes(message.role)) return null
  const text = String(message.text || '').trim()
  if (!text) return null
  return {
    id: message.id || `${message.role}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    role: message.role,
    text,
    createdAt: message.createdAt || Date.now(),
  }
}

export function loadConversation() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.map(normalizeMessage).filter(Boolean).slice(-MAX_MESSAGES)
  } catch {
    return []
  }
}

export function saveConversation(messages) {
  try {
    const compact = messages
      .map(normalizeMessage)
      .filter(Boolean)
      .slice(-MAX_MESSAGES)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(compact))
  } catch {
    // Storage can be unavailable in private/restricted browser modes.
  }
}

export function clearConversation() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // No-op when storage is unavailable.
  }
}

export function buildAIHistory(messages, maxMessages = 20) {
  return messages
    .map(normalizeMessage)
    .filter(message => message && message.role !== 'system')
    .slice(-maxMessages)
    .map(({ role, text }) => ({ role, text }))
}
