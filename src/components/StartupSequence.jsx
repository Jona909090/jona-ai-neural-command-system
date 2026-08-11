import { useEffect, useState } from 'react'

const steps = ['JONA AI', 'INITIALIZING NEURAL CORE...', 'MAPPING SYNAPTIC PATHWAYS...', 'SYSTEM ONLINE']
export default function StartupSequence({ onComplete }) {
  const [step, setStep] = useState(0)
  useEffect(() => {
    const timers = [650, 1550, 2750].map((t, i) => setTimeout(() => setStep(i + 1), t))
    timers.push(setTimeout(onComplete, 4100))
    return () => timers.forEach(clearTimeout)
  }, [onComplete])
  return <div className={`startup step-${step}`}>
    <div className="startup-mark"><span className="startup-ring" /><strong>JONA</strong><small>CORE</small></div>
    <p>{steps[step]}</p><div className="loader"><i /></div>
  </div>
}
