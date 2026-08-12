export class BrowserTextToSpeechService {
  constructor() { this.utterance = null; this.timer = 0 }
  get supported() { return 'speechSynthesis' in window }
  speak(text, { volume = .85, onStart, onAmplitude, onComplete, onError }) {
    if (!this.supported || !text) { onComplete?.(); return false }
    this.stop(); const utterance = new SpeechSynthesisUtterance(text); utterance.volume = volume; utterance.rate = .96; utterance.pitch = 1.12
    const voices = speechSynthesis.getVoices()
    const femaleName = /female|woman|zira|samantha|victoria|aria|jenny|ana|ivana|marija|milena|natasha|katja|helen/i
    const regional = voices.filter(v => /^hr|^sr|^bs/i.test(v.lang))
    const european = voices.filter(v => /^sl|^en-GB|^en-US/i.test(v.lang))
    const selected = regional.find(v => femaleName.test(v.name)) || regional[0] || european.find(v => femaleName.test(v.name)) || european[0]
    if (selected) { utterance.voice = selected; utterance.lang = selected.lang }
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
