import { useEffect, useState } from 'react'
import BahiraLogo from './BahiraLogo'
import { ACT_LABELS, type ActId } from '../data/itinerary'
import { SEATS, DEPARTURE } from '../data/booking'
import { scrollState } from '../state/scrollStore'
import { scrollToId } from '../state/scrollApi'

export default function TopNav() {
  const [act, setAct] = useState<ActId>('I')

  useEffect(() => {
    let raf = 0
    const tick = () => {
      setAct((prev) => (prev === scrollState.act ? prev : scrollState.act))
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <header className="nav-material fixed inset-x-0 top-0 z-40 pt-[env(safe-area-inset-top)]">
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
