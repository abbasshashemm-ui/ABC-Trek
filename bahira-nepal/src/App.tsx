import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import TopNav from './components/TopNav'
import AltimeterHUD from './components/AltimeterHUD'
import Hero from './components/Hero'
import Journey from './components/Journey'
import Booking from './components/Booking'
import Guides from './components/Guides'
import SceneBoundary from './components/SceneBoundary'
import SummitCelebration from './components/SummitCelebration'
import { updateScroll } from './state/scrollStore'
import { scrollApi } from './state/scrollApi'

const Scene = lazy(() => import('./scene/Scene'))

export default function App() {
  const journey = useRef<HTMLElement>(null)
  // The 3D scene is ~280 KB gzipped plus shader compiles: fetch it once the hero text, fonts and logo
  // have painted, so a slow phone shows the headline and price first instead of a blank screen.
  const [sceneWanted, setSceneWanted] = useState(false)

  useEffect(() => {
    const start = () => setSceneWanted(true)
    if ('requestIdleCallback' in window) {
      const id = requestIdleCallback(start, { timeout: 1200 })
      return () => cancelIdleCallback(id)
    }
    const id = setTimeout(start, 300)
    return () => clearTimeout(id)
  }, [])

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const lenis = reduced ? null : new Lenis({ lerp: 0.085 })
    scrollApi.lenis = lenis
    lenis?.on('scroll', ScrollTrigger.update)

    const tick = (time: number) => {
      lenis?.raf(time * 1000)
      updateScroll(journey.current)
    }
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(tick)
      lenis?.destroy()
      scrollApi.lenis = null
    }
  }, [])

  return (
    <div className="relative min-h-screen bg-obsidian">
      <SceneBoundary>
        <Suspense fallback={null}>{sceneWanted && <Scene />}</Suspense>
      </SceneBoundary>
      <TopNav />
      <AltimeterHUD />
      <SummitCelebration />
      <main>
        <Hero />
        <Guides />
        <Journey ref={journey} />
        <Booking />
      </main>
    </div>
  )
}
