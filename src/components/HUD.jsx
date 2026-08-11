import { ZONES } from '../config/neuralConfig'
import { useNeuralState } from '../state/NeuralStateContext'
import { useVoice } from '../controllers/VoiceContext'

export default function HUD() {
  const { state, focusedSystem, focusSystem } = useNeuralState()
  const voice = useVoice()
  return <>
    {focusedSystem && <div className="focus-mode"><span>{focusedSystem} SYSTEM</span><strong>FOCUS MODE</strong><button onClick={() => focusSystem(null)}>← BACK TO JONA CORE</button></div>}
    <section className="hud identity panel-corners">
      <div className="eyebrow">NEURAL INTERFACE / 01</div><h1>JONA <em>AI</em></h1>
      <p>NEURAL COMMAND SYSTEM</p>
      <dl><div><dt>SYSTEM STATUS</dt><dd><i /> ONLINE</dd></div><div><dt>NEURAL ACTIVITY</dt><dd>{state}</dd></div></dl>
      <div className="activity-wave"><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /></div>
      <div className="metrics"><span>VISUAL NODES<b>1,287 <em>DEMO</em></b></span><span>VISUAL CONNECTIONS<b>9,875 <em>DEMO</em></b></span><span>ACTIVITY INDEX<b>82.4% <em>SIMULATED</em></b></span><span>CORE TEMPERATURE<b>32.7°C <em>UI</em></b></span></div>
      <div className="power-dial"><div><strong>100%</strong><small>OPTIMAL</small></div></div>
    </section>
    <section className="hud systems panel-corners">
      <div className="eyebrow">REALTIME MONITOR</div><h2>ACTIVE SYSTEMS</h2>
      <ul>{ZONES.map(z => <li key={z.name}><span>{z.name}</span><b className={z.status === 'STANDBY' ? 'standby' : ''}>{z.status}</b></li>)}</ul>
      <div className="voice-status"><span>VOICE SYSTEM</span><b>{voice.status}</b><i style={{ '--level': voice.amplitude }} /></div>
      <div className="pulse-monitor"><span>NEURAL PULSE</span><svg viewBox="0 0 180 65" preserveAspectRatio="none"><polyline points="0,52 15,45 25,50 38,22 52,44 67,33 82,47 97,17 111,42 126,29 142,48 158,24 180,46"/><polyline points="0,56 18,50 31,33 47,51 62,20 79,46 94,29 111,50 128,35 145,54 162,31 180,49"/></svg></div>
      <details className="voice-settings"><summary>VOICE SETTINGS</summary><label><span>VOICE</span><button onClick={() => voice.updateSetting('voiceOn', !voice.settings.voiceOn)}>{voice.settings.voiceOn ? 'ON' : 'OFF'}</button></label><label><span>AUTO SPEAK</span><button onClick={() => voice.updateSetting('autoSpeak', !voice.settings.autoSpeak)}>{voice.settings.autoSpeak ? 'ON' : 'OFF'}</button></label><label><span>MIC SENSITIVITY</span><input type="range" min="0.1" max="1" step="0.05" value={voice.settings.sensitivity} onChange={e => voice.updateSetting('sensitivity', Number(e.target.value))} /></label><label><span>RESPONSE VOLUME</span><input type="range" min="0" max="1" step="0.05" value={voice.settings.volume} onChange={e => voice.updateSetting('volume', Number(e.target.value))} /></label></details>
    </section>
    {voice.notice && <div className="voice-notice">{voice.notice}</div>}
    <div className="telemetry left">SYS.01 &nbsp; // &nbsp; CORE TEMP 36.7°</div>
    <div className="telemetry right">ENCRYPTED CHANNEL &nbsp; ● &nbsp; 2048 Q-BIT</div>
  </>
}
