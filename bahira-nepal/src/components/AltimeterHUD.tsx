import { useEffect, useRef } from 'react'
import { ABC_ALTITUDE } from '../data/itinerary'
import { scrollState, altitudeRatio } from '../state/scrollStore'

const RULER_MAX = 4500
const TICKS = Array.from({ length: RULER_MAX / 250 + 1 }, (_, i) => i * 250)

export default function AltimeterHUD() {
  const readout = useRef<HTMLSpanElement>(null)
  const marker = useRef<HTMLDivElement>(null)
  const rel = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    let shown = scrollState.altitude
    let last = performance.now()
    let raf = 0
    const tick = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000)
      last = now
      shown += (scrollState.altitude - shown) * (1 - Math.exp(-6 * dt))
      const v = Math.round(shown)
      if (readout.current) readout.current.textContent = `${v.toLocaleString('en-US')}m`
      if (marker.current) marker.current.style.bottom = `${(shown / RULER_MAX) * 100}%`
      if (rel.current) rel.current.textContent = `${Math.round(altitudeRatio(shown) * 100)}% OF ABC`
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <aside
      aria-label="Altitude"
      className="pointer-events-none fixed right-3 top-1/2 z-30 hidden -translate-y-1/2 select-none sm:block md:right-6"
    >
      <div className="flex flex-col items-end gap-3 font-mono">
        <div className="text-right">
          <div className="text-[10px] tracking-[0.2em] text-muted">ALTITUDE</div>
          <span ref={readout} className="text-2xl font-bold text-solar-hi md:text-3xl">
            1,400m
          </span>
          <div>
            <span ref={rel} className="text-[10px] tracking-widest text-muted">
              0% OF ABC
            </span>
          </div>
        </div>

        <div className="relative h-[42vh] w-16">
          <div className="absolute inset-y-0 right-0 w-px bg-white/20" />
          {TICKS.map((m) => {
            const major = m % 1000 === 0
            const label = major && m > 0 && m !== 4000
            return (
              <div
                key={m}
                className="absolute right-0 flex items-center gap-1.5"
                style={{ bottom: `${(m / RULER_MAX) * 100}%` }}
              >
                {label && <span className="text-[9px] text-muted">{m / 1000}k</span>}
                <span className={`h-px ${major ? 'w-3 bg-white/60' : 'w-1.5 bg-white/25'}`} />
              </div>
            )
          })}
          <div
            className="absolute right-0 flex translate-y-1/2 items-center gap-1.5 text-solar-hi"
            style={{ bottom: `${(ABC_ALTITUDE / RULER_MAX) * 100}%` }}
          >
            <span className="text-[9px] tracking-widest">ABC</span>
            <span className="h-px w-5 bg-solar-hi/70" />
          </div>
          <div
            ref={marker}
            className="absolute right-0 translate-x-[5px] translate-y-1/2"
            style={{ bottom: 0 }}
          >
            <span className="block h-3 w-3 rounded-full bg-solar-hi shadow-[0_0_18px_6px_rgba(255,184,0,0.65)]" />
          </div>
        </div>
      </div>
    </aside>
  )
}
