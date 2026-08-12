import { ZONES } from '../config/neuralConfig'
import { AI_MODE } from '../config/aiConfig'
import { useNeuralState } from '../state/NeuralStateContext'
import { useVoice } from '../controllers/VoiceContext'

const SUBSYSTEMS = {
  LANGUAGE: ['INPUT', 'SEMANTICS', 'INTENT', 'TRANSLATION', 'COMPOSITION', 'OUTPUT'], MEMORY: ['SHORT TERM', 'LONG TERM', 'CONTEXT', 'PROJECTS', 'KNOWLEDGE', 'PATTERNS'], LOGIC: ['ANALYSIS', 'REASONING', 'VALIDATION', 'DECISION', 'CALCULATION'], VISION: ['OBJECTS', 'STRUCTURE', 'DETAIL', 'SPATIAL', 'INTERPRETATION'], CREATIVE: ['IDEAS', 'DESIGN', 'WRITING', 'VARIATION', 'IMAGINATION'], PLANNING: ['GOALS', 'TASKS', 'PRIORITIES', 'SEQUENCE', 'EXECUTION'], CONTEXT: ['CURRENT INPUT', 'SESSION', 'HISTORY', 'RELATIONSHIPS', 'RELEVANCE'], RESPONSE: ['COMPOSITION', 'CHECK', 'FORMAT', 'VOICE', 'OUTPUT'],
}
const CONNECTIONS = { LANGUAGE: 'CONTEXT · LOGIC · CORE', MEMORY: 'LOGIC · CONTEXT · CORE', LOGIC: 'MEMORY · PLANNING · CORE', VISION: 'CONTEXT · CREATIVE · CORE', CREATIVE: 'MEMORY · PLANNING · CORE', PLANNING: 'LOGIC · RESPONSE · CORE', CONTEXT: 'LANGUAGE · MEMORY · CORE', RESPONSE: 'PLANNING · CORE · OUTPUT' }
const PLANET_INFO = {
  LANGUAGE: { type: 'COMMUNICATION WORLD', text: 'Pretvara ulaz u značenje i priprema jasnu poruku.', inside: ['INPUT', 'SEMANTICS', 'INTENT', 'TRANSLATION'] },
  MEMORY: { type: 'MEMORY ARCHIVE', text: 'Čuva kontekst aktivne sesije i organizuje dostupno znanje.', inside: ['SHORT TERM', 'LONG TERM', 'KNOWLEDGE', 'PATTERNS'] },
  LOGIC: { type: 'REASONING WORLD', text: 'Analizira informacije, provjerava odnose i donosi odluke.', inside: ['ANALYSIS', 'REASONING', 'VALIDATION', 'DECISION'] },
  VISION: { type: 'VISUAL WORLD', text: 'Predstavlja razumijevanje objekata, prostora i vizuelnih detalja.', inside: ['OBJECTS', 'STRUCTURE', 'SPATIAL', 'INTERPRETATION'] },
  CREATIVE: { type: 'CREATIVE WORLD', text: 'Razvija ideje, varijacije, stil i nove kombinacije.', inside: ['IDEAS', 'DESIGN', 'WRITING', 'IMAGINATION'] },
  PLANNING: { type: 'PLANNING WORLD', text: 'Pretvara ciljeve u prioritete, korake i izvršive sekvence.', inside: ['GOALS', 'TASKS', 'PRIORITIES', 'EXECUTION'] },
  CONTEXT: { type: 'CONTEXT WORLD', text: 'Povezuje trenutni upit sa sesijom, istorijom i relevantnim odnosima.', inside: ['CURRENT INPUT', 'SESSION', 'HISTORY', 'RELEVANCE'] },
  RESPONSE: { type: 'OUTPUT WORLD', text: 'Sastavlja, provjerava i isporučuje završni JONA odgovor.', inside: ['COMPOSITION', 'CHECK', 'VOICE', 'OUTPUT'] },
}
const fmtTime = seconds => [Math.floor(seconds / 3600), Math.floor(seconds / 60) % 60, seconds % 60].map(value => String(value).padStart(2, '0')).join(':')

function ActivityMeter({ value }) {
  const bars = [0, 1, 2, 3, 4]
  return <span className="hud-meter" style={{ '--activity': value }}>{bars.map(i => <i key={i} className={value * 5 > i ? 'on' : ''} />)}</span>
}

function NeuralMiniMap({ activity }) {
  return <div className="neural-minimap"><span className="map-core" />{ZONES.map((zone, i) => <i key={zone.name} className={activity[zone.name] > .55 ? 'active' : ''} style={{ '--i': i, '--zone': zone.color }} title={zone.name} />)}</div>
}

export default function HUD() {
  const runtime = useNeuralState(), voice = useVoice(), date = new Date(runtime.runtimeNow)
  const focus = runtime.focusedSystem, details = runtime.hoveredSystem
  const nearby = runtime.nearbySystem, planetInfo = nearby ? PLANET_INFO[nearby] : null
  const status = runtime.state === 'ERROR' ? 'DEGRADED' : 'ONLINE'
  const conversation = runtime.state === 'IDLE' ? 'READY' : runtime.state
  const routeStep = runtime.signal.step
  return <>
    {focus && <div className="focus-mode"><span>{focus} SYSTEM</span><strong>FOCUS MODE</strong><button onClick={() => runtime.focusSystem(null)}>← BACK TO JONA CORE</button></div>}
    <section className="hud identity live-status panel-corners">
      <div className="eyebrow">LIVE SYSTEM INTELLIGENCE</div><h1>JONA <em>AI</em></h1><p>NEURAL COMMAND SYSTEM</p>
      <div className="status-grid"><span>SYSTEM<b className={status === 'ONLINE' ? 'ok' : 'warn'}>{status}</b></span><span>CORE STATUS<b>{runtime.state === 'PROCESSING' ? 'ACTIVE' : 'STABLE'}</b></span><span>NEURAL ACTIVITY<b>{runtime.state}</b></span><span>VOICE SYSTEM<b>{voice.status}</b></span><span>CONVERSATION<b>{conversation}</b></span><span>CONNECTION<b>LOCAL / {AI_MODE}</b></span></div>
      <div className="core-load"><div><span>CORE LOAD <em>VISUAL</em></span><b>{runtime.coreLoad}%</b></div><i><u style={{ width: `${runtime.coreLoad}%` }} /></i></div>
      <div className="runtime-row"><span>SIGNAL DENSITY<b>{runtime.signalDensity}</b></span><span>SYSTEM ENERGY<b>{runtime.systemEnergy}</b></span></div>
    </section>

    <section className="hud systems intelligence-panel panel-corners">
      <div className="clock"><b>{date.toLocaleTimeString('en-GB')}</b><span>{date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}</span></div>
      <div className="session-data"><span>SESSION<b>{fmtTime(runtime.sessionSeconds)}</b></span><span>REQUESTS<b>{String(runtime.requestCount).padStart(3, '0')}</b></span><span>CURRENT MODE<b className={`mode-${runtime.state.toLowerCase()}`}>{runtime.state}</b></span></div>
      {focus ? <div className="focus-systems"><div className="eyebrow">{focus} MATRIX / SUBSYSTEMS</div>{SUBSYSTEMS[focus].map((name, i) => <div key={name}><span>{name}</span><ActivityMeter value={Math.max(.18, runtime.systemActivity[focus] - i * .07)} /></div>)}</div> : <div className="activity-systems"><div className="eyebrow">LIVE NEURAL ACTIVITY</div>{ZONES.map(zone => <div key={zone.name}><span>{zone.name}</span><ActivityMeter value={runtime.systemActivity[zone.name]} /></div>)}</div>}
      <div className="route-panel"><span>ACTIVE SIGNAL ROUTE</span><div>{runtime.activeRoute.length ? runtime.activeRoute.map((name, i) => <b key={`${name}-${i}`} className={i === routeStep || i === routeStep + 1 ? 'active' : i < routeStep ? 'passed' : ''}>{name}{i < runtime.activeRoute.length - 1 && <i>→</i>}</b>) : <em>AMBIENT NEURAL FLOW</em>}</div></div>
      <div className="map-row"><NeuralMiniMap activity={runtime.systemActivity} /><div><span>CORE</span><b>{runtime.coreLoad}%</b><small>RUNTIME ACTIVITY MAP</small></div></div>
      <details className="voice-settings"><summary>VOICE SETTINGS</summary><label><span>VOICE</span><button onClick={() => voice.updateSetting('voiceOn', !voice.settings.voiceOn)}>{voice.settings.voiceOn ? 'ON' : 'OFF'}</button></label><label><span>AUTO SPEAK</span><button onClick={() => voice.updateSetting('autoSpeak', !voice.settings.autoSpeak)}>{voice.settings.autoSpeak ? 'ON' : 'OFF'}</button></label><label><span>MIC SENSITIVITY</span><input type="range" min="0.1" max="1" step="0.05" value={voice.settings.sensitivity} onChange={e => voice.updateSetting('sensitivity', Number(e.target.value))} /></label><label><span>RESPONSE VOLUME</span><input type="range" min="0" max="1" step="0.05" value={voice.settings.volume} onChange={e => voice.updateSetting('volume', Number(e.target.value))} /></label></details>
    </section>
    <aside className={`planet-intel-card ${nearby ? 'visible' : ''}`}>
      {planetInfo && <><div className="planet-arrival"><i /> ARRIVAL CONFIRMED</div><div className="eyebrow">CURRENT LOCATION</div><h3>{nearby} <em>PLANET</em></h3><strong>{planetInfo.type}</strong><p>{planetInfo.text}</p><div className="planet-contents"><span>UNUTAR PLANETE</span>{planetInfo.inside.map(item => <b key={item}>{item}</b>)}</div><small>ORBITAL LINK · {CONNECTIONS[nearby]}</small></>}
    </aside>
    {details && !focus && <aside className="hover-intel"><div className="eyebrow">SYSTEM DETAIL</div><strong>{details} MATRIX</strong><span>STATUS <b>{runtime.systemActivity[details] > .55 ? 'ACTIVE' : 'STABLE'}</b></span><span>ACTIVITY <b>{Math.round(runtime.systemActivity[details] * 100)}%</b></span><span>SIGNALS <b>{Math.round(runtime.systemActivity[details] * 14)}</b></span><span>CONNECTED <b>{CONNECTIONS[details]}</b></span></aside>}
    {voice.notice && <div className="voice-notice">{voice.notice}</div>}
    <div className="telemetry left">RUNTIME VISUALIZATION · NOT MODEL INTERNALS</div><div className="telemetry right">LOCAL SESSION · PRIVATE SYSTEM</div>
  </>
}
