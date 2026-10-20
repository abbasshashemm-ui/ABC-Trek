import { useState } from 'react'
import clsx from 'clsx'
import { Dialog } from '@base-ui/react/dialog'
import { Images } from 'lucide-react'
import type { ItineraryDay } from '../data/itinerary'
import { photosFor, type Photo } from '../data/photos'
import Lightbox, { type LightboxHandle } from './Lightbox'

const height = (m: number) => (m === 0 ? 'sea level' : `${m.toLocaleString('en-US')} m`)
const pad = (n: number) => String(n).padStart(2, '0')

/**
 * One itinerary day, without a card: type sits straight on the valley over a soft scrim.
 * Days with a sharp photo get a full-screen photo moment after the text; the rest show a
 * framed photo inside the text block. Every photo opens the day's gallery.
 */
export default function DayStop({ item, side }: { item: ItineraryDay; side: 'left' | 'right' }) {
  const photos = photosFor(item.day)
  const lead = photos[0]
  const [handle] = useState(() => Dialog.createHandle<number>())
  const moment = lead?.full

  return (
    <>
      <article
        data-day={item.day}
        className={clsx(
          'relative flex min-h-[100svh] items-center px-5 py-24 md:px-16 md:pr-40',
          side === 'right' && 'md:justify-end',
        )}
      >
        {/* Scrim: darkens behind the text only, so the valley stays visible around it */}
        <div
          aria-hidden
          className={clsx(
            'pointer-events-none absolute inset-0',
            side === 'left'
              ? 'bg-[radial-gradient(ellipse_70%_55%_at_20%_50%,rgb(10_17_14/0.82),transparent_75%)]'
              : 'bg-[radial-gradient(ellipse_70%_55%_at_80%_50%,rgb(10_17_14/0.82),transparent_75%)]',
            'max-md:bg-[radial-gradient(ellipse_120%_60%_at_50%_55%,rgb(10_17_14/0.85),transparent_80%)]',
          )}
        />

        <div data-reveal className="relative w-full max-w-md">
          {lead && !moment && <FramedPhoto photos={photos} handle={handle} />}

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

      {moment && <PhotoMoment item={item} photo={lead} count={photos.length} handle={handle} />}
      {lead && <Lightbox handle={handle} photos={photos} title={item.title} />}
    </>
  )
}

function FramedPhoto({ photos, handle }: { photos: Photo[]; handle: LightboxHandle }) {
  const p = photos[0]
  return (
    <Dialog.Trigger
      handle={handle}
      payload={0}
      aria-label={`Open photos: ${p.alt}`}
      className="pointer-events-auto group relative mb-6 block aspect-[4/3] w-full overflow-hidden rounded-2xl bg-white/5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-solar-hi"
    >
      <img
        src={p.src}
        srcSet={p.srcSet}
        sizes="(min-width: 768px) 448px, 90vw"
        alt={p.alt}
        loading="lazy"
        decoding="async"
        className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]"
      />
      <PhotoMeta photo={p} count={photos.length} />
    </Dialog.Trigger>
  )
}

/** Edge-to-edge photo between days. Fades and settles in as it scrolls into view (CSS scroll timeline). */
function PhotoMoment({ item, photo, count, handle }: { item: ItineraryDay; photo: Photo; count: number; handle: LightboxHandle }) {
  const summit = item.day === 9
  return (
    <figure data-moment={item.day} className="relative h-[100lvh] overflow-hidden bg-obsidian">
      <Dialog.Trigger
        handle={handle}
        payload={0}
        aria-label={`Open photos: ${photo.alt}`}
        className="pointer-events-auto absolute inset-0 block h-full w-full focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-solar-hi"
      >
        <img
          src={photo.src}
          srcSet={photo.srcSet}
          sizes="100vw"
          alt={photo.alt}
          loading="lazy"
          decoding="async"
          className="moment-img h-full w-full object-cover"
        />
      </Dialog.Trigger>
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgb(10_17_14/0.85),transparent_45%),linear-gradient(to_bottom,rgb(10_17_14/0.5),transparent_25%)]" />

      {summit && (
        <p aria-hidden className="summit-figure font-display tabular pointer-events-none absolute inset-x-0 top-[16%] text-center text-[22vw] leading-none text-ink md:top-[6%] md:text-[clamp(4rem,11vw,10rem)]">
          4,130 m
        </p>
      )}

      <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 px-5 pb-[max(2.5rem,calc(env(safe-area-inset-bottom)+1.5rem))] md:px-16 md:pb-14">
        <p className="font-mono text-xs text-ink/70">
          Day {pad(item.day)} · {item.region}
        </p>
        <p className="font-display mt-1 text-2xl text-ink md:text-3xl">{photo.alt}</p>
        <PhotoMeta photo={photo} count={count} inline />
      </figcaption>
    </figure>
  )
}

function PhotoMeta({ photo, count, inline }: { photo: Photo; count: number; inline?: boolean }) {
  if (!photo.ours && count < 2) return null
  return (
    <span
      className={clsx(
        'flex items-center gap-2 text-[11px] text-ink/85',
        inline ? 'mt-3' : 'absolute bottom-2.5 left-2.5',
      )}
    >
      {photo.ours && <span className="rounded-full bg-obsidian/70 px-2 py-0.5 text-solar-hi backdrop-blur">Our trek</span>}
      {count > 1 && (
        <span className="inline-flex items-center gap-1 rounded-full bg-obsidian/70 px-2 py-0.5 backdrop-blur">
          <Images size={12} aria-hidden /> {count}
        </span>
      )}
    </span>
  )
}
