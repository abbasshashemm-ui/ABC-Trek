import { useEffect, useState } from 'react'
import clsx from 'clsx'
import BahiraLogo from './BahiraLogo'
import { ACT_LABELS, type ActId } from '../data/itinerary'
import { SEATS, DEPARTURE } from '../data/booking'
import { scrollState } from '../state/scrollStore'
import { scrollToId } from '../state/scrollApi'

export default function TopNav() {
  const [act, setAct] = useState<ActId>('I')
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    let raf = 0
    let lastY = window.scrollY
    const tick = () => {
      setAct((prev) => (prev === scrollState.act ? prev : scrollState.act))
      // Auto-hide: out of the way while reading down (photos stay full-screen), back on any scroll up.
      const y = window.scrollY
      const dy = y - lastY
      if (Math.abs(dy) > 6) {
        const next = y > 120 && dy > 0
        setHidden((prev) => (prev === next ? prev : next))
        lastY = y
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <header
      className={clsx(
        'nav-material fixed inset-x-0 top-0 z-40 pt-[env(safe-area-inset-top)] transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none',
        hidden && '-translate-y-[calc(100%+24px)]',
      )}
      // Keyboard users tabbing to a hidden bar should still see it.
      onFocusCapture={() => setHidden(false)}
    >
      <div className="relative mx-auto grid h-14 max-w-[1600px] grid-cols-[auto_1fr_auto] items-center gap-4 pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] md:h-16 md:px-8">
        <div className="flex items-center gap-3">
          <BahiraLogo size={34} />
          <span className="font-display hidden text-xl tracking-[-0.01em] text-ink sm:block">Bahira Expeditions</span>
        </div>

        <div className="min-w-0 text-center">
          <span
            key={act}
            className="block truncate text-[13px] font-medium tracking-[0.01em] text-ink/80"
            aria-live="polite"
          >
            {ACT_LABELS[act]}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden text-[13px] text-ink/60 lg:block">
            {SEATS} seats · {DEPARTURE}
          </span>
          <button
            type="button"
            onClick={() => scrollToId('booking')}
            className="btn btn-glass h-9 px-4 text-sm"
          >
            Reserve
          </button>
        </div>
      </div>
    </header>
  )
}
