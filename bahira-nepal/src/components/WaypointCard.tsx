import clsx from 'clsx'
import type { ItineraryDay } from '../data/itinerary'
import { photosForDay } from '../data/photos'
import PhotoStrip from './PhotoStrip'

interface Props {
  item: ItineraryDay
  side: 'left' | 'right'
}

const height = (m: number) => (m === 0 ? 'sea level' : `${m.toLocaleString('en-US')} m`)

export default function WaypointCard({ item, side }: Props) {
  return (
    <article
      data-card
      className={clsx(
        'pointer-events-auto w-full max-w-xl rounded-2xl border border-white/10 bg-panel/80 p-5 backdrop-blur-xl md:p-7',
        side === 'right' ? 'md:ml-auto' : 'md:mr-auto',
      )}
    >
      <PhotoStrip photos={photosForDay(item.day)} title={item.title} />

      <p className="flex flex-wrap items-center gap-x-2 font-mono text-xs text-muted">
        <span className="text-solar-hi">Day {String(item.day).padStart(2, '0')}</span>
        <span aria-hidden>·</span>
        <span>{item.region}</span>
        <span aria-hidden>·</span>
        <span>{height(item.altitude)}</span>
      </p>

      <h2 className="font-display mt-2 text-3xl leading-tight text-ink md:text-4xl">{item.title}</h2>

      <ul className="mt-4 space-y-2 text-[15px] leading-relaxed text-ink/80">
        {item.bullets.map((b) => (
          <li key={b}>{b}</li>
        ))}
      </ul>
    </article>
  )
}
