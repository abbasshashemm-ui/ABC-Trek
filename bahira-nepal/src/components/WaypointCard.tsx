import { Mountain, MapPin } from 'lucide-react'
import { actOf, ACT_LABELS, type ItineraryDay } from '../data/itinerary'

interface Props {
  item: ItineraryDay
  side: 'left' | 'right'
}

export default function WaypointCard({ item, side }: Props) {
  return (
    <article
      data-card
      className={`pointer-events-auto w-full max-w-xl rounded-2xl border border-white/10 bg-panel/75 p-6 backdrop-blur-xl md:p-8 ${
        side === 'right' ? 'md:ml-auto' : 'md:mr-auto'
      }`}
    >
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="rounded-full border border-sage/40 bg-sage/10 px-3 py-1 font-mono text-[10px] tracking-[0.15em] text-sage">
          {ACT_LABELS[actOf(item)]}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full border border-white/15 px-3 py-1 text-[11px] text-muted">
          <MapPin size={12} aria-hidden /> {item.region}
        </span>
      </div>

      <div className="font-mono text-xs tracking-[0.25em] text-solar">
        DAY {String(item.day).padStart(2, '0')}
      </div>
      <h2 className="font-display mt-1 text-2xl font-semibold leading-tight text-ink md:text-3xl">
        {item.title}
      </h2>

      <span className="mt-4 inline-flex items-center gap-2 rounded-lg bg-white/5 px-3 py-1.5 font-mono text-xs text-solar-hi">
        <Mountain size={14} aria-hidden /> {item.altitude.toLocaleString('en-US')}m
      </span>

      <ul className="mt-5 space-y-3 text-[15px] leading-relaxed text-ink/85">
        {item.bullets.map((b) => (
          <li key={b} className="flex gap-3">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-solar" aria-hidden />
            <span>{b}</span>
          </li>
        ))}
      </ul>
    </article>
  )
}
