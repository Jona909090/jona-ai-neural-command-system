import { ZONES } from '../config/neuralConfig'
import { useNeuralState } from '../state/NeuralStateContext'

export default function HUD() {
  const { state } = useNeuralState()
  return <>
    <section className="hud identity panel-corners">
      <div className="eyebrow">NEURAL INTERFACE / 01</div><h1>JONA <em>AI</em></h1>
      <p>NEURAL COMMAND SYSTEM</p>
      <dl><div><dt>SYSTEM STATUS</dt><dd><i /> ONLINE</dd></div><div><dt>NEURAL ACTIVITY</dt><dd>{state}</dd></div></dl>
    </section>
    <section className="hud systems panel-corners">
      <div className="eyebrow">REALTIME MONITOR</div><h2>ACTIVE SYSTEMS</h2>
      <ul>{ZONES.map(z => <li key={z.name}><span>{z.name}</span><b className={z.status === 'STANDBY' ? 'standby' : ''}>{z.status}</b></li>)}</ul>
    </section>
    <div className="telemetry left">SYS.01 &nbsp; // &nbsp; CORE TEMP 36.7°</div>
    <div className="telemetry right">ENCRYPTED CHANNEL &nbsp; ● &nbsp; 2048 Q-BIT</div>
  </>
}
