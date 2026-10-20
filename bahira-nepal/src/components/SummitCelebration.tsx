import { useEffect } from 'react'
import confetti from 'canvas-confetti'
import { scrollApi } from '../state/scrollApi'

/** How long the page rests on the base-camp photo. */
const HOLD_MS = 3000
const SETTLE_S = 1.1
/** The moment counts as reached when its top climbs above this fraction of the viewport. */
const ARRIVE_AT = 0.45

// Prayer-flag colours (sky, air, fire, water, earth).
const FLAG_COLORS = ['#1f5fbf', '#f5f5f0', '#c62828', '#2e7d32', '#f9c80e']

/** A handful of flag pieces drifting down, not a burst. */
function driftFlags() {
  const n = window.innerWidth < 640 ? 4 : 7
  for (let i = 0; i < n; i++) {
    window.setTimeout(() => {
      confetti({
        particleCount: 3,
        angle: 270,
        spread: 40,
        startVelocity: 4,
        gravity: 0.32,
        drift: (Math.random() - 0.5) * 1.2,
        ticks: 520,
        scalar: 1.25,
        flat: true,
        shapes: ['square'],
        colors: FLAG_COLORS,
        origin: { x: 0.1 + Math.random() * 0.8, y: -0.05 },
        zIndex: 70,
        disableForReducedMotion: true,
      })
    }, i * 260)
  }
}

/** Ease the photo to fill the screen, then rest on it. Escape or any button-driven scroll releases. */
function holdOn(el: HTMLElement): () => void {
  const lenis = scrollApi.lenis
  // Reduced motion runs without Lenis: never take over the user's scroll there.
  if (!lenis) return () => {}
  let done = false
  const release = () => {
    if (done) return
    done = true
    window.clearTimeout(timer)
    window.removeEventListener('keydown', onKey)
    if (!scrollApi.auto) lenis.start()
  }
  const onKey = (e: KeyboardEvent) => e.key === 'Escape' && release()
  window.addEventListener('keydown', onKey)
  // stop() first: the stopped state also blocks native wheel/touch during the glide.
  lenis.stop()
  lenis.scrollTo(el, { duration: SETTLE_S, force: true })
  const timer = window.setTimeout(release, HOLD_MS)
  return release
}

/**
 * Base camp, quietly: when the Day 9 photo scrolls up into place the page settles on it,
 * "4,130 m" fades in over the photo (CSS on [data-reached]) and a few prayer flags drift down.
 * Only on a real climb: not on reload/jumps, not while a button scroll flies past.
 */
export default function SummitCelebration() {
  useEffect(() => {
    let raf = 0
    let prevTop: number | null = null
    let armed = true
    let release = () => {}
    const tick = () => {
      const el = document.querySelector<HTMLElement>('[data-moment="9"]')
      if (el) {
        const vh = window.innerHeight
        const top = el.getBoundingClientRect().top
        if (prevTop !== null) {
          const line = vh * ARRIVE_AT
          const climbed = prevTop > line && top <= line && prevTop - top < vh // >1 screen in a frame = jump
          if (armed && climbed && !scrollApi.auto) {
            armed = false
            el.dataset.reached = 'true'
            driftFlags()
            release = holdOn(el)
          }
          // Re-arm once the photo is back below the fold (scrolled down the trail).
          if (top > vh) {
            armed = true
            delete el.dataset.reached
          }
        }
        // Arriving any other way (reload, jump) still shows the altitude, just without the moment.
        if (top < vh * 0.2 && top > -vh * 0.5) el.dataset.reached = 'true'
        prevTop = top
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      release()
    }
  }, [])

  return null
}
