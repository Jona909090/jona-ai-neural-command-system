export class BrowserTextToSpeechService {
  constructor() { this.utterance = null; this.timer = 0 }
  get supported() { return 'speechSynthesis' in window }
  speak(text, { volume = .85, onStart, onAmplitude, onComplete, onError }) {
    if (!this.supported || !text) { onComplete?.(); return false }
    this.stop(); const utterance = new SpeechSynthesisUtterance(text); utterance.volume = volume; utterance.rate = .78; utterance.pitch = 1.04
    const voices = speechSynthesis.getVoices()
    const femaleName = /female|woman|zira|samantha|victoria|aria|jenny|lana|ana|ivana|marija|milena|natasha|katja|helena|hazel|susan|linda|eva|sonia|sara|tessa/i
    const maleName = /male|man|mark|david|george|guy|matej|nikola|stefan|daniel|james/i
    const regional = voices.filter(v => /^hr|^sr|^bs/i.test(v.lang))
    const selected = regional.find(v => femaleName.test(v.name)) || voices.find(v => femaleName.test(v.name)) || regional.find(v => !maleName.test(v.name))
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
