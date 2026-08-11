import { useFrame, useThree } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { CONFIG, ZONES } from '../config/neuralConfig'
import { useNeuralState } from '../state/NeuralStateContext'

const rand = (a, b) => a + Math.random() * (b - a)
const palette = ZONES.map(z => new THREE.Color(z.color))

function generateNetwork() {
  const positions = new Float32Array(CONFIG.nodeCount * 3)
  const colors = new Float32Array(CONFIG.nodeCount * 3)
  const sizes = new Float32Array(CONFIG.nodeCount)
  const nodes = []
  for (let i = 0; i < CONFIG.nodeCount; i++) {
    const zone = i < 1300 ? Math.floor(Math.random() * ZONES.length) : -1
    const anchor = zone >= 0 ? ZONES[zone].pos : [0, 0, 0]
    const spread = zone >= 0 ? rand(.7, 2.7) : rand(.3, CONFIG.coreRadius)
    const theta = rand(0, Math.PI * 2), phi = Math.acos(rand(-1, 1))
    const squash = rand(.55, 1.25)
    const p = new THREE.Vector3(
      anchor[0] * rand(.15, .9) + Math.sin(phi) * Math.cos(theta) * spread,
      anchor[1] * rand(.15, .9) + Math.cos(phi) * spread * squash,
      anchor[2] * rand(.15, 1.1) + Math.sin(phi) * Math.sin(theta) * spread * rand(.75, 1.45),
    )
    nodes.push(p); positions.set(p.toArray(), i * 3)
    const c = palette[zone >= 0 ? zone : Math.floor(Math.random() * palette.length)].clone().lerp(new THREE.Color('#ffffff'), Math.random() * .22)
    colors.set(c.toArray(), i * 3); sizes[i] = Math.random() < .04 ? rand(3.8, 7.2) : rand(.65, 2.4)
  }
  const linePos = new Float32Array(CONFIG.connectionCount * 6), lineCol = new Float32Array(CONFIG.connectionCount * 6)
  const edges = []
  for (let e = 0; e < CONFIG.connectionCount; e++) {
    const a = Math.floor(Math.random() * nodes.length)
    let b = (a + Math.floor(rand(1, e % 8 === 0 ? nodes.length : 90))) % nodes.length
    if (nodes[a].distanceTo(nodes[b]) > 7 && e % 6) b = (a + Math.floor(rand(1, 45))) % nodes.length
    edges.push([a, b]); linePos.set([...nodes[a].toArray(), ...nodes[b].toArray()], e * 6)
    const ca = new THREE.Color().fromArray(colors, a * 3), cb = new THREE.Color().fromArray(colors, b * 3)
    lineCol.set([...ca.toArray(), ...cb.toArray()], e * 6)
  }
  return { nodes, positions, colors, sizes, edges, linePos, lineCol }
}

function Core({ intensity }) {
  const ref = useRef()
  useFrame(({ clock }) => { const p = 1 + Math.sin(clock.elapsedTime * 2.1) * .11 + intensity * .12; ref.current.scale.setScalar(p); ref.current.rotation.y += .002 })
  return <group ref={ref}>
    <mesh><icosahedronGeometry args={[.72, 2]} /><meshBasicMaterial color="#dffcff" wireframe transparent opacity={.76} /></mesh>
    <mesh><icosahedronGeometry args={[.45, 1]} /><meshBasicMaterial color="#7ff7ff" transparent opacity={.75} /></mesh>
    <pointLight color="#57dcff" intensity={5 + intensity * 9} distance={8} />
    <Html center distanceFactor={8} className="core-label"><strong>JONA</strong><span>CORE</span></Html>
  </group>
}

function MainZones({ active, onHover }) {
  return <>{ZONES.map((z, i) => <group key={z.name} position={z.pos}>
    <mesh onPointerOver={e => { e.stopPropagation(); onHover(i) }} onPointerOut={() => onHover(null)} scale={active.includes(z.name) ? 1.45 : 1}>
      <icosahedronGeometry args={[.19, 1]} /><meshBasicMaterial color={z.color} />
    </mesh>
    <pointLight color={z.color} intensity={active.includes(z.name) ? 6 : 2} distance={2.8} />
  </group>)}</>
}

export default function NeuralNetwork({ ready }) {
  const group = useRef(), points = useRef(), signals = useRef()
  const [hovered, setHovered] = useState(null)
  const { state, sequence } = useNeuralState()
  const data = useMemo(generateNetwork, [])
  const sig = useMemo(() => ({ pos: new Float32Array(CONFIG.signalCount * 3), phase: Array.from({ length: CONFIG.signalCount }, () => Math.random()), edge: Array.from({ length: CONFIG.signalCount }, () => Math.floor(Math.random() * data.edges.length)) }), [data])
  const { pointer } = useThree()
  const statePower = state === 'PROCESSING' ? 1 : state === 'RESPONDING' ? .7 : state === 'LISTENING' ? .45 : 0

  useFrame(({ clock }, delta) => {
    const t = clock.elapsedTime
    group.current.rotation.y += delta * .018
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, pointer.y * .055, .025)
    group.current.rotation.z = THREE.MathUtils.lerp(group.current.rotation.z, -pointer.x * .04, .025)
    points.current.material.opacity = THREE.MathUtils.lerp(points.current.material.opacity, ready ? .9 : .12, .03)
    points.current.material.size = 0.038 + Math.sin(t * 2.4) * .007 + statePower * .018
    for (let i = 0; i < CONFIG.signalCount; i++) {
      sig.phase[i] = (sig.phase[i] + delta * (.13 + statePower * .34 + (i % 7) * .008)) % 1
      const [a, b] = data.edges[sig.edge[i]], p = data.nodes[a].clone().lerp(data.nodes[b], sig.phase[i])
      sig.pos.set(p.toArray(), i * 3)
      if (sig.phase[i] < .01) sig.edge[i] = Math.floor(Math.random() * data.edges.length)
    }
    signals.current.geometry.attributes.position.needsUpdate = true
  })

  return <group ref={group} scale={ready ? 1 : .12}>
    <lineSegments>
      <bufferGeometry><bufferAttribute attach="attributes-position" args={[data.linePos, 3]} /><bufferAttribute attach="attributes-color" args={[data.lineCol, 3]} /></bufferGeometry>
      <lineBasicMaterial vertexColors transparent opacity={ready ? .19 + statePower * .12 : .03} blending={THREE.AdditiveBlending} depthWrite={false} />
    </lineSegments>
    <points ref={points}>
      <bufferGeometry><bufferAttribute attach="attributes-position" args={[data.positions, 3]} /><bufferAttribute attach="attributes-color" args={[data.colors, 3]} /></bufferGeometry>
      <pointsMaterial vertexColors size={.04} sizeAttenuation transparent opacity={.85} blending={THREE.AdditiveBlending} depthWrite={false} />
    </points>
    <points ref={signals}>
      <bufferGeometry><bufferAttribute attach="attributes-position" args={[sig.pos, 3]} /></bufferGeometry>
      <pointsMaterial color="#ffffff" size={.095 + statePower * .05} sizeAttenuation transparent opacity={1} blending={THREE.AdditiveBlending} depthWrite={false} />
    </points>
    <Core intensity={statePower} /><MainZones active={sequence} onHover={setHovered} />
    {hovered !== null && <Html position={ZONES[hovered].pos} center className="zone-label"><strong>{ZONES[hovered].name}</strong><span>Neural system active</span></Html>}
  </group>
}
