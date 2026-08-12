import { useEffect, useRef, useState } from 'react'
import { useNeuralState } from '../state/NeuralStateContext'

const GLYPHS = '01JONAアイシステムデータNEURAL<>[]{}'

function MatrixCurtain() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')
    let frame, columns = [], last = 0

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.floor(innerWidth * ratio)
      canvas.height = Math.floor(innerHeight * ratio)
      canvas.style.width = `${innerWidth}px`
      canvas.style.height = `${innerHeight}px`
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
      columns = Array.from({ length: Math.ceil(innerWidth / 18) }, () => Math.random() * -45)
    }
    const draw = time => {
      if (time - last > 42) {
        context.fillStyle = 'rgba(0, 4, 1, .16)'
        context.fillRect(0, 0, innerWidth, innerHeight)
        context.font = '14px DM Mono, monospace'
        columns.forEach((y, index) => {
          const character = GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
          const bright = Math.random() > .91
          context.fillStyle = bright ? '#effff1' : Math.random() > .68 ? '#7dff94' : '#18d84a'
          context.shadowColor = '#28ff5c'
          context.shadowBlur = bright ? 22 : 9
          context.fillText(character, index * 18, y * 18)
          columns[index] = y * 18 > innerHeight && Math.random() > .965 ? Math.random() * -22 : y + .72 + Math.random() * .48
        })
        last = time
      }
      frame = requestAnimationFrame(draw)
    }
    resize(); window.addEventListener('resize', resize); frame = requestAnimationFrame(draw)
    return () => { cancelAnimationFrame(frame); window.removeEventListener('resize', resize) }
  }, [])

  return <canvas ref={canvasRef} className="matrix-curtain" aria-hidden="true" />
}

export default function StartupSequence({ onProgress, onComplete }) {
  const { startSession } = useNeuralState()
  const [started, setStarted] = useState(false), [phase, setPhase] = useState('gate')
  const timers = useRef([]), finished = useRef(false)

  const finish = (skipped = false) => {
    if (finished.current) return
    finished.current = true; timers.current.forEach(clearTimeout)
    setPhase('reveal'); onProgress({ started: true, phase: 'reveal', progress: 1, zone: 7 })
    timers.current.push(setTimeout(onComplete, skipped ? 120 : 900))
  }
  const enter = () => {
    setStarted(true); setPhase('matrix'); startSession()
    onProgress({ started: true, phase: 'matrix', progress: 0, zone: -1 })
    timers.current.push(setTimeout(() => finish(false), 5000))
  }
  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  return <div className={`startup-cinematic matrix-startup ${started ? 'started' : ''} phase-${phase}`}>
    {!started ? <div className="entry-gate">
      <div className="gate-glyph"><i /><span>J</span></div>
      <div className="gate-kicker">NEURAL COMMAND SYSTEM</div><h1>JONA <em>AI</em></h1>
      <button className="enter-jona" onClick={enter}><span>ENTER JONA AI</span><i>↗</i></button>
      <p>AUTHORIZED NEURAL INTERFACE</p>
    </div> : <><MatrixCurtain /><div className="matrix-vignette" /><div className="matrix-status"><b>JONA AI</b><span>PLANETARY SYSTEM INITIALIZING</span><i /></div></>}
    {started && <div className="intro-controls"><button onClick={() => finish(true)}>SKIP INTRO</button></div>}
  </div>
}
