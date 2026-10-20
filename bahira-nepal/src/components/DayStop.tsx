import clsx from 'clsx'
import type { ItineraryDay } from '../data/itinerary'
import { photosFor } from '../data/photos'
import PhotoStrip from './PhotoStrip'

const height = (m: number) => (m === 0 ? 'sea level' : `${m.toLocaleString('en-US')} m`)
const pad = (n: number) => String(n).padStart(2, '0')

/**
 * One itinerary day, without a card: type sits straight on the valley (the journey-wide tint
 * in Journey.tsx keeps it legible),
 * with the day's 2–3 photos above it (tap to open the gallery).
 */
export default function DayStop({ item, side }: { item: ItineraryDay; side: 'left' | 'right' }) {
  const summit = item.day === 9

  return (
    <article
      data-day={item.day}
      className="relative flex min-h-[100svh] items-center py-24"
    >
      {/* Same page edges as the hero and guides; right-hand days keep clear of the altimeter */}
      <div className={clsx('shell flex', side === 'right' && 'md:justify-end md:max-xl:pr-36')}>
        <div data-reveal className="relative w-full max-w-md [text-shadow:0_1px_3px_rgb(13_15_14/0.6),0_2px_24px_rgb(13_15_14/0.85)]">
          {/* Base camp: fades in when the page settles here (SummitCelebration sets data-reached) */}
          {summit && (
            <p aria-hidden className="summit-figure figure mb-4 text-7xl text-ink md:text-8xl">
              4,130 m
            </p>
          )}

          <PhotoStrip photos={photosFor(item.day)} title={item.title} />

          <p className="tabular text-sm text-muted">
            <span className="font-semibold text-ember">Day {pad(item.day)}</span>
            <span aria-hidden> · </span>
            {item.region}
            <span aria-hidden> · </span>
            {height(item.altitude)}
          </p>
          <h2 className="heading-2 mt-2 text-ink">{item.title}</h2>
          <ul className="mt-5 space-y-2 text-[15px] leading-relaxed text-ink/80 md:text-base">
            {item.bullets.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </div>
      </div>
    </article>
  )
}
