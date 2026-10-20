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
      className={clsx(
        'relative flex min-h-[100svh] items-center px-5 py-24 md:px-16 md:pr-40',
        side === 'right' && 'md:justify-end',
      )}
    >
      <div data-reveal className="relative w-full max-w-md [text-shadow:0_1px_20px_rgb(10_17_14/0.75)]">
        {/* Base camp: fades in when the page settles here (SummitCelebration sets data-reached) */}
        {summit && (
          <p aria-hidden className="summit-figure font-display tabular mb-4 text-7xl leading-none text-ink md:text-8xl">
            4,130 m
          </p>
        )}

        <PhotoStrip photos={photosFor(item.day)} title={item.title} />

        <p className="font-mono text-xs text-ink/60">
          <span className="text-solar-hi">Day {pad(item.day)}</span>
          <span aria-hidden> · </span>
          {item.region}
          <span aria-hidden> · </span>
          {height(item.altitude)}
        </p>
        <h2 className="font-display mt-3 text-[2.6rem] leading-[1] tracking-[-0.01em] text-ink md:text-6xl">
          {item.title}
        </h2>
        <ul className="mt-5 space-y-2 text-[15px] leading-relaxed text-ink/80 md:text-base">
          {item.bullets.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
      </div>
    </article>
  )
}
