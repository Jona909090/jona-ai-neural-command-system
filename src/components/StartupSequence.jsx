import { useEffect, useRef, useState } from 'react'
import { ZONES } from '../config/neuralConfig'
import { neuralAudio } from '../audio/NeuralAudioEngine'
import { useNeuralState } from '../state/NeuralStateContext'

const timeline = [
  [900, 'dark'], [1650, 'spark'], [2200, 'pulse1'], [2820, 'pulse2'], [3380, 'pulse3'],
  [3850, 'charge'], [5750, 'impact'], [6400, 'network'], [7000, 'identity'], [7600, 'zones'],
]

export default function StartupSequence({ onProgress, onComplete }) {
  const { startSession } = useNeuralState()
  const [started, setStarted] = useState(false), [phase, setPhase] = useState('gate')
  const [zone, setZone] = useState(-1), [sound, setSound] = useState(true)
  const timers = useRef([]), finished = useRef(false)

  const update = (next, progress = 0, zoneIndex = -1) => {
    setPhase(next); if (zoneIndex >= -1) setZone(zoneIndex)
    onProgress({ started: true, phase: next, progress, zone: zoneIndex })
  }

  const finish = (skipped = false) => {
    if (finished.current) return
    finished.current = true; timers.current.forEach(clearTimeout)
    neuralAudio.stopIntro(); update('online', 1, 7)
    if (!skipped) neuralAudio.online()
    timers.current.push(setTimeout(onComplete, skipped ? 120 : 1250))
  }

  const enter = () => {
    setStarted(true); startSession(); neuralAudio.start(); update('dark', 0)
    timeline.forEach(([time, next], index) => timers.current.push(setTimeout(() => {
      update(next, index / timeline.length)
      if (next.startsWith('pulse')) neuralAudio.pulse(next === 'pulse3' ? 1.6 : 1)
      if (next === 'spark') neuralAudio.click(1)
      if (next === 'charge') neuralAudio.charge()
      if (next === 'impact') neuralAudio.impact()
    }, time)))
    ZONES.forEach((_, i) => timers.current.push(setTimeout(() => {
      update('zones', .75 + i * .025, i); neuralAudio.activate(i)
      if (i === ZONES.length - 1) timers.current.push(setTimeout(() => finish(), 520))
    }, 7850 + i * 390)))
  }

  const toggleSound = () => { const next = !sound; setSound(next); neuralAudio.setEnabled(next) }
  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  return <div className={`startup-cinematic ${started ? 'started' : ''} phase-${phase}`}>
    {!started ? <div className="entry-gate">
      <div className="gate-glyph"><i /><span>J</span></div>
      <div className="gate-kicker">NEURAL COMMAND SYSTEM</div><h1>JONA <em>AI</em></h1>
      <button className="enter-jona" onClick={enter}><span>ENTER JONA AI</span><i>↗</i></button>
      <p>AUTHORIZED NEURAL INTERFACE</p>
    </div> : <>
      <div className="rgb-flash" /><div className="energy-origin"><i /><b /><span /></div>
      <div className="boot-copy">
        <h2>JONA <em>AI</em></h2>
        <p>{phase === 'online' ? 'SYSTEM ONLINE' : phase === 'zones' && zone >= 0 ? `${ZONES[zone].name} ONLINE` : 'INITIALIZING NEURAL CORE...'}</p>
        <div className="boot-track"><i style={{ width: `${Math.max(5, phase === 'zones' ? 78 + zone * 3 : 15)}%` }} /></div>
      </div>
      <div className="zone-boot-list">{ZONES.map((z, i) => <span key={z.name} className={i <= zone ? 'online' : ''}>{z.name}<b>{i <= zone ? 'ONLINE' : '—'}</b></span>)}</div>
    </>}
    <div className="intro-controls"><button onClick={toggleSound}>SOUND {sound ? 'ON' : 'OFF'}</button>{started && <button onClick={() => finish(true)}>SKIP INTRO</button>}</div>
  </div>
}
