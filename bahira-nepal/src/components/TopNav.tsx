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
    <header className="fixed inset-x-0 top-0 z-40 border-b border-white/10 bg-obsidian/55 backdrop-blur-xl">
      <div className="mx-auto grid h-16 max-w-[1600px] grid-cols-[auto_1fr_auto] items-center gap-4 px-4 md:px-8">
        <div className="flex items-center gap-3">
          <BahiraLogo size={36} />
          <span className="font-display hidden text-xl text-ink sm:block">Bahira Expeditions</span>
        </div>

        <div className="min-w-0 text-center">
          <span
            key={act}
            className="block truncate font-mono text-xs text-sage"
            aria-live="polite"
          >
            {ACT_LABELS[act]}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden font-mono text-xs text-muted lg:block">
            {SEATS} seats · {DEPARTURE}
          </span>
          <button
            type="button"
            onClick={() => scrollToId('booking')}
            className="rounded-full bg-solar-hi px-4 py-2 text-sm font-medium text-obsidian transition hover:bg-white"
          >
            Reserve
          </button>
        </div>
      </div>
    </header>
  )
}
