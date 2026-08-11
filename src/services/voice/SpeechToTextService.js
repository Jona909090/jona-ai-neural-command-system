export class BrowserSpeechToTextService {
  constructor() { this.recognition = null }
  get supported() { return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition) }
  start({ onUpdate, onComplete, onError }) {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!Recognition) return false
    const recognition = new Recognition(); recognition.continuous = true; recognition.interimResults = true; recognition.lang = navigator.language || 'hr-HR'
    recognition.onresult = event => { let finalText = '', interim = ''; for (let i = 0; i < event.results.length; i++) { const text = event.results[i][0].transcript; if (event.results[i].isFinal) finalText += text; else interim += text } onUpdate(`${finalText}${interim}`.trim(), finalText.trim()) }
    recognition.onerror = event => { if (!['aborted', 'no-speech'].includes(event.error)) onError(event.error) }
    recognition.onend = () => onComplete(); recognition.start(); this.recognition = recognition; return true
  }
  stop() { try { this.recognition?.stop() } catch {} this.recognition = null }
  cancel() { try { this.recognition?.abort() } catch {} this.recognition = null }
}

// Future server implementation should conform to the same start/stop/cancel contract.
export const SpeechToTextService = new BrowserSpeechToTextService()
