import { Canvas } from '@react-three/fiber'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import { Stars } from '@react-three/drei'
import * as THREE from 'three'
import Terrain, { FOG_COLOR } from './Terrain'
import Trail from './Trail'
import Beacon from './Beacon'
import CameraRig from './CameraRig'

export default function Scene() {
  return (
    <Canvas
      className="!fixed inset-0 z-0"
      dpr={[1, 1.75]}
      camera={{ fov: 35, near: 0.5, far: 1400, position: [0, 30, 60] }}
      gl={{ antialias: false, powerPreference: 'high-performance', toneMapping: THREE.NoToneMapping }}
    >
      <color attach="background" args={[FOG_COLOR]} />
      <Stars radius={600} depth={80} count={1800} factor={5} fade speed={0.4} />
      <Terrain />
      <Trail />
      <Beacon />
      <CameraRig />
      <EffectComposer multisampling={4}>
        <Bloom mipmapBlur luminanceThreshold={0.55} luminanceSmoothing={0.2} intensity={1.15} radius={0.7} />
        <Vignette eskil={false} offset={0.2} darkness={0.75} />
      </EffectComposer>
    </Canvas>
  )
}
