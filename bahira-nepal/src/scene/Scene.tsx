import { useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { PerformanceMonitor } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import * as THREE from 'three'
import Terrain from './Terrain'
import Sky from './Sky'
import Trail from './Trail'
import Beacon from './Beacon'
import CameraRig from './CameraRig'
import Atmosphere from './Atmosphere'
import Props from './props/Props'

/** Phones get a lower resolution ceiling; desktop keeps the sharper one. */
const COARSE = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches
const MAX_DPR = COARSE ? 1.5 : 1.75

/** Fades the canvas in once real frames are on screen (shaders compiled), instead of popping in. */
function FadeIn() {
  const gl = useThree((s) => s.gl)
  const frames = useRef(0)
  useFrame(() => {
    if (++frames.current === 3) gl.domElement.style.opacity = '1'
  })
  return null
}

export default function Scene() {
  // Drop resolution (MSAA stays: changing it rebuilds the composer and flashes black) if the device can't hold a smooth frame rate (low-end Android).
  const [low, setLow] = useState(false)

  return (
    <Canvas
      // 100lvh: run behind the iOS Safari toolbars instead of stopping above them
      className="!fixed inset-x-0 top-0 z-0 !h-lvh"
      dpr={low ? 1 : [1, MAX_DPR]}
      onCreated={({ gl }) => {
        gl.domElement.style.opacity = '0'
        gl.domElement.style.transition = 'opacity 900ms ease-out'
      }}
      camera={{ fov: 35, near: 0.5, far: 1200, position: [0, 30, 60] }}
      gl={{ antialias: false, powerPreference: 'high-performance', toneMapping: THREE.NoToneMapping }}
    >
      <PerformanceMonitor onDecline={() => setLow(true)} flipflops={1} />
      <FadeIn />
      <Sky />
      <Atmosphere />
      <Terrain />
      <Props />
      <Trail />
      <Beacon />
      <CameraRig />
      <EffectComposer multisampling={COARSE ? 2 : 4}>
        <Bloom mipmapBlur luminanceThreshold={1} luminanceSmoothing={0.15} intensity={0.7} radius={0.7} />
        <Vignette eskil={false} offset={0.3} darkness={0.3} />
      </EffectComposer>
    </Canvas>
  )
}
