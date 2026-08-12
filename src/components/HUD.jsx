import { useEffect, useRef, useState } from 'react'
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
const ORBIT_COUNTS = ZONES.map((_, index) => index + 2)

function ActivityMeter({ value }) {
  const bars = [0, 1, 2, 3, 4]
  return <span className="hud-meter" style={{ '--activity': value }}>{bars.map(i => <i key={i} className={value * 5 > i ? 'on' : ''} />)}</span>
}

function NeuralMiniMap({ activity }) {
  return <div className="neural-minimap"><span className="map-core" />{ZONES.map((zone, i) => <i key={zone.name} className={activity[zone.name] > .55 ? 'active' : ''} style={{ '--i': i, '--zone': zone.color }} title={zone.name} />)}</div>
}

function PlanetaryPyramid({ runtime }) {
  const rows = [{ zone: { name: 'JONA AI', color: '#55ff76' }, count: 1 }, ...ZONES.map((zone, index) => ({ zone, count: ORBIT_COUNTS[index] }))]
  const y = index => 7 + index * 11.2
  const x = (item, count) => (item + 1) * 100 / (count + 1)
  const branches = rows.slice(1).flatMap((row, rowIndex) => {
    const parents = rows[rowIndex], childY = y(rowIndex + 1), parentY = y(rowIndex)
    return Array.from({ length: row.count }, (_, child) => {
      const parent = Math.min(parents.count - 1, Math.floor(child * parents.count / row.count))
      const path = `M ${x(parent, parents.count)} ${parentY + 2} V ${(parentY + childY) / 2} H ${x(child, row.count)} V ${childY - 2}`
      return <g key={`branch-${rowIndex}-${child}`}><path className="tree-wire" d={path} /><path className="tree-current" d={path} style={{ '--delay': `${-(rowIndex * .19 + child * .08)}s` }} /></g>
    })
  })
  const rails = rows.slice(1).flatMap((row, rowIndex) => Array.from({ length: row.count - 1 }, (_, item) => {
    const path = `M ${x(item, row.count)} ${y(rowIndex + 1)} H ${x(item + 1, row.count)}`
    return <g key={`rail-${rowIndex}-${item}`}><path className="tree-wire tree-rail" d={path} /><path className="tree-current tree-rail" d={path} style={{ '--delay': `${-(rowIndex * .22 + item * .11)}s` }} /></g>
  }))
  const select = name => {
    if (name === 'JONA AI') { runtime.focusSystem(null); runtime.setPyramidOpen(false); return }
    runtime.activateSystem(name); runtime.setSystemIntensity(name, 1); runtime.focusSystem(name); runtime.setPyramidOpen(false)
  }
  return <div className="pyramid-window tree-window"><div className="pyramid-head"><div><span>JONA AI CORE DATABASE</span><h2>PLANETARY PYRAMID</h2></div><button onClick={() => runtime.setPyramidOpen(false)}>CLOSE ×</button></div><p>44 FUNCTIONAL NODES · 8 ORBITAL LEVELS · SELECT A PLANET</p><div className="planet-tree"><svg aria-hidden="true" viewBox="0 0 100 100" preserveAspectRatio="none"><defs><filter id="tree-glow"><feGaussianBlur stdDeviation=".42" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>{branches}{rails}</svg>{rows.map((row, rowIndex) => <div className="tree-row" key={row.zone.name} style={{ '--row-y': `${y(rowIndex)}%` }}>{Array.from({ length: row.count }, (_, item) => <button key={item} onClick={() => select(row.zone.name)} style={{ '--node-color': row.zone.color }}><i /><span>{row.zone.name === 'JONA AI' ? 'JONA AI' : `${row.zone.name} ${String(item + 1).padStart(2, '0')}`}</span><small>{rowIndex ? `ORBIT ${rowIndex}` : 'CORE'}</small></button>)}</div>)}</div><small>Svaka kartica predstavlja jednu planetu i aktivira njen orbitalni sistem.</small></div>
}

export default function HUD() {
  const runtime = useNeuralState(), voice = useVoice(), date = new Date(runtime.runtimeNow)
  const [scanning, setScanning] = useState(false), [clock24, setClock24] = useState(true), [hudExpanded, setHudExpanded] = useState(true)
  const scanTimers = useRef([])
  const focus = runtime.focusedSystem, details = runtime.hoveredSystem
  const nearby = runtime.nearbySystem, planetInfo = nearby ? PLANET_INFO[nearby] : null
  const status = runtime.state === 'ERROR' ? 'DEGRADED' : 'ONLINE'
  const conversation = runtime.state === 'IDLE' ? 'READY' : runtime.state
  const routeStep = runtime.signal.step
  const runScan = () => {
    if (scanning) return
    setScanning(true); runtime.resetActivity()
    ZONES.forEach((zone, index) => scanTimers.current.push(setTimeout(() => {
      runtime.setSystemIntensity(zone.name, 1)
      if (index) runtime.sendSignal(ZONES[index - 1].name, zone.name)
      scanTimers.current.push(setTimeout(() => runtime.setSystemIntensity(zone.name, .16), 520))
    }, index * 330)))
    scanTimers.current.push(setTimeout(() => { runtime.resetActivity(); setScanning(false) }, ZONES.length * 330 + 650))
  }
  const centerCore = () => { runtime.focusSystem(null); runtime.setNearbySystem(null) }
  useEffect(() => () => scanTimers.current.forEach(clearTimeout), [])
  return <>
    {runtime.pyramidOpen && <PlanetaryPyramid runtime={runtime} />}
    {focus && <div className="focus-mode"><span>{focus} SYSTEM</span><strong>FOCUS MODE</strong><button onClick={() => runtime.focusSystem(null)}>← BACK TO JONA CORE</button></div>}
    <section className="hud identity live-status panel-corners">
      <div className="eyebrow">LIVE SYSTEM INTELLIGENCE</div><h1>JONA <em>AI</em></h1><p>NEURAL COMMAND SYSTEM</p>
      <div className="status-grid"><span>SYSTEM<b className={status === 'ONLINE' ? 'ok' : 'warn'}>{status}</b></span><span>CORE STATUS<b>{runtime.state === 'PROCESSING' ? 'ACTIVE' : 'STABLE'}</b></span><span>NEURAL ACTIVITY<b>{runtime.state}</b></span><span>VOICE SYSTEM<b>{voice.status}</b></span><span>CONVERSATION<b>{conversation}</b></span><span>CONNECTION<b>LOCAL / {AI_MODE}</b></span></div>
      <div className="core-load"><div><span>CORE LOAD <em>VISUAL</em></span><b>{runtime.coreLoad}%</b></div><i><u style={{ width: `${runtime.coreLoad}%` }} /></i></div>
      <div className="runtime-row"><span>SIGNAL DENSITY<b>{runtime.signalDensity}</b></span><span>SYSTEM ENERGY<b>{runtime.systemEnergy}</b></span></div>
      <div className="hud-actions"><button className={scanning ? 'active' : ''} onClick={runScan} disabled={scanning}>{scanning ? 'SCANNING...' : 'SYSTEM SCAN'}</button><button onClick={centerCore}>CENTER CORE</button></div>
    </section>

    <section className={`hud systems intelligence-panel panel-corners ${hudExpanded ? '' : 'collapsed'}`}>
      <div className="clock"><button onClick={() => setClock24(value => !value)} title="Promijeni format vremena"><b>{date.toLocaleTimeString(clock24 ? 'en-GB' : 'en-US')}</b><small>{clock24 ? '24H' : '12H'}</small></button><span>{date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}</span></div>
      <div className="hud-panel-tools"><button onClick={() => setHudExpanded(value => !value)}>{hudExpanded ? 'MINIMIZE DATA' : 'EXPAND DATA'}</button><button onClick={runScan} disabled={scanning}>{scanning ? 'SCAN ACTIVE' : 'RUN SCAN'}</button></div>
      <div className="hud-panel-body">
      <div className="session-data"><span>SESSION<b>{fmtTime(runtime.sessionSeconds)}</b></span><span>REQUESTS<b>{String(runtime.requestCount).padStart(3, '0')}</b></span><span>CURRENT MODE<b className={`mode-${runtime.state.toLowerCase()}`}>{runtime.state}</b></span></div>
      {focus ? <div className="focus-systems"><div className="eyebrow">{focus} MATRIX / SUBSYSTEMS</div>{SUBSYSTEMS[focus].map((name, i) => <div key={name}><span>{name}</span><ActivityMeter value={Math.max(.18, runtime.systemActivity[focus] - i * .07)} /></div>)}</div> : <div className="activity-systems"><div className="eyebrow">LIVE NEURAL ACTIVITY</div>{ZONES.map(zone => <div key={zone.name}><span>{zone.name}</span><ActivityMeter value={runtime.systemActivity[zone.name]} /></div>)}</div>}
      <div className="route-panel"><span>ACTIVE SIGNAL ROUTE</span><div>{runtime.activeRoute.length ? runtime.activeRoute.map((name, i) => <b key={`${name}-${i}`} className={i === routeStep || i === routeStep + 1 ? 'active' : i < routeStep ? 'passed' : ''}>{name}{i < runtime.activeRoute.length - 1 && <i>→</i>}</b>) : <em>AMBIENT NEURAL FLOW</em>}</div></div>
      <div className="map-row"><NeuralMiniMap activity={runtime.systemActivity} /><div><span>CORE</span><b>{runtime.coreLoad}%</b><small>RUNTIME ACTIVITY MAP</small></div></div>
      <details className="voice-settings"><summary>VOICE SETTINGS</summary><label><span>VOICE</span><button onClick={() => voice.updateSetting('voiceOn', !voice.settings.voiceOn)}>{voice.settings.voiceOn ? 'ON' : 'OFF'}</button></label><label><span>AUTO SPEAK</span><button onClick={() => voice.updateSetting('autoSpeak', !voice.settings.autoSpeak)}>{voice.settings.autoSpeak ? 'ON' : 'OFF'}</button></label><label><span>MIC SENSITIVITY</span><input type="range" min="0.1" max="1" step="0.05" value={voice.settings.sensitivity} onChange={e => voice.updateSetting('sensitivity', Number(e.target.value))} /></label><label><span>RESPONSE VOLUME</span><input type="range" min="0" max="1" step="0.05" value={voice.settings.volume} onChange={e => voice.updateSetting('volume', Number(e.target.value))} /></label></details>
      </div>
    </section>
    <aside className={`planet-intel-card ${nearby ? 'visible' : ''}`}>
      {planetInfo && <><div className="planet-arrival"><i /> ARRIVAL CONFIRMED</div><div className="eyebrow">CURRENT LOCATION</div><h3>{nearby} <em>PLANET</em></h3><strong>{planetInfo.type}</strong><p>{planetInfo.text}</p><div className="planet-contents"><span>UNUTAR PLANETE</span>{planetInfo.inside.map(item => <b key={item}>{item}</b>)}</div><small>ORBITAL LINK · {CONNECTIONS[nearby]}</small></>}
    </aside>
    {details && !focus && <aside className="hover-intel"><div className="eyebrow">SYSTEM DETAIL</div><strong>{details} MATRIX</strong><span>STATUS <b>{runtime.systemActivity[details] > .55 ? 'ACTIVE' : 'STABLE'}</b></span><span>ACTIVITY <b>{Math.round(runtime.systemActivity[details] * 100)}%</b></span><span>SIGNALS <b>{Math.round(runtime.systemActivity[details] * 14)}</b></span><span>CONNECTED <b>{CONNECTIONS[details]}</b></span></aside>}
    {voice.notice && <div className="voice-notice">{voice.notice}</div>}
    <div className="telemetry left">RUNTIME VISUALIZATION · NOT MODEL INTERNALS</div><div className="telemetry right">LOCAL SESSION · PRIVATE SYSTEM</div>
  </>
}
