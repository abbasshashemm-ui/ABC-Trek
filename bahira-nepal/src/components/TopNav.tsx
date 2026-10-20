import { useEffect, useState } from 'react'
import BahiraLogo from './BahiraLogo'
import { ACT_LABELS, type ActId } from '../data/itinerary'
import { SEATS, PRICE } from '../data/booking'
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
    <header className="fixed inset-x-0 top-0 z-40 border-b border-white/10 bg-obsidian/55 backdrop-blur-xl">
      <div className="mx-auto grid h-16 max-w-[1600px] grid-cols-[auto_1fr_auto] items-center gap-4 px-4 md:px-8">
        <div className="flex items-center gap-3">
          <BahiraLogo size={36} />
          <span className="font-display hidden text-sm font-semibold text-ink sm:block">
            BAHIRA EXPEDITIONS
          </span>
        </div>

        <div className="min-w-0 text-center">
          <span
            key={act}
            className="block truncate font-mono text-[9px] tracking-[0.12em] text-sage sm:text-xs sm:tracking-[0.18em] md:text-sm"
            aria-live="polite"
          >
            {ACT_LABELS[act]}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden items-center gap-2 rounded-full border border-solar/40 bg-solar/10 px-3 py-1.5 font-mono text-xs text-solar-hi lg:flex">
            <span className="animate-pulse-dot h-1.5 w-1.5 rounded-full bg-solar" />
            {SEATS} SEATS ONLY · APR 3
          </span>
          <button
            type="button"
            onClick={() => scrollToId('booking')}
            className="rounded-full bg-gradient-to-r from-solar to-solar-hi px-4 py-2 text-xs font-semibold text-obsidian shadow-[0_0_24px_rgba(255,138,0,0.35)] transition hover:brightness-110 sm:text-sm"
          >
            Reserve ({PRICE})
          </button>
        </div>
      </div>
    </header>
  )
}
