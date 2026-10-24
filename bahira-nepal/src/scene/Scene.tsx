import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { PerformanceMonitor } from '@react-three/drei'
import { EffectComposer, Bloom, ToneMapping, Vignette } from '@react-three/postprocessing'
import { ToneMappingMode } from 'postprocessing'
import * as THREE from 'three'
import Terrain from './Terrain'
import Sky from './Sky'
import Trail from './Trail'
import Trekkers from './Trekkers'
import CameraRig from './CameraRig'
import Atmosphere from './Atmosphere'
import Props from './props/Props'
import { COARSE, IOS } from './device'

/** Phones get a lower resolution ceiling; desktop keeps the sharper one. */
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

/**
 * iOS Safari 26 clips position: fixed (and sticky) layers at the status bar and the floating toolbar and paints
 * a flat colour there, while ordinary page content runs behind both. So on iOS the canvas is a normal absolute
 * layer that follows the scroll (one transform per frame), with OVERSCAN px drawn above and below the screen
 * so a frame of scroll lag during a fling never uncovers an edge. Everywhere else it stays fixed.
 */
const OVERSCAN = IOS ? 64 : 0

/** Keeps the lens framing the visible screen, not the taller overscanned canvas. */
function OverscanLens() {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera & { manual?: boolean }
  const size = useThree((s) => s.size)
  useLayoutEffect(() => {
    const h = size.height - 2 * OVERSCAN
    camera.manual = true // R3F would otherwise reset the aspect to the taller canvas on resize
    camera.aspect = size.width / h
    camera.setViewOffset(size.width, h, 0, -OVERSCAN, size.width, size.height)
    camera.updateProjectionMatrix()
  }, [camera, size.width, size.height])
  return null
}

/** iOS only: an absolute layer moved to the top of the screen every frame (see OVERSCAN). */
function ScrollLayer({ children }: { children: ReactNode }) {
  const layer = useRef<HTMLDivElement>(null)
  useEffect(() => {
    let raf = 0
    const place = () => {
      if (layer.current) layer.current.style.transform = `translate3d(0, ${window.scrollY - OVERSCAN}px, 0)`
    }
    const loop = () => {
      place()
      raf = requestAnimationFrame(loop)
    }
    loop()
    window.addEventListener('scroll', place, { passive: true })
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', place)
    }
  }, [])
  return (
    // Clip box spans the page, so the layer's overscan past the last screen never lengthens the page.
    <div aria-hidden className="absolute inset-0 z-0 overflow-clip">
      <div
        ref={layer}
        className="absolute inset-x-0 top-0 will-change-transform"
        style={{ height: `calc(100lvh + ${2 * OVERSCAN}px)` }}
      >
        {children}
      </div>
    </div>
  )
}

export default function Scene() {
  // Drop resolution (MSAA stays: changing it rebuilds the composer and flashes black) if the device can't hold a smooth frame rate (low-end Android).
  const [low, setLow] = useState(false)

  const canvas = (
    <Canvas
      // 100lvh: run behind the browser toolbars instead of stopping above them
      className={IOS ? undefined : '!fixed inset-x-0 top-0 z-0 !h-lvh'}
      // The canvas never moves relative to the screen, so skip remeasuring on every scroll.
      resize={{ scroll: false }}
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
      {IOS && <OverscanLens />}
      <Sky />
      <Atmosphere />
      <Terrain />
      <Props />
      <Trail />
      <Trekkers />
      <CameraRig />
      <EffectComposer multisampling={COARSE ? 2 : 4}>
        <Bloom mipmapBlur luminanceThreshold={1.1} luminanceSmoothing={0.15} intensity={0.6} radius={0.7} />
        {/* Khronos neutral: leaves mid-tones and the palette as authored, rolls sunlit snow off
            instead of clipping it flat white. Runs inside the same effect pass (no extra draw). */}
        <ToneMapping mode={ToneMappingMode.NEUTRAL} />
        <Vignette eskil={false} offset={0.3} darkness={0.3} />
      </EffectComposer>
    </Canvas>
  )
  return IOS ? <ScrollLayer>{canvas}</ScrollLayer> : canvas
}
