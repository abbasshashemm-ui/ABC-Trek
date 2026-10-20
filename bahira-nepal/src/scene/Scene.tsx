import { Canvas } from '@react-three/fiber'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import * as THREE from 'three'
import Terrain from './Terrain'
import Sky from './Sky'
import Trail from './Trail'
import Beacon from './Beacon'
import CameraRig from './CameraRig'
import Atmosphere from './Atmosphere'
import Props from './props/Props'

export default function Scene() {
  return (
    <Canvas
      className="!fixed inset-0 z-0"
      dpr={[1, 1.75]}
      camera={{ fov: 35, near: 0.5, far: 1200, position: [0, 30, 60] }}
      gl={{ antialias: false, powerPreference: 'high-performance', toneMapping: THREE.NoToneMapping }}
    >
      <Sky />
      <Atmosphere />
      <Terrain />
      <Props />
      <Trail />
      <Beacon />
      <CameraRig />
      <EffectComposer multisampling={4}>
        <Bloom mipmapBlur luminanceThreshold={0.9} luminanceSmoothing={0.15} intensity={0.9} radius={0.7} />
        <Vignette eskil={false} offset={0.25} darkness={0.55} />
      </EffectComposer>
    </Canvas>
  )
}
