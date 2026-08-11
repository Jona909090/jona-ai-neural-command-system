import { useFrame, useThree } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { CONFIG, ZONES } from '../config/neuralConfig'
import { useNeuralState } from '../state/NeuralStateContext'

const rand = (a, b) => a + Math.random() * (b - a)
const CORE_COLOR = new THREE.Color('#69eaff')
const LABELS = ['LANGUAGE CENTER', 'MEMORY MATRIX', 'LOGIC ENGINE', 'VISION ARRAY', 'CREATIVE UNIT', 'PLANNING NETWORK', 'CONTEXT SYSTEM', 'RESPONSE GENERATOR']

// Deliberately asymmetric, wide and deep — a system of systems, not a sphere.
const SYSTEMS = [
  { ...ZONES[0], color: '#ff2d9b', pos: [-5.7, 3.1, 1.0] },
  { ...ZONES[1], color: '#58ed4f', pos: [-6.2, -2.25, -1.5] },
  { ...ZONES[2], color: '#238cff', pos: [-1.8, 4.8, -2.0] },
  { ...ZONES[3], color: '#13e4ff', pos: [3.2, 4.25, 1.3] },
  { ...ZONES[4], color: '#ff8a19', pos: [6.15, 1.2, -1.1] },
  { ...ZONES[5], color: '#a84cff', pos: [-2.9, -4.55, 1.85] },
  { ...ZONES[6], color: '#ffd234', pos: [2.25, -4.35, -2.2] },
  { ...ZONES[7], color: '#27f0c1', pos: [6.0, -2.9, 1.75] },
]

const GLOBAL_LINKS = [[0, 6], [6, 1], [1, 2], [2, 5], [5, 7], [4, 1], [3, 6], [0, 2], [3, 4], [4, 7], [5, 6]]
const FLOW_ROUTE = [0, 6, 1, 2, -1, 7]
const SUB_CORE_NAMES = {
  LANGUAGE: ['INPUT', 'SEMANTICS', 'INTENT', 'TRANSLATION', 'COMPOSITION', 'OUTPUT', 'LEXICON', 'TONE'],
  MEMORY: ['SHORT TERM', 'LONG TERM', 'CONTEXT', 'PROJECTS', 'KNOWLEDGE', 'PATTERNS', 'RECALL', 'INDEX'],
  LOGIC: ['ANALYSIS', 'REASONING', 'VALIDATION', 'DECISION', 'CALCULATION', 'INFERENCE', 'RULES'],
  VISION: ['OBJECTS', 'STRUCTURE', 'DETAIL', 'SPATIAL', 'INTERPRETATION', 'DEPTH', 'MOTION'],
  CREATIVE: ['IDEAS', 'DESIGN', 'WRITING', 'VARIATION', 'IMAGINATION', 'STYLE', 'SYNTHESIS'],
  PLANNING: ['GOALS', 'TASKS', 'PRIORITIES', 'SEQUENCE', 'EXECUTION', 'RESOURCES', 'TIMING'],
  CONTEXT: ['CURRENT INPUT', 'SESSION', 'HISTORY', 'RELATIONSHIPS', 'RELEVANCE', 'SCOPE', 'REFERENCES'],
  RESPONSE: ['COMPOSITION', 'CHECK', 'FORMAT', 'VOICE', 'OUTPUT', 'QUALITY', 'DELIVERY'],
}

function addVertex(store, a, b, ca, cb = ca) {
  store.positions.push(a.x, a.y, a.z, b.x, b.y, b.z)
  store.colors.push(ca.r, ca.g, ca.b, cb.r, cb.g, cb.b)
}

function generateArchitecture() {
  const nodes = { positions: [], colors: [], sizes: [] }
  const local = { positions: [], colors: [] }, system = { positions: [], colors: [] }, global = { positions: [], colors: [] }
  const systemData = [], globalEdges = []
  const addNode = (p, color, size) => { nodes.positions.push(p.x, p.y, p.z); nodes.colors.push(color.r, color.g, color.b); nodes.sizes.push(size) }

  // Structured JONA CORE: layered inner nodes with visible internal relationships.
  const coreNodes = []
  for (let i = 0; i < 170; i++) {
    const r = Math.pow(Math.random(), .48) * 1.08, theta = rand(0, Math.PI * 2), phi = Math.acos(rand(-1, 1))
    const p = new THREE.Vector3(Math.sin(phi) * Math.cos(theta) * r, Math.cos(phi) * r, Math.sin(phi) * Math.sin(theta) * r)
    coreNodes.push(p); const c = CORE_COLOR.clone().lerp(new THREE.Color('#bd4dff'), Math.random() * .55); addNode(p, c, rand(1.2, 3.5))
  }
  for (let i = 0; i < 290; i++) { const a = coreNodes[Math.floor(Math.random() * coreNodes.length)], b = coreNodes[Math.floor(Math.random() * coreNodes.length)]; if (a.distanceTo(b) < 1.15) addVertex(local, a, b, CORE_COLOR) }

  SYSTEMS.forEach((zone, zoneIndex) => {
    const center = new THREE.Vector3(...zone.pos), color = new THREE.Color(zone.color), subCores = [], localNodes = []
    addNode(center, color.clone().lerp(new THREE.Color('white'), .35), 7)

    // Each main system owns 5–8 sub-cores, each with 8–18 satellite nodes.
    const subCount = 7 + (zoneIndex % 3)
    for (let s = 0; s < subCount; s++) {
      const angle = (s / subCount) * Math.PI * 2 + zoneIndex * .41
      const sub = center.clone().add(new THREE.Vector3(Math.cos(angle) * rand(.75, 1.45), Math.sin(angle) * rand(.58, 1.18), rand(-1.05, 1.05)))
      subCores.push(sub); addNode(sub, color.clone().lerp(new THREE.Color('white'), .18), rand(3.1, 4.8)); addVertex(system, center, sub, color.clone().multiplyScalar(.8), color)
      const satellites = 14 + ((s * 3 + zoneIndex) % 11), cluster = []
      for (let n = 0; n < satellites; n++) {
        const theta = rand(0, Math.PI * 2), phi = Math.acos(rand(-1, 1)), radius = rand(.12, .55)
        const p = sub.clone().add(new THREE.Vector3(Math.sin(phi) * Math.cos(theta) * radius, Math.cos(phi) * radius, Math.sin(phi) * Math.sin(theta) * radius * 1.6))
        cluster.push(p); localNodes.push(p); addNode(p, color.clone().lerp(new THREE.Color('#ffffff'), Math.random() * .2), rand(.7, 2.05)); addVertex(local, sub, p, color)
      }
      for (let n = 0; n < cluster.length * 2.25; n++) { const a = cluster[Math.floor(Math.random() * cluster.length)], b = cluster[Math.floor(Math.random() * cluster.length)]; if (a !== b) addVertex(local, a, b, color.clone().multiplyScalar(.76)) }
    }
    // Cross-link the sub-cores so each zone reads as a self-contained brain.
    subCores.forEach((sub, i) => { addVertex(system, sub, subCores[(i + 1) % subCores.length], color); addVertex(system, sub, subCores[(i + 2) % subCores.length], color.clone().multiplyScalar(.75)); if (i % 2 === 0) addVertex(system, sub, subCores[(i + 3) % subCores.length], color.clone().multiplyScalar(.58)) })
    systemData.push({ center, color, subCores, localNodes })
  })

  // Every main core receives a strong command pathway from JONA CORE.
  systemData.forEach(({ center, color }, i) => {
    const mid = center.clone().multiplyScalar(.48).add(new THREE.Vector3(rand(-.35, .35), rand(-.35, .35), rand(-.6, .6)))
    addVertex(global, new THREE.Vector3(), mid, CORE_COLOR, color); addVertex(global, mid, center, color.clone().lerp(CORE_COLOR, .3), color)
    globalEdges.push({ a: new THREE.Vector3(), b: center, from: -1, to: i, color })
  })
  GLOBAL_LINKS.forEach(([a, b]) => {
    const A = systemData[a], B = systemData[b], mixed = A.color.clone().lerp(B.color, .5)
    addVertex(global, A.center, B.center, A.color, B.color); globalEdges.push({ a: A.center, b: B.center, from: a, to: b, color: mixed })
  })

  const attribute = (array, size) => new THREE.Float32BufferAttribute(array, size)
  return {
    nodePositions: attribute(nodes.positions, 3), nodeColors: attribute(nodes.colors, 3),
    localPos: attribute(local.positions, 3), localCol: attribute(local.colors, 3),
    systemPos: attribute(system.positions, 3), systemCol: attribute(system.colors, 3),
    globalPos: attribute(global.positions, 3), globalCol: attribute(global.colors, 3),
    systemData, globalEdges,
  }
}

function EnergyRings({ color, radius = .38, speed = 1, intensity = 1 }) {
  const rings = useRef()
  useFrame(({ clock }, delta) => {
    rings.current.rotation.x += delta * .13 * speed; rings.current.rotation.y -= delta * .2 * speed
    const pulse = 1 + Math.sin(clock.elapsedTime * speed * 2.1) * .07; rings.current.scale.setScalar(pulse)
  })
  return <group ref={rings}>
    {[0, 1, 2].map(i => <mesh key={i} rotation={[i * .78, i * 1.04, i * .47]} scale={1 + i * .28}>
      <torusGeometry args={[radius, .008 + i * .003, 5, 64]} /><meshBasicMaterial color={color} transparent opacity={(0.72 - i * .16) * intensity} blending={THREE.AdditiveBlending} depthWrite={false} />
    </mesh>)}
  </group>
}

function JonaCore({ intensity }) {
  const shell = useRef()
  useFrame(({ clock }, delta) => { shell.current.rotation.y += delta * .09; shell.current.rotation.z -= delta * .035; const p = 1 + Math.sin(clock.elapsedTime * 1.65) * .035 + intensity * .025; shell.current.scale.setScalar(p) })
  return <group>
    <group ref={shell}><EnergyRings color="#65eaff" radius={1.12} speed={.55} intensity={.85} /><mesh><icosahedronGeometry args={[.88, 2]} /><meshBasicMaterial color="#8befff" wireframe transparent opacity={.33} /></mesh><mesh><icosahedronGeometry args={[.32, 1]} /><meshBasicMaterial color="#e7fbff" transparent opacity={.54} /></mesh></group>
    <pointLight color="#56dfff" intensity={2.2 + intensity * 2.4} distance={5.5} />
    <Html center distanceFactor={8} className="core-label"><strong>JONA AI</strong><span>CORE</span></Html>
  </group>
}

function SystemCore({ zone, index, active, hovered, focused, subCores, onHover, onFocus }) {
  const ref = useRef(), pulseSpeed = .72 + index * .11, names = SUB_CORE_NAMES[zone.name]
  useFrame(({ clock }) => { const boost = active ? .18 : 0, p = 1 + Math.sin(clock.elapsedTime * pulseSpeed * 2) * (.055 + boost); ref.current.scale.setScalar(p); ref.current.rotation.y += .003 + index * .0002 })
  return <group position={zone.pos}>
    <group ref={ref}>
      <mesh onClick={e => { e.stopPropagation(); onFocus(zone.name) }} onPointerOver={e => { e.stopPropagation(); onHover(index); document.body.style.cursor = 'pointer' }} onPointerOut={() => { onHover(null); document.body.style.cursor = 'default' }}><icosahedronGeometry args={[.28, 1]} /><meshBasicMaterial color={zone.color} wireframe /></mesh>
      <mesh><icosahedronGeometry args={[.12, 1]} /><meshBasicMaterial color="white" /></mesh>
      <EnergyRings color={zone.color} radius={.36} speed={pulseSpeed} intensity={active || hovered ? 1.5 : .9} />
      <pointLight color={zone.color} intensity={active || hovered ? 6 : 2.2} distance={3.4} />
    </group>
    {subCores.map((world, i) => <SubCore key={i} position={world.clone().sub(new THREE.Vector3(...zone.pos))} color={zone.color} name={names[i % names.length]} visible={focused || hovered} />)}
    <Html position={[index % 2 ? -1.08 : .72, index % 3 === 0 ? .72 : -.72, 0]} distanceFactor={11} className={`system-label ${active ? 'active' : ''}`}>
      <div><strong>{LABELS[index]}</strong><span>STATUS: {index === 7 ? 'READY' : 'ACTIVE'} · SIGNAL: {74 + index * 3}%</span></div><i />
    </Html>
  </group>
}

function SubCore({ position, color, name, visible }) {
  const [hover, setHover] = useState(false), ref = useRef()
  useFrame(({ clock }) => { const p = hover ? 1.7 + Math.sin(clock.elapsedTime * 6) * .18 : visible ? 1.15 : .72; ref.current.scale.lerp(new THREE.Vector3(p, p, p), .12) })
  return <group position={position} ref={ref}>
    <mesh onPointerOver={e => { e.stopPropagation(); setHover(true) }} onPointerOut={() => setHover(false)}><sphereGeometry args={[.055, 8, 8]} /><meshBasicMaterial color={color} /></mesh>
    {(hover || visible) && <Html center distanceFactor={13} className={`subcore-label ${hover ? 'hover' : ''}`}>{name}</Html>}
  </group>
}

function Signals({ data, power }) {
  const ref = useRef()
  const signalData = useMemo(() => {
    const count = CONFIG.signalCount, positions = new Float32Array(count * 3), colors = new Float32Array(count * 3)
    return { count, positions, colors, phases: Array.from({ length: count }, (_, i) => (i / count) % 1), links: Array.from({ length: count }, (_, i) => i % data.globalEdges.length) }
  }, [data])
  useFrame((_, delta) => {
    for (let i = 0; i < signalData.count; i++) {
      signalData.phases[i] = (signalData.phases[i] + delta * (.15 + power * .23 + (i % 5) * .009)) % 1
      const edge = data.globalEdges[signalData.links[i]], t = signalData.phases[i], p = edge.a.clone().lerp(edge.b, t)
      signalData.positions.set(p.toArray(), i * 3); signalData.colors.set(edge.color.toArray(), i * 3)
      if (t < .008) signalData.links[i] = (signalData.links[i] + 1 + (i % 3)) % data.globalEdges.length
    }
    ref.current.geometry.attributes.position.needsUpdate = true; ref.current.geometry.attributes.color.needsUpdate = true
  })
  return <points ref={ref}><bufferGeometry><bufferAttribute attach="attributes-position" args={[signalData.positions, 3]} /><bufferAttribute attach="attributes-color" args={[signalData.colors, 3]} /></bufferGeometry><pointsMaterial vertexColors size={.105 + power * .035} transparent opacity={1} blending={THREE.AdditiveBlending} depthWrite={false} /></points>
}

function PrimarySignal({ signal, data }) {
  const ref = useRef(), halo = useRef(), progress = useRef(0)
  const resolve = name => name === 'CORE' ? new THREE.Vector3() : name === 'INPUT' ? new THREE.Vector3(0, -6.4, 1.4) : data.systemData[SYSTEMS.findIndex(s => s.name === name)]?.center
  useEffect(() => { progress.current = 0 }, [signal.step, signal.run])
  useFrame((_, delta) => {
    if (!ref.current || signal.step < 0 || signal.step >= signal.path.length - 1) { if (ref.current) ref.current.visible = false; return }
    const a = resolve(signal.path[signal.step]), b = resolve(signal.path[signal.step + 1]); if (!a || !b) return
    progress.current = Math.min(1, progress.current + delta / .66); ref.current.visible = true; ref.current.position.copy(a).lerp(b, progress.current); halo.current.scale.setScalar(1 + Math.sin(progress.current * Math.PI) * 2.5)
  })
  return <group ref={ref} visible={false}><mesh><sphereGeometry args={[.105, 10, 10]} /><meshBasicMaterial color="white" /></mesh><mesh ref={halo}><sphereGeometry args={[.2, 10, 10]} /><meshBasicMaterial color="#65efff" transparent opacity={.22} blending={THREE.AdditiveBlending} /></mesh><pointLight color="#a8ffff" intensity={8} distance={3} /></group>
}

function Lines({ position, color, opacity, linewidth = 1 }) {
  return <lineSegments><bufferGeometry><primitive attach="attributes-position" object={position} /><primitive attach="attributes-color" object={color} /></bufferGeometry><lineBasicMaterial vertexColors transparent opacity={opacity} linewidth={linewidth} blending={THREE.AdditiveBlending} depthWrite={false} /></lineSegments>
}

function FocusConnections({ system }) {
  const geometry = useMemo(() => {
    const values = []
    system.subCores.forEach(p => values.push(...system.center.toArray(), ...p.toArray()))
    values.push(...new THREE.Vector3().toArray(), ...system.center.toArray())
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(values, 3)); return g
  }, [system])
  return <lineSegments geometry={geometry}><lineBasicMaterial color={system.color} transparent opacity={1} blending={THREE.AdditiveBlending} depthWrite={false} /></lineSegments>
}

export default function NeuralNetwork({ ready, boot }) {
  const group = useRef(), points = useRef(), [hovered, setHovered] = useState(null)
  const data = useMemo(generateArchitecture, []), { pointer, camera, controls } = useThree(), { state, sequence, signal, focusedSystem, focusSystem, intensities } = useNeuralState()
  const booting = ['impact', 'network', 'identity', 'zones', 'online'].includes(boot?.phase)
  const bootPower = boot?.phase === 'impact' ? 1.25 : boot?.phase === 'zones' ? .65 : 0
  const statePower = Math.max(bootPower, state === 'PROCESSING' ? 1 : state === 'RESPONDING' ? .7 : state === 'LISTENING' ? .45 : 0)
  const active = boot?.phase === 'zones' ? SYSTEMS.slice(0, boot.zone + 1).map(z => z.name) : sequence
  const focusIndex = SYSTEMS.findIndex(s => s.name === focusedSystem), focusPos = focusIndex >= 0 ? new THREE.Vector3(...SYSTEMS[focusIndex].pos) : new THREE.Vector3()

  useFrame(({ clock }, delta) => {
    group.current.rotation.y += delta * .009
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, pointer.y * .075, .022)
    group.current.rotation.z = THREE.MathUtils.lerp(group.current.rotation.z, -pointer.x * .045, .022)
    const explorationDim = hovered !== null || focusIndex >= 0 ? .46 : 1
    points.current.material.opacity = THREE.MathUtils.lerp(points.current.material.opacity, ready ? .96 * explorationDim : booting ? .78 : .01, .035)
    points.current.material.size = .045 + Math.sin(clock.elapsedTime * 1.7) * .004 + statePower * .008
    if (ready && controls) {
      const desiredTarget = focusIndex >= 0 ? focusPos : new THREE.Vector3()
      const desiredCamera = focusIndex >= 0 ? focusPos.clone().add(new THREE.Vector3(0, .25, 4.25)) : new THREE.Vector3(0, 0, 15.3)
      controls.target.lerp(desiredTarget, focusIndex >= 0 ? .035 : .025); camera.position.lerp(desiredCamera, focusIndex >= 0 ? .025 : .018); controls.update()
    }
  })

  return <group ref={group} scale={ready || booting ? 1 : .04}>
    <Lines position={data.localPos} color={data.localCol} opacity={(hovered !== null || focusIndex >= 0 ? .15 : .39) + statePower * .07} />
    <Lines position={data.systemPos} color={data.systemCol} opacity={(hovered !== null || focusIndex >= 0 ? .28 : .75) + statePower * .08} />
    <Lines position={data.globalPos} color={data.globalCol} opacity={(hovered !== null || focusIndex >= 0 ? .38 : .9) + statePower * .08} linewidth={2} />
    {(focusIndex >= 0 || hovered !== null) && <FocusConnections system={data.systemData[focusIndex >= 0 ? focusIndex : hovered]} />}
    <points ref={points}><bufferGeometry><primitive attach="attributes-position" object={data.nodePositions} /><primitive attach="attributes-color" object={data.nodeColors} /></bufferGeometry><pointsMaterial vertexColors size={.045} sizeAttenuation transparent opacity={.9} blending={THREE.AdditiveBlending} depthWrite={false} /></points>
    <Signals data={data} power={statePower} /><PrimarySignal signal={signal} data={data} /><JonaCore intensity={statePower} />
    {SYSTEMS.map((zone, i) => <SystemCore key={zone.name} zone={zone} index={i} active={active.includes(zone.name) || (intensities[zone.name] || 0) > .5} hovered={hovered === i} focused={focusedSystem === zone.name} subCores={data.systemData[i].subCores} onHover={setHovered} onFocus={focusSystem} />)}
  </group>
}
