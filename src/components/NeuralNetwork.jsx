import { Html, Line } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

const NODES = [
  { name: 'JEZGRO 01', color: '#2596ff', position: [-5.0, 3.05, 0], size: 1.05 },
  { name: 'JEZGRO 02', color: '#20e67a', position: [0, 4.45, 0], size: 1.0 },
  { name: 'JEZGRO 03', color: '#b13cff', position: [5.0, 3.0, 0], size: 1.08 },
  { name: 'JEZGRO 04', color: '#ff8a24', position: [6.55, -.25, 0], size: .96 },
  { name: 'JEZGRO 05', color: '#25e0b8', position: [6.25, -3.45, 0], size: .92 },
  { name: 'JEZGRO 06', color: '#2f79ff', position: [2.9, -4.3, 0], size: .82 },
  { name: 'JEZGRO 07', color: '#9337ff', position: [-4.15, -3.75, 0], size: .9 },
  { name: 'JEZGRO 08', color: '#ff8f2f', position: [-6.25, -.55, 0], size: .98 },
]

function EnergyLink({ color, position, index }) {
  const lines = useMemo(() => {
    const end = new THREE.Vector3(...position)
    return [0, 1, 2].map(channel => {
      const offset = (channel - 1) * .16
      const mid1 = end.clone().multiplyScalar(.35)
      const mid2 = end.clone().multiplyScalar(.68)
      mid1.y += Math.sin(index * 1.7 + channel) * .42 + offset
      mid1.x += Math.cos(index * 1.4 + channel) * .28
      mid2.y += Math.cos(index * 1.2 + channel) * .34 - offset
      mid2.x += Math.sin(index * 1.6 + channel) * .24
      return [new THREE.Vector3(0, 0, 0), mid1, mid2, end]
    })
  }, [position, index])
  return <group>{lines.map((points, i) => <Line key={i} points={points} color={i === 1 ? '#ffffff' : color} transparent opacity={i === 1 ? .46 : .55} lineWidth={i === 1 ? .65 : 1.35} />)}</group>
}

function EnergyParticles({ color, size, index }) {
  const particles = useMemo(() => Array.from({ length: 28 }, (_, i) => {
    const a = i / 28 * Math.PI * 2 + index * .41
    const radius = size * (1.35 + (i % 4) * .12)
    return [Math.cos(a) * radius, Math.sin(a) * radius, ((i % 5) - 2) * .035]
  }), [color, size, index])
  return <>{particles.map((p, i) => <mesh key={i} position={p}><sphereGeometry args={[.025 + (i % 3) * .009, 7, 7]} /><meshBasicMaterial color={i % 4 === 0 ? '#ffffff' : color} toneMapped={false} /></mesh>)}</>
}

function Planet({ config, index }) {
  const group = useRef(), ringA = useRef(), ringB = useRef(), shell = useRef()
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    if (group.current) group.current.scale.setScalar(1 + Math.sin(t * 1.35 + index) * .025)
    if (ringA.current) ringA.current.rotation.z = t * (.12 + index * .006)
    if (ringB.current) ringB.current.rotation.x = -t * (.09 + index * .004)
    if (shell.current) shell.current.rotation.y = t * .1
  })
  return <group ref={group} position={config.position}>
    <mesh>
      <sphereGeometry args={[config.size, 80, 80]} />
      <meshPhysicalMaterial color="#07111d" roughness={.18} metalness={.42} clearcoat={1} clearcoatRoughness={.12} emissive={config.color} emissiveIntensity={.55} />
    </mesh>
    <mesh ref={shell} scale={1.035}>
      <sphereGeometry args={[config.size, 32, 32]} />
      <meshBasicMaterial color={config.color} wireframe transparent opacity={.22} blending={THREE.AdditiveBlending} />
    </mesh>
    <mesh scale={1.17}>
      <sphereGeometry args={[config.size, 48, 48]} />
      <meshBasicMaterial color={config.color} transparent opacity={.065} side={THREE.BackSide} blending={THREE.AdditiveBlending} />
    </mesh>
    <mesh ref={ringA} rotation={[1.05, .35, .25]}><torusGeometry args={[config.size * 1.33, .026, 8, 160]} /><meshBasicMaterial color={config.color} transparent opacity={.96} toneMapped={false} /></mesh>
    <mesh ref={ringB} rotation={[.3, 1.22, -.25]}><torusGeometry args={[config.size * 1.45, .015, 8, 160]} /><meshBasicMaterial color="#d8f6ff" transparent opacity={.58} toneMapped={false} /></mesh>
    <EnergyParticles color={config.color} size={config.size} index={index} />
    <pointLight color={config.color} intensity={7.5} distance={5.3} />
    <Html center distanceFactor={10.5} position={[0, -.06, config.size + .18]} className="orbit-label"><strong>{config.name}</strong><span>AKTIVNO</span></Html>
  </group>
}

function CoreRobot() {
  const root = useRef(), halo = useRef(), ringA = useRef(), ringB = useRef(), innerRing = useRef()
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    if (root.current) root.current.scale.setScalar(1 + Math.sin(t * 1.45) * .018)
    if (halo.current) halo.current.scale.setScalar(1 + Math.sin(t * 1.15) * .04)
    if (ringA.current) ringA.current.rotation.z = t * .18
    if (ringB.current) ringB.current.rotation.x = -t * .13
    if (innerRing.current) innerRing.current.rotation.y = t * .23
  })

  return <group>
    <group ref={root}>
      <mesh>
        <sphereGeometry args={[2.28, 96, 96]} />
        <meshPhysicalMaterial color="#071020" roughness={.16} metalness={.48} clearcoat={1} clearcoatRoughness={.1} emissive="#6f35ff" emissiveIntensity={.48} />
      </mesh>
      <mesh scale={1.03}>
        <sphereGeometry args={[2.28, 36, 36]} />
        <meshBasicMaterial color="#9b6cff" wireframe transparent opacity={.18} blending={THREE.AdditiveBlending} />
      </mesh>

      <group position={[0, .25, 1.9]}>
        <mesh scale={[1.18, .83, .3]}>
          <sphereGeometry args={[.9, 48, 48]} />
          <meshPhysicalMaterial color="#020711" roughness={.12} metalness={.5} clearcoat={1} emissive="#04192a" emissiveIntensity={.4} />
        </mesh>
        <mesh position={[-.42, .1, .28]} scale={[.34, .5, .11]}><sphereGeometry args={[.4, 32, 32]} /><meshBasicMaterial color="#48e6ff" toneMapped={false} /></mesh>
        <mesh position={[.42, .1, .28]} scale={[.34, .5, .11]}><sphereGeometry args={[.4, 32, 32]} /><meshBasicMaterial color="#48e6ff" toneMapped={false} /></mesh>
        <mesh position={[0, -.35, .28]} rotation={[0, 0, Math.PI]}><torusGeometry args={[.28, .04, 9, 36, Math.PI]} /><meshBasicMaterial color="#c9a8ff" toneMapped={false} /></mesh>
      </group>

      <group position={[0, -1.05, 1.35]}>
        <mesh scale={[1.0, .72, .42]}><sphereGeometry args={[.8, 40, 40]} /><meshPhysicalMaterial color="#111a36" roughness={.2} metalness={.46} emissive="#243bff" emissiveIntensity={.28} /></mesh>
        <Html center distanceFactor={9} position={[0, -.05, .62]} className="core-label"><strong>JONA AI</strong><span>CORE</span></Html>
      </group>

      <mesh ref={innerRing} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[1.95, .035, 8, 180]} /><meshBasicMaterial color="#39dfff" transparent opacity={.7} toneMapped={false} /></mesh>
      <mesh ref={ringA} rotation={[1.18, .28, .42]}><torusGeometry args={[2.65, .048, 8, 190]} /><meshBasicMaterial color="#9b5cff" transparent opacity={.98} toneMapped={false} /></mesh>
      <mesh ref={ringB} rotation={[.25, 1.25, -.35]}><torusGeometry args={[2.92, .028, 8, 190]} /><meshBasicMaterial color="#39dfff" transparent opacity={.84} toneMapped={false} /></mesh>
    </group>

    <mesh ref={halo} scale={3.2}><sphereGeometry args={[1, 48, 48]} /><meshBasicMaterial color="#7c3aed" transparent opacity={.06} side={THREE.BackSide} blending={THREE.AdditiveBlending} /></mesh>
    <pointLight color="#8b5cf6" intensity={10} distance={13} />
    <pointLight color="#22d3ee" intensity={5.5} distance={11} position={[0, 0, 2]} />
  </group>
}

export default function NeuralNetwork({ ready, boot }) {
  const system = useRef()
  const booting = ['impact', 'network', 'identity', 'zones', 'online', 'reveal'].includes(boot?.phase)

  useFrame(({ pointer }) => {
    if (!system.current) return
    system.current.rotation.x = THREE.MathUtils.lerp(system.current.rotation.x, pointer.y * .015, .025)
    system.current.rotation.y = THREE.MathUtils.lerp(system.current.rotation.y, pointer.x * .02, .025)
  })

  return <group ref={system} scale={ready || booting ? 1 : .05}>
    <ambientLight intensity={.28} />
    <directionalLight position={[4, 6, 8]} intensity={2.45} color="#dbeafe" />
    <CoreRobot />
    {NODES.map((node, index) => <group key={node.name}>
      <EnergyLink color={node.color} position={node.position} index={index} />
      <Planet config={node} index={index} />
    </group>)}

    <mesh position={[0, -3.35, -1.6]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[1.8, 3.95, 128]} />
      <meshBasicMaterial color="#5146ff" transparent opacity={.17} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} />
    </mesh>
    <mesh position={[0, -3.31, -1.54]} rotation={[-Math.PI / 2, 0, 0]}><torusGeometry args={[2.8, .04, 8, 190]} /><meshBasicMaterial color="#40a9ff" transparent opacity={.9} toneMapped={false} /></mesh>
    <mesh position={[0, -3.29, -1.5]} rotation={[-Math.PI / 2, 0, 0]}><torusGeometry args={[3.45, .018, 8, 190]} /><meshBasicMaterial color="#8c5cff" transparent opacity={.72} toneMapped={false} /></mesh>
    <pointLight position={[0, -3.1, 0]} color="#3b82f6" intensity={4.5} distance={10} />
  </group>
}