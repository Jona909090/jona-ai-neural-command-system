import { ZONES } from '../config/neuralConfig'
import { useNeuralState } from '../state/NeuralStateContext'

export default function HUD() {
  const { state, focusedSystem, focusSystem } = useNeuralState()
  return <>
    {focusedSystem && <div className="focus-mode"><span>{focusedSystem} SYSTEM</span><strong>FOCUS MODE</strong><button onClick={() => focusSystem(null)}>← BACK TO JONA CORE</button></div>}
    <section className="hud identity panel-corners">
      <div className="eyebrow">NEURAL INTERFACE / 01</div><h1>JONA <em>AI</em></h1>
      <p>NEURAL COMMAND SYSTEM</p>
      <dl><div><dt>SYSTEM STATUS</dt><dd><i /> ONLINE</dd></div><div><dt>NEURAL ACTIVITY</dt><dd>{state}</dd></div></dl>
      <div className="activity-wave"><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /></div>
      <div className="metrics"><span>TOTAL NODES<b>1,287,450</b></span><span>ACTIVE CONNECTIONS<b>98,754,221</b></span><span>PROCESSING SPEED<b>2.48 PFLOPS</b></span><span>CORE TEMPERATURE<b>32.7°C</b></span></div>
      <div className="power-dial"><div><strong>100%</strong><small>OPTIMAL</small></div></div>
    </section>
    <section className="hud systems panel-corners">
      <div className="eyebrow">REALTIME MONITOR</div><h2>ACTIVE SYSTEMS</h2>
      <ul>{ZONES.map(z => <li key={z.name}><span>{z.name}</span><b className={z.status === 'STANDBY' ? 'standby' : ''}>{z.status}</b></li>)}</ul>
      <div className="pulse-monitor"><span>NEURAL PULSE</span><svg viewBox="0 0 180 65" preserveAspectRatio="none"><polyline points="0,52 15,45 25,50 38,22 52,44 67,33 82,47 97,17 111,42 126,29 142,48 158,24 180,46"/><polyline points="0,56 18,50 31,33 47,51 62,20 79,46 94,29 111,50 128,35 145,54 162,31 180,49"/></svg></div>
    </section>
    <div className="telemetry left">SYS.01 &nbsp; // &nbsp; CORE TEMP 36.7°</div>
    <div className="telemetry right">ENCRYPTED CHANNEL &nbsp; ● &nbsp; 2048 Q-BIT</div>
  </>
}
