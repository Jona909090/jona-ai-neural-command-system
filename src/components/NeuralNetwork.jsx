import { Html, Line } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { useNeuralState } from '../state/NeuralStateContext'
import { useVoice } from '../controllers/VoiceContext'

const PLANETS = [
  { name: 'LANGUAGE', label: 'LANGUAGE', color: '#9ca3ad', dark: '#313740', radius: 3.15, size: .36, speed: .021, phase: .15, surface: 'crater' },
  { name: 'MEMORY', label: 'MEMORY', color: '#d94132', dark: '#44150f', radius: 4.15, size: .44, speed: .017, phase: 1.18, surface: 'rock' },
  { name: 'LOGIC', label: 'LOGIC', color: '#257dd4', dark: '#061d4c', radius: 5.15, size: .4, speed: .014, phase: 2.2, surface: 'ocean' },
  { name: 'CREATIVE', label: 'CREATIVE', color: '#d7a72b', dark: '#6b3511', radius: 6.15, size: .46, speed: .0115, phase: 3.25, surface: 'gas' },
  { name: 'PLANNING', label: 'PLANNING', color: '#8246bd', dark: '#28133f', radius: 7.15, size: .4, speed: .0095, phase: 4.28, surface: 'storm' },
  { name: 'RESPONSE', label: 'RESPONSE', color: '#3fbfae', dark: '#0b4350', radius: 8.15, size: .44, speed: .0075, phase: 5.3, surface: 'ice' },
  { name: 'VISION', label: 'VISION', color: '#e9782d', dark: '#50210c', radius: 9.15, size: .39, speed: .0062, phase: .72, surface: 'volcanic' },
  { name: 'CONTEXT', label: 'CONTEXT', color: '#e83c9f', dark: '#4b0c35', radius: 10.15, size: .43, speed: .0051, phase: 2.78, surface: 'cloud' },
]

const ROMAN = ['', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII']
const ORBIT_COUNTS = PLANETS.map((_, index) => 4 * 2 ** index)
const ORBITAL_BODIES = PLANETS.map((planet, orbitIndex) => ({ ...planet, id: `${planet.name}-1`, variant: orbitIndex * 8, companion: false, slotIndex: 0 }))

function seeded(seed) {
  let value = seed * 9301 + 49297
  return () => { value = (value * 9301 + 49297) % 233280; return value / 233280 }
}

function planetTexture(config, index) {
  const canvas = document.createElement('canvas'); canvas.width = 768; canvas.height = 384
  const ctx = canvas.getContext('2d'), random = seeded(index + 11)
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height); gradient.addColorStop(0, config.dark); gradient.addColorStop(.48, config.color); gradient.addColorStop(1, config.dark)
  ctx.fillStyle = gradient; ctx.fillRect(0, 0, canvas.width, canvas.height)

  if (config.surface === 'gas' || config.surface === 'storm' || config.surface === 'cloud') {
    for (let y = 0; y < canvas.height; y += 9 + Math.floor(random() * 11)) {
      ctx.globalAlpha = .12 + random() * .25; ctx.fillStyle = random() > .5 ? '#fff4bd' : config.dark
      ctx.beginPath(); ctx.moveTo(0, y)
      for (let x = 0; x <= canvas.width; x += 24) ctx.lineTo(x, y + Math.sin(x * .018 + random() * 5) * (3 + random() * 7))
      ctx.lineTo(canvas.width, y + 10); ctx.lineTo(0, y + 10); ctx.fill()
    }
  } else {
    for (let i = 0; i < 220; i++) {
      const x = random() * canvas.width, y = random() * canvas.height, radius = 2 + random() * (config.surface === 'crater' ? 20 : 38)
      ctx.globalAlpha = .08 + random() * .24; ctx.fillStyle = random() > .48 ? '#ffffff' : config.dark
      ctx.beginPath(); ctx.ellipse(x, y, radius * (1 + random() * 1.8), radius * (.35 + random() * .7), random() * Math.PI, 0, Math.PI * 2); ctx.fill()
      if (config.surface === 'crater' && radius > 10) { ctx.globalAlpha = .28; ctx.strokeStyle = '#d4d7da'; ctx.lineWidth = 2; ctx.stroke() }
    }
  }
  if (config.surface === 'ocean') {
    ctx.globalAlpha = .32; ctx.strokeStyle = '#d9f4ff'; ctx.lineWidth = 4
    for (let i = 0; i < 18; i++) { const y = random() * canvas.height; ctx.beginPath(); ctx.moveTo(0, y); for (let x = 0; x < canvas.width; x += 30) ctx.lineTo(x, y + Math.sin(x * .025 + i) * 10); ctx.stroke() }
  }
  if (config.surface === 'ice') {
    ctx.globalAlpha = .38; ctx.strokeStyle = '#c8ffff'; ctx.lineWidth = 2
    for (let i = 0; i < 45; i++) { const x = random() * canvas.width, y = random() * canvas.height; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + random() * 90 - 45, y + random() * 60 - 30); ctx.stroke() }
  }
  if (config.surface === 'volcanic') {
    ctx.globalAlpha = .7; ctx.strokeStyle = '#ffb12e'; ctx.lineWidth = 2
    for (let i = 0; i < 55; i++) { const x = random() * canvas.width, y = random() * canvas.height; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + random() * 70 - 35, y + random() * 55 - 28); ctx.stroke() }
  }
  ctx.globalAlpha = 1
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace; texture.anisotropy = 8; return texture
}

function earthTexture() {
  const canvas = document.createElement('canvas'); canvas.width = 1024; canvas.height = 512
  const ctx = canvas.getContext('2d'); ctx.fillStyle = '#03130a'; ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.strokeStyle = '#0c4823'; ctx.lineWidth = 1
  for (let x = 0; x <= 1024; x += 64) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 512); ctx.stroke() }
  for (let y = 0; y <= 512; y += 48) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(1024, y); ctx.stroke() }
  ctx.fillStyle = '#43ff65'; ctx.shadowColor = '#31ff61'; ctx.shadowBlur = 14
  const land = points => { ctx.beginPath(); points.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath(); ctx.fill() }
  land([[120,92],[180,58],[244,72],[278,118],[251,160],[212,174],[195,228],[146,205],[112,151]])
  land([[226,240],[271,252],[294,306],[276,382],[244,451],[216,401],[198,332]])
  land([[436,105],[502,79],[584,94],[641,128],[618,174],[555,176],[529,215],[466,197],[421,153]])
  land([[500,207],[565,195],[608,245],[592,326],[544,406],[498,372],[474,297]])
  land([[650,126],[730,93],[846,111],[904,163],[862,221],[783,211],[744,253],[680,210]])
  land([[806,330],[868,315],[911,350],[889,401],[828,411],[792,372]])
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace; texture.anisotropy = 8; return texture
}

function Atmosphere({ color = '#35ff69', scale = 1.08 }) {
  return <mesh scale={scale}><sphereGeometry args={[1, 48, 48]} /><meshBasicMaterial color={color} transparent opacity={.075} side={THREE.BackSide} blending={THREE.AdditiveBlending} /></mesh>
}

function JonaEarth({ power, onActivate }) {
  const planet = useRef(), clouds = useRef(), texture = useMemo(earthTexture, []), [hovered, setHovered] = useState(false)
  useFrame(({ clock }, delta) => {
    planet.current.rotation.y += delta * .075; clouds.current.rotation.y += delta * .105
    const pulse = 1 + Math.sin(clock.elapsedTime * 1.5) * .012 + power * .018; planet.current.scale.setScalar(pulse)
  })
  return <group>
    <group ref={planet}>
      <mesh castShadow receiveShadow onClick={event => { event.stopPropagation(); onActivate() }} onPointerOver={event => { event.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer' }} onPointerOut={() => { setHovered(false); document.body.style.cursor = 'default' }}><sphereGeometry args={[1.65, 96, 96]} /><meshStandardMaterial map={texture} color="#76ff88" roughness={.58} metalness={.08} emissive="#0cff3d" emissiveIntensity={.18 + power * .2 + (hovered ? .18 : 0)} /></mesh>
      <mesh ref={clouds} scale={1.006}><sphereGeometry args={[1.65, 48, 48]} /><meshBasicMaterial color="#b8ffc3" wireframe transparent opacity={.085} /></mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[1.78, .013, 5, 128]} /><meshBasicMaterial color="#3cff6a" transparent opacity={.5} /></mesh>
      <Atmosphere scale={1.82} />
    </group>
    <pointLight color="#37ff67" intensity={3.2 + power * 2.2} distance={8} />
    <Html center distanceFactor={9} className={`planet-core-label ${hovered ? 'ready' : ''}`}><strong>JONA AI</strong><span>{hovered ? 'ACTIVATE CORE' : 'WORLD CORE'}</span></Html>
  </group>
}

function OrbitRing({ radius }) {
  const points = useMemo(() => Array.from({ length: 129 }, (_, i) => { const a = i / 128 * Math.PI * 2; return new THREE.Vector3(Math.cos(a) * radius, Math.sin(a) * radius, 0) }), [radius])
  return <Line points={points} color="#245c39" transparent opacity={.28} lineWidth={.45} />
}

function OrbitColony({ config, orbitIndex, active }) {
  const mesh = useRef(), dummy = useMemo(() => new THREE.Object3D(), []), count = ORBIT_COUNTS[orbitIndex] - 1
  const size = Math.max(.025, Math.min(config.size * .42, Math.PI * 2 * config.radius / ORBIT_COUNTS[orbitIndex] * .28))
  useFrame(({ clock }) => {
    if (!mesh.current) return
    for (let index = 0; index < count; index++) {
      const angle = config.phase + clock.elapsedTime * config.speed + (index + 1) * Math.PI * 2 / ORBIT_COUNTS[orbitIndex]
      dummy.position.set(Math.cos(angle) * config.radius, Math.sin(angle) * config.radius, Math.sin(angle * 3 + orbitIndex) * .035)
      dummy.rotation.set(angle * .13, angle, 0); dummy.scale.setScalar(active ? 1.18 : 1); dummy.updateMatrix(); mesh.current.setMatrixAt(index, dummy.matrix)
    }
    mesh.current.instanceMatrix.needsUpdate = true
  })
  return <instancedMesh ref={mesh} args={[null, null, count]} frustumCulled={false}><sphereGeometry args={[size, 10, 8]} /><meshStandardMaterial color={config.color} emissive={config.color} emissiveIntensity={active ? .5 : .12} roughness={.72} /></instancedMesh>
}

function OrbitPlanet({ config, index, active, focused, voiceLevel, onHover, onFocus, registerPosition }) {
  const pivot = useRef(), body = useRef(), [hovered, setHovered] = useState(false), world = useMemo(() => new THREE.Vector3(), []), texture = useMemo(() => planetTexture(config, config.variant), [config])
  useFrame(({ clock }, delta) => {
    const angle = config.phase + clock.elapsedTime * config.speed
    pivot.current.position.set(Math.cos(angle) * config.radius, Math.sin(angle) * config.radius, 0)
    body.current.rotation.y += delta * (.04 + (index % 8) * .005) * (config.slotIndex % 2 ? -.82 : 1); body.current.rotation.x += delta * (.004 + config.slotIndex * .0007)
    const pulse = 1 + (active ? .08 : .015) * Math.sin(clock.elapsedTime * (2 + index * .2)) + voiceLevel * .18 + (hovered ? .12 : 0)
    body.current.scale.setScalar(pulse); pivot.current.getWorldPosition(world); if (!config.companion) registerPosition(config.name, world)
  })
  return <group ref={pivot}>
    <group ref={body}>
      <mesh onClick={e => { e.stopPropagation(); onFocus(config.name, world.clone()) }} onPointerOver={e => { e.stopPropagation(); setHovered(true); onHover(config.name); document.body.style.cursor = 'pointer' }} onPointerOut={() => { setHovered(false); onHover(null); document.body.style.cursor = 'default' }}>
        <sphereGeometry args={[config.size, 64, 64]} /><meshStandardMaterial map={texture} color="#ffffff" roughness={config.surface === 'ice' ? .32 : .78} metalness={config.surface === 'ice' ? .14 : .025} emissive={config.color} emissiveIntensity={active || hovered ? .25 : .035} bumpMap={texture} bumpScale={config.size * .035} />
      </mesh>
      <mesh scale={1.008}><sphereGeometry args={[config.size, 20, 20]} /><meshBasicMaterial color="#ffffff" wireframe transparent opacity={.1} /></mesh>
      <Atmosphere color={config.color} scale={config.size * 1.22} />
      {index === 3 && <mesh rotation={[1.15, .2, 0]}><torusGeometry args={[config.size * 1.45, .025, 6, 80]} /><meshBasicMaterial color={config.color} transparent opacity={.72} /></mesh>}
    </group>
    <pointLight color={config.color} intensity={active || hovered ? 3.8 : .75} distance={2.4} />
    {(!config.companion || hovered) && <Html position={[config.size + .24, config.size * .3, 0]} distanceFactor={12} className={`planet-label ${active ? 'active' : ''}`}><strong>{config.label}</strong><span>{focused ? 'FOCUS' : active ? 'ACTIVE' : 'ORBITAL SYSTEM'}</span></Html>}
  </group>
}

function TravelSignal({ signal, positions }) {
  const ref = useRef(), progress = useRef(0)
  useEffect(() => { progress.current = 0 }, [signal.step, signal.run])
  useFrame((_, delta) => {
    if (!ref.current || signal.step < 0 || signal.step >= signal.path.length - 1) { if (ref.current) ref.current.visible = false; return }
    const resolve = name => name === 'CORE' || name === 'INPUT' || !positions.current[name] ? new THREE.Vector3() : positions.current[name]
    const from = resolve(signal.path[signal.step]), to = resolve(signal.path[signal.step + 1]); progress.current = Math.min(1, progress.current + delta / .66)
    ref.current.visible = true; ref.current.position.copy(from).lerp(to, progress.current)
  })
  return <group ref={ref} visible={false}><mesh><sphereGeometry args={[.075, 12, 12]} /><meshBasicMaterial color="#ffffff" /></mesh><pointLight color="#5eff82" intensity={5} distance={2} /></group>
}

export default function NeuralNetwork({ ready, boot }) {
  const system = useRef(), positions = useRef({}), selectedPosition = useRef(null), proximityState = useRef(null), { pointer, camera, controls } = useThree(), [hovered, setHovered] = useState(null)
  const { state, signal, focusedSystem, focusSystem, systemActivity, setHoveredSystem, setNearbySystem, setPyramidOpen } = useNeuralState(), voice = useVoice()
  const booting = ['impact', 'network', 'identity', 'zones', 'online', 'reveal'].includes(boot?.phase)
  const power = Math.max(voice.amplitude, state === 'PROCESSING' ? 1 : state === 'RESPONDING' ? .72 : state === 'LISTENING' ? .5 : 0)
  const focusPosition = selectedPosition.current || positions.current[focusedSystem]

  useFrame((_, delta) => {
    system.current.rotation.x = THREE.MathUtils.lerp(system.current.rotation.x, pointer.y * .035, .02)
    system.current.rotation.z = THREE.MathUtils.lerp(system.current.rotation.z, -pointer.x * .025, .02)
    if (ready && controls) {
      const target = focusedSystem && focusPosition ? focusPosition : new THREE.Vector3()
      const cameraTarget = focusedSystem && focusPosition ? focusPosition.clone().add(new THREE.Vector3(0, .2, 3.4)) : new THREE.Vector3(0, 0, 24)
      controls.target.lerp(target, .025); camera.position.lerp(cameraTarget, .018); controls.update()
      const nearby = focusedSystem && focusPosition && camera.position.distanceTo(focusPosition) < 4.45 ? focusedSystem : null
      if (nearby !== proximityState.current) { proximityState.current = nearby; setNearbySystem(nearby) }
    }
  })

  return <group ref={system} scale={ready || booting ? 1 : .05}>
    <ambientLight intensity={.32} /><directionalLight position={[4, 6, 8]} intensity={2.4} color="#d9ffe1" />
    <JonaEarth power={power} onActivate={() => { focusSystem(null); setNearbySystem(null); setPyramidOpen(true) }} />
    {PLANETS.map(config => <OrbitRing key={`orbit-${config.name}`} radius={config.radius} />)}
    {PLANETS.map((config, index) => <OrbitColony key={`colony-${config.name}`} config={config} orbitIndex={index} active={systemActivity[config.name] > .55} />)}
    {ORBITAL_BODIES.map((config, index) => <OrbitPlanet key={config.id} config={config} index={index} active={systemActivity[config.name] > .55} focused={focusedSystem === config.name} voiceLevel={(voice.status === 'LISTENING' && config.name === 'LANGUAGE') || (voice.status === 'SPEAKING' && config.name === 'RESPONSE') ? voice.amplitude : 0} onHover={name => { setHovered(name); setHoveredSystem(name) }} onFocus={(name, point) => { selectedPosition.current = point; focusSystem(name) }} registerPosition={(name, point) => { positions.current[name] = point.clone() }} />)}
    <TravelSignal signal={signal} positions={positions} />
    {hovered && positions.current[hovered] && <Line points={[new THREE.Vector3(), positions.current[hovered]]} color={PLANETS.find(p => p.name === hovered)?.color || '#55ff77'} transparent opacity={.45} lineWidth={1} />}
  </group>
}
