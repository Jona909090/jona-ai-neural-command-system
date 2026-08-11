import { AI_CONFIG } from '../../config/aiConfig'

// This client calls our future secure backend. It never receives or stores a provider API key.
export class LiveAIProvider {
  async stream({ input, history, signal, onToken }) {
    const response = await fetch(AI_CONFIG.endpoint, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input, history }), signal,
    })
    if (!response.ok) throw new Error(`AI service returned ${response.status}`)
    if (!response.body) { const data = await response.json(); onToken(data.text || ''); return data.text || '' }
    const reader = response.body.getReader(), decoder = new TextDecoder(); let complete = ''
    while (true) { const { done, value } = await reader.read(); if (done) break; const token = decoder.decode(value, { stream: true }); complete += token; onToken(token) }
    return complete
  }
}
