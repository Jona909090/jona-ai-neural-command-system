export class BrowserTextToSpeechService {
  constructor() { this.utterance = null; this.timer = 0 }
  get supported() { return 'speechSynthesis' in window }
  speak(text, { volume = .85, onStart, onAmplitude, onComplete, onError }) {
    if (!this.supported || !text) { onComplete?.(); return false }
    this.stop(); const utterance = new SpeechSynthesisUtterance(text); utterance.volume = volume; utterance.rate = .94; utterance.pitch = .92
    const voices = speechSynthesis.getVoices(), local = voices.find(v => /^hr|^sr|^bs/i.test(v.lang)) || voices.find(v => /^en/i.test(v.lang)); if (local) utterance.voice = local
    utterance.onstart = () => { onStart?.(); this.timer = window.setInterval(() => onAmplitude?.(.2 + Math.random() * .65), 95) }
    utterance.onboundary = () => onAmplitude?.(.85)
    utterance.onend = () => { this.clear(); onAmplitude?.(0); onComplete?.() }
    utterance.onerror = event => { this.clear(); onAmplitude?.(0); if (event.error !== 'interrupted' && event.error !== 'canceled') onError?.(event.error) }
    this.utterance = utterance; speechSynthesis.speak(utterance); return true
  }
  clear() { clearInterval(this.timer); this.timer = 0; this.utterance = null }
  stop() { if (this.supported) speechSynthesis.cancel(); this.clear() }
}

export const TextToSpeechService = new BrowserTextToSpeechService()
