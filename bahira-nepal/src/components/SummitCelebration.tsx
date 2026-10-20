import { useEffect, useState } from 'react'
import clsx from 'clsx'
import confetti from 'canvas-confetti'
import { scrollState } from '../state/scrollStore'
import { scrollApi } from '../state/scrollApi'

/** Day 9 (Annapurna Base Camp) is dayFloat 8 when its card is centred; fire just before. */
const FIRE_AT = 7.85
/** Scrolling back below this (down the trail) re-arms it. */
const REARM_BELOW = 7
/** A bigger change in one frame is a jump (scroll restoration on reload, anchor link), not a climb. */
const MAX_STEP = 1
/** How long the page holds on the base-camp card while the confetti plays. */
const HOLD_MS = 3000
const SETTLE_S = 0.8

/**
 * Ease the Day 9 card to the centre, then hold scrolling for HOLD_MS. Only with Lenis:
 * without it (reduced motion) the page never takes over the user's scroll.
 * Escape, or any button-driven scroll (scrollToId), releases early. Returns a cancel.
 */
function holdOnBaseCamp(): () => void {
  const lenis = scrollApi.lenis
  const card = document.querySelectorAll<HTMLElement>('#journey > div')[8]
  if (!lenis || !card) return () => {}
  const journey = document.getElementById('journey')!
  const target = journey.offsetTop + card.offsetTop + card.offsetHeight / 2 - window.innerHeight / 2
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
  // Stop first: the stopped state sets overflow:hidden, which also blocks native wheel/touch.
  // (`lock` alone only makes Lenis ignore input, so the browser still scrolls during the glide.)
  lenis.stop()
  lenis.scrollTo(target, { duration: SETTLE_S, force: true })
  const timer = window.setTimeout(release, HOLD_MS)
  return release
}

// Prayer-flag colours (sky, air, fire, water, earth) plus Bahira gold.
const COLORS = ['#1f5fbf', '#f5f5f0', '#c62828', '#2e7d32', '#f9c80e', '#ffc700']

function burst() {
  const small = window.innerWidth < 640
  const base: confetti.Options = {
    particleCount: small ? 45 : 90,
    spread: 70,
    startVelocity: small ? 45 : 58,
    ticks: 260,
    gravity: 0.9,
    scalar: 1.05,
    shapes: ['square'],
    colors: COLORS,
    zIndex: 70,
    // Respects the OS "reduce motion" setting; the badge still shows.
    disableForReducedMotion: true,
  }
  confetti({ ...base, angle: 60, origin: { x: 0, y: 1 } })
  confetti({ ...base, angle: 120, origin: { x: 1, y: 1 } })
  window.setTimeout(() => {
    confetti({ ...base, particleCount: base.particleCount! / 2, angle: 75, origin: { x: 0.1, y: 1 } })
    confetti({ ...base, particleCount: base.particleCount! / 2, angle: 105, origin: { x: 0.9, y: 1 } })
  }, 280)
}

/** Confetti + a short "you made it" badge the first time the scroll reaches base camp going up. */
export default function SummitCelebration() {
  const [shown, setShown] = useState(false)

  useEffect(() => {
    let raf = 0
    let prev: number | null = null // first frame only records position, so a reload mid-page never fires
    let armed = true
    let hide = 0
    let releaseHold = () => {}
    const tick = () => {
      const d = scrollState.dayFloat
      if (prev !== null) {
        const climbed = prev < FIRE_AT && d >= FIRE_AT && d - prev < MAX_STEP
        if (armed && climbed && !scrollApi.auto) {
          armed = false
          burst()
          releaseHold = holdOnBaseCamp()
          setShown(true)
          window.clearTimeout(hide)
          hide = window.setTimeout(() => setShown(false), HOLD_MS + 1200)
        }
        if (d < REARM_BELOW) armed = true
      }
      prev = d
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      window.clearTimeout(hide)
      releaseHold()
    }
  }, [])

  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 top-20 z-[65] flex justify-center px-4">
      <div
        className={clsx(
          'rounded-full border border-solar-hi/40 bg-obsidian/80 px-5 py-2.5 text-center backdrop-blur-md transition duration-500',
          shown ? 'translate-y-0 opacity-100' : '-translate-y-3 opacity-0',
        )}
      >
        {shown && (
          <p className="text-sm text-ink">
            <span className="font-display text-lg text-solar-hi">Base camp.</span> You made it to 4,130 m.
          </p>
        )}
      </div>
    </div>
  )
}
