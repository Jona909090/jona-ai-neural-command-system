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
    <Canvas dpr={[1.25, 2]} camera={{ position: [0, 0, 20.8], fov: 50 }} gl={{ antialias: true, powerPreference: 'high-performance', alpha: false, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.02, outputColorSpace: THREE.SRGBColorSpace }} onCreated={({ gl }) => { gl.outputColorSpace = THREE.SRGBColorSpace; gl.toneMapping = THREE.ACESFilmicToneMapping; gl.toneMappingExposure = 1.02 }}>
      <color attach="background" args={['#01030a']} />
      <fog attach="fog" args={['#01030a', 24, 42]} />
      <Suspense fallback={null}><NeuralNetwork ready={ready} boot={boot} /></Suspense>
      <Stars radius={34} depth={17} count={Math.max(CONFIG.starCount, 1700)} factor={1.9} saturation={0.5} fade speed={0.28} />
      <OrbitControls makeDefault enablePan={false} minDistance={10} maxDistance={25} rotateSpeed={0.18} zoomSpeed={0.32} dampingFactor={0.06} enableDamping />
      <EffectComposer multisampling={4}>
        <Bloom intensity={Math.max(CONFIG.bloomIntensity, 1.55)} luminanceThreshold={0.08} luminanceSmoothing={.2} mipmapBlur radius={.32} />
        <SMAA /><Vignette eskil={false} offset={0.2} darkness={0.48} />
      </EffectComposer>
    </Canvas>
  </div>
}
