import { Canvas } from '@react-three/fiber'
import { AdaptiveDpr, OrbitControls, Stars } from '@react-three/drei'
import { Bloom, EffectComposer, Noise, Vignette } from '@react-three/postprocessing'
import { Suspense } from 'react'
import NeuralNetwork from './NeuralNetwork'
import { CONFIG } from '../config/neuralConfig'

export default function NeuralScene({ ready, boot }) {
  const revealed = ['impact', 'network', 'identity', 'zones', 'online'].includes(boot.phase)
  return <div className={`scene ${ready ? 'online' : ''} ${revealed ? 'boot-reveal' : ''} boot-${boot.phase}`}>
    <Canvas dpr={[1, 1.65]} camera={{ position: [0, 0, 15.3], fov: 48 }} gl={{ antialias: false, powerPreference: 'high-performance' }}>
      <color attach="background" args={['#010208']} />
      <fog attach="fog" args={['#010208', 13, 29]} />
      <ambientLight intensity={0.08} />
      <Suspense fallback={null}><NeuralNetwork ready={ready} boot={boot} /></Suspense>
      <Stars radius={35} depth={18} count={CONFIG.starCount} factor={1.7} saturation={0.35} fade speed={0.22} />
      <OrbitControls makeDefault enablePan={false} minDistance={3.8} maxDistance={21} rotateSpeed={0.32} zoomSpeed={0.4} dampingFactor={0.055} enableDamping />
      <EffectComposer multisampling={0}>
        <Bloom intensity={CONFIG.bloomIntensity} luminanceThreshold={CONFIG.bloomThreshold} mipmapBlur radius={0.7} />
        <Noise opacity={0.025} /><Vignette eskil={false} offset={0.2} darkness={0.8} />
      </EffectComposer><AdaptiveDpr pixelated />
    </Canvas>
  </div>
}
