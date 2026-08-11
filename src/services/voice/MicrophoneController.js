import { VOICE_CONFIG } from '../../config/voiceConfig'

export class MicrophoneController {
  constructor() { this.stream = null; this.context = null; this.analyser = null; this.frame = 0; this.active = false; this.lastVoiceAt = 0; this.speechStartedAt = 0; this.hadSpeech = false }

  async start({ sensitivity, onLevel, onSpeechStart, onPeak, onSilence }) {
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }, video: false })
    this.context = new (window.AudioContext || window.webkitAudioContext)(); await this.context.resume()
    const source = this.context.createMediaStreamSource(this.stream); this.analyser = this.context.createAnalyser(); this.analyser.fftSize = VOICE_CONFIG.analyserFftSize; this.analyser.smoothingTimeConstant = .72; source.connect(this.analyser)
    const values = new Uint8Array(this.analyser.frequencyBinCount), threshold = .018 + (1 - sensitivity) * .055
    this.active = true; this.lastVoiceAt = performance.now()
    const analyse = now => {
      if (!this.active) return
      this.analyser.getByteTimeDomainData(values); let sum = 0, peak = 0
      for (const value of values) { const sample = Math.abs((value - 128) / 128); sum += sample * sample; peak = Math.max(peak, sample) }
      const rms = Math.min(1, Math.sqrt(sum / values.length) * 4.8); onLevel(rms)
      if (rms > threshold) {
        this.lastVoiceAt = now
        if (!this.hadSpeech) { this.hadSpeech = true; this.speechStartedAt = now; onSpeechStart() }
        if (peak > threshold * 3.1) onPeak(rms)
      } else if (this.hadSpeech && now - this.speechStartedAt > VOICE_CONFIG.minimumSpeechMs && now - this.lastVoiceAt > VOICE_CONFIG.silenceThresholdMs) { onSilence(); return }
      this.frame = requestAnimationFrame(analyse)
    }
    this.frame = requestAnimationFrame(analyse)
  }

  async stop() {
    this.active = false; cancelAnimationFrame(this.frame); this.stream?.getTracks().forEach(track => track.stop()); this.stream = null
    if (this.context && this.context.state !== 'closed') await this.context.close()
    this.context = null; this.analyser = null; this.hadSpeech = false
  }
}
