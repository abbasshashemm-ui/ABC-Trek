import { lazy, Suspense, useEffect, useRef } from 'react'
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
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
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
