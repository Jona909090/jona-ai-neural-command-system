class NeuralAudioEngine {
  constructor() { this.ctx = null; this.master = null; this.hum = null; this.enabled = true }

  start() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)()
      this.master = this.ctx.createGain(); this.master.gain.value = .32; this.master.connect(this.ctx.destination)
    }
    this.ctx.resume(); this.rumble()
  }

  setEnabled(value) {
    this.enabled = value
    if (this.master && this.ctx) this.master.gain.setTargetAtTime(value ? .32 : 0, this.ctx.currentTime, .04)
  }

  tone(freq, duration, type = 'sine', volume = .12, endFreq = null) {
    if (!this.ctx) return
    const now = this.ctx.currentTime, osc = this.ctx.createOscillator(), gain = this.ctx.createGain()
    osc.type = type; osc.frequency.setValueAtTime(freq, now)
    if (endFreq) osc.frequency.exponentialRampToValueAtTime(endFreq, now + duration)
    gain.gain.setValueAtTime(.0001, now); gain.gain.exponentialRampToValueAtTime(volume, now + .025)
    gain.gain.exponentialRampToValueAtTime(.0001, now + duration)
    osc.connect(gain); gain.connect(this.master); osc.start(now); osc.stop(now + duration + .05)
  }

  noise(duration = .12, volume = .08, filterFreq = 1800) {
    if (!this.ctx) return
    const length = Math.ceil(this.ctx.sampleRate * duration), buffer = this.ctx.createBuffer(1, length, this.ctx.sampleRate), data = buffer.getChannelData(0)
    for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / length)
    const src = this.ctx.createBufferSource(), filter = this.ctx.createBiquadFilter(), gain = this.ctx.createGain()
    src.buffer = buffer; filter.type = 'bandpass'; filter.frequency.value = filterFreq; filter.Q.value = 2.4; gain.gain.value = volume
    src.connect(filter); filter.connect(gain); gain.connect(this.master); src.start()
  }

  rumble() { this.tone(34, 4.8, 'sine', .18, 46); this.tone(51, 4.2, 'triangle', .045, 62) }
  pulse(power = 1) { this.tone(48, .38, 'sine', .16 * power, 31); this.noise(.06, .025 * power, 900) }
  click(index = 0) { this.tone(420 + index * 53, .12, 'square', .035, 180 + index * 20); this.noise(.06, .045, 2800) }
  charge() { this.tone(55, 2.3, 'sawtooth', .035, 310); this.tone(110, 2.3, 'sine', .07, 760) }
  impact() { this.tone(58, 1.4, 'sine', .42, 24); this.tone(145, .55, 'sawtooth', .12, 38); this.noise(.55, .2, 520) }
  activate(index) { this.tone(240 + index * 42, .28, 'sine', .09, 610 + index * 38); this.click(index) }
  online() { this.impact(); setTimeout(() => this.tone(330, 1.5, 'sine', .08, 660), 90); this.ambient() }
  ambient() {
    if (!this.ctx || this.hum) return
    const osc = this.ctx.createOscillator(), gain = this.ctx.createGain(), filter = this.ctx.createBiquadFilter()
    osc.type = 'sine'; osc.frequency.value = 43; gain.gain.value = .025; filter.type = 'lowpass'; filter.frequency.value = 110
    osc.connect(filter); filter.connect(gain); gain.connect(this.master); osc.start(); this.hum = { osc, gain }
  }
  stopIntro() { if (this.ctx) this.ambient() }
}

export const neuralAudio = new NeuralAudioEngine()
