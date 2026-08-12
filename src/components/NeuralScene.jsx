import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import { Bloom, EffectComposer, SMAA, Vignette } from '@react-three/postprocessing'
import { Suspense } from 'react'
import * as THREE from 'three'
import NeuralNetwork from './NeuralNetwork'
import { CONFIG } from '../config/neuralConfig'

export default function NeuralScene({ ready, boot }) {
  const revealed = ['impact', 'network', 'identity', 'zones', 'online', 'reveal'].includes(boot.phase)
  return <div className={`scene ${ready ? 'online' : ''} ${revealed ? 'boot-reveal' : ''} boot-${boot.phase}`}>
    <Canvas dpr={[1.25, 2]} camera={{ position: [0, 0, 24], fov: 48 }} gl={{ antialias: true, powerPreference: 'high-performance', alpha: false, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: .88, outputColorSpace: THREE.SRGBColorSpace }} onCreated={({ gl }) => { gl.outputColorSpace = THREE.SRGBColorSpace; gl.toneMapping = THREE.ACESFilmicToneMapping; gl.toneMappingExposure = .88 }}>
      <color attach="background" args={['#000106']} />
      <fog attach="fog" args={['#000106', 22, 40]} />
      <Suspense fallback={null}><NeuralNetwork ready={ready} boot={boot} /></Suspense>
      <Stars radius={35} depth={18} count={CONFIG.starCount} factor={1.7} saturation={0.35} fade speed={0.22} />
      <OrbitControls makeDefault enablePan={false} minDistance={3.8} maxDistance={30} rotateSpeed={0.32} zoomSpeed={0.4} dampingFactor={0.055} enableDamping />
      <EffectComposer multisampling={4}>
        <Bloom intensity={CONFIG.bloomIntensity} luminanceThreshold={CONFIG.bloomThreshold} luminanceSmoothing={.12} mipmapBlur radius={.18} />
        <SMAA /><Vignette eskil={false} offset={0.24} darkness={0.58} />
      </EffectComposer>
    </Canvas>
  </div>
}
