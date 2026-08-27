import { Html, Line } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useNeuralState } from '../state/NeuralStateContext'

const NODES = [
  { name: 'JEZGRO 01', status: 'Aktivno', color: '#3b82f6', position: [-5.2, 2.8, 0], size: 1.0 },
  { name: 'JEZGRO 02', status: 'Aktivno', color: '#22c55e', position: [0, 4.2, 0], size: .92 },
  { name: 'JEZGRO 03', status: 'Aktivno', color: '#a855f7', position: [5.1, 2.8, 0], size: 1.0 },
  { name: 'JEZGRO 04', status: 'Aktivno', color: '#f97316', position: [6.8, -.3, 0], size: .9 },
  { name: 'JEZGRO 05', status: 'Planirano', color: '#10b981', position: [6.4, -3.2, 0], size: .9 },
  { name: 'JEZGRO 06', status: 'Aktivno', color: '#2563eb', position: [2.8, -4.1, 0], size: .78 },
  { name: 'JEZGRO 07', status: 'Aktivno', color: '#8b5cf6', position: [-4.0, -3.6, 0], size: .82 },
  { name: 'JEZGRO 08', status: 'Aktivno', color: '#fb923c', position: [-6.3, -.5, 0], size: .92 },
]

function Planet({ config, index }) {
  const group = useRef()
  const ring = useRef()
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    if (group.current) group.current.scale.setScalar(1 + Math.sin(t * 1.4 + index) * .025)
    if (ring.current) ring.current.rotation.z = t * (.08 + index * .006)
  })
  return <group ref={group} position={config.position}>
    <mesh>
      <sphereGeometry args={[config.size, 64, 64]} />
      <meshPhysicalMaterial color="#071120" roughness={.24} metalness={.36} clearcoat={1} emissive={config.color} emissiveIntensity={.32} />
    </mesh>
    <mesh scale={1.025}>
      <sphereGeometry args={[config.size, 28, 28]} />
      <meshBasicMaterial color={config.color} wireframe transparent opacity={.15} blending={THREE.AdditiveBlending} />
    </mesh>
    <mesh ref={ring} rotation={[1.1, .3, .2]}>
      <torusGeometry args={[config.size * 1.22, .025, 8, 140]} />
      <meshBasicMaterial color={config.color} transparent opacity={.88} toneMapped={false} />
    </mesh>
    <pointLight color={config.color} intensity={4.5} distance={4.5} />
    <Html center distanceFactor={11} position={[0, -.03, config.size + .2]} className="orbit-label">
      <strong>{config.name}</strong><span>{config.status}</span>
    </Html>
  </group>
}

function Core() {
  const core = useRef(), aura = useRef(), ringA = useRef(), ringB = useRef()
  const particles = useMemo(() => Array.from({ length: 34 }, (_, i) => {
    const a = i / 34 * Math.PI * 2
    return [Math.cos(a) * (2.7 + (i % 3) * .15), Math.sin(a) * (2.7 + (i % 4) * .12), (i % 2 ? .08 : -.08)]
  }), [])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    if (core.current) core.current.scale.setScalar(1 + Math.sin(t * 1.5) * .018)
    if (aura.current) aura.current.scale.setScalar(1 + Math.sin(t * 1.15) * .035)
    if (ringA.current) ringA.current.rotation.z = t * .12
    if (ringB.current) ringB.current.rotation.x = t * -.1
  })

  return <group>
    <group ref={core}>
      <mesh>
        <sphereGeometry args={[2.05, 96, 96]} />
        <meshPhysicalMaterial color="#080b1a" roughness={.18} metalness={.46} clearcoat={1} emissive="#6d28d9" emissiveIntensity={.45} />
      </mesh>
      <mesh scale={1.016}>
        <sphereGeometry args={[2.05, 38, 38]} />
        <meshBasicMaterial color="#8b5cf6" wireframe transparent opacity={.13} blending={THREE.AdditiveBlending} />
      </mesh>

      <group position={[0, .15, 1.82]}>
        <mesh position={[-.55, .24, 0]} scale={[.42, .58, .14]}><sphereGeometry args={[.44, 32, 32]} /><meshBasicMaterial color="#53e7ff" toneMapped={false} /></mesh>
        <mesh position={[.55, .24, 0]} scale={[.42, .58, .14]}><sphereGeometry args={[.44, 32, 32]} /><meshBasicMaterial color="#53e7ff" toneMapped={false} /></mesh>
        <mesh position={[0, -.42, .03]} rotation={[0, 0, Math.PI]}><torusGeometry args={[.36, .052, 10, 42, Math.PI]} /><meshBasicMaterial color="#d8b4fe" toneMapped={false} /></mesh>
      </group>

      <mesh ref={ringA} rotation={[1.2, .25, .4]}><torusGeometry args={[2.42, .045, 8, 180]} /><meshBasicMaterial color="#9b5cff" transparent opacity={.95} toneMapped={false} /></mesh>
      <mesh ref={ringB} rotation={[.25, 1.25, -.35]}><torusGeometry args={[2.6, .028, 8, 180]} /><meshBasicMaterial color="#39dfff" transparent opacity={.8} toneMapped={false} /></mesh>
    </group>

    <mesh ref={aura} scale={2.85}><sphereGeometry args={[1, 48, 48]} /><meshBasicMaterial color="#7c3aed" transparent opacity={.055} side={THREE.BackSide} blending={THREE.AdditiveBlending} /></mesh>
    {particles.map((p, i) => <mesh key={i} position={p}><sphereGeometry args={[.035 + (i % 3) * .008, 8, 8]} /><meshBasicMaterial color={i % 2 ? '#60a5fa' : '#c084fc'} toneMapped={false} /></mesh>)}
    <pointLight color="#8b5cf6" intensity={8} distance={12} />
    <pointLight color="#22d3ee" intensity={4.5} distance={10} position={[0, 0, 2]} />
    <Html center distanceFactor={10} position={[0, -2.65, 1.0]} className="core-label"><strong>JONA AI</strong><span>CENTRAL CORE</span></Html>
  </group>
}

export default function NeuralNetwork({ ready, boot }) {
  const system = useRef()
  const runtime = useNeuralState()
  const booting = ['impact', 'network', 'identity', 'zones', 'online', 'reveal'].includes(boot?.phase)

  useFrame(({ pointer }) => {
    if (!system.current) return
    system.current.rotation.x = THREE.MathUtils.lerp(system.current.rotation.x, pointer.y * .025, .02)
    system.current.rotation.y = THREE.MathUtils.lerp(system.current.rotation.y, pointer.x * .035, .02)
  })

  return <group ref={system} scale={ready || booting ? 1 : .05}>
    <ambientLight intensity={.32} />
    <directionalLight position={[4, 6, 8]} intensity={2.3} color="#dbeafe" />
    <Core />
    {NODES.map((node, index) => <group key={node.name}>
      <Line points={[new THREE.Vector3(0, 0, 0), new THREE.Vector3(...node.position)]} color={node.color} transparent opacity={.42} lineWidth={1.15} />
      <Planet config={node} index={index} />
    </group>)}
    <mesh position={[0, -3.15, -1.5]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[1.6, 3.6, 128]} />
      <meshBasicMaterial color="#4f46e5" transparent opacity={.14} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} />
    </mesh>
    <mesh position={[0, -3.12, -1.45]} rotation={[-Math.PI / 2, 0, 0]}>
      <torusGeometry args={[2.6, .035, 8, 180]} />
      <meshBasicMaterial color="#3b82f6" transparent opacity={.8} toneMapped={false} />
    </mesh>
    <pointLight position={[0, -3, 0]} color="#3b82f6" intensity={3.5} distance={9} />
  </group>
}
