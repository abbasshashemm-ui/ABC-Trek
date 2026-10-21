import { useState } from 'react'
import clsx from 'clsx'
import { Dialog } from '@base-ui/react/dialog'
import { photosFor } from '../data/photos'
import Lightbox from './Lightbox'

/** Their public trek logs; tracking params stripped from the links the client sent. */
const PROFILES = [
  { name: 'Hmayed', handle: 'mhmd_hmayed' },
  { name: 'Farhat', handle: '_hsenfarhat_' },
]

/** Instagram's glyph (lucide v1 dropped brand icons). */
function InstagramGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
    </svg>
  )
}

/** "Meet your guides": who runs the trip, what they've walked, and where to see it. */
export default function Guides() {
  const photos = photosFor('guides')
  const [handle] = useState(() => Dialog.createHandle<number>())

  return (
    <section
      id="guides"
      className="relative z-10 bg-[linear-gradient(to_bottom,var(--color-obsidian)_75%,transparent)] pb-32 pt-16 md:pt-24"
    >
      <div className="shell grid items-center gap-10 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
        <div>
          <p className="eyebrow">Your guides</p>
          <h2 className="heading-2 mt-3 text-ink">
            You’ll walk with Hmayed &amp; Farhat.
          </h2>
          <p className="lead mt-6 max-w-md">
            Both are experienced trekkers. They’ve reached Everest Base Camp, walked this trail to Annapurna Base Camp,
            and done many treks besides. This April they lead a small group along the same route.
          </p>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-muted">
            Bahira Expeditions is run by Hussein Farhat.
          </p>

          <ul className="pointer-events-auto mt-7 flex flex-wrap gap-2">
            {PROFILES.map((p) => (
              <li key={p.handle}>
                <a
                  href={`https://www.instagram.com/${p.handle}/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${p.name} on Instagram, @${p.handle}`}
                  className="btn btn-glass h-11 gap-2 px-4 text-sm"
                >
                  <InstagramGlyph />@{p.handle}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {photos.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {photos.map((p, i) => (
              <Dialog.Trigger
                key={p.src}
                handle={handle}
                payload={i}
                aria-label={`Open photo: ${p.alt}`}
                className={clsx(
                  'group relative overflow-hidden rounded-2xl bg-white/5 text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ember',
                  i === 2 ? 'col-span-2 aspect-[16/9]' : 'aspect-[3/4]',
                )}
              >
                <img
                  src={p.src}
                  srcSet={p.srcSet}
                  sizes={i === 2 ? '(min-width: 1024px) 640px, 90vw' : '(min-width: 1024px) 320px, 45vw'}
                  alt={p.alt}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]"
                />
                <span className="absolute inset-x-0 bottom-0 bg-[linear-gradient(to_top,rgb(13_15_14/0.75),transparent)] px-3 pb-2.5 pt-8 text-xs text-ink/90">
                  {p.alt}
                </span>
              </Dialog.Trigger>
            ))}
          </div>
        )}
      </div>
      {photos.length > 0 && <Lightbox handle={handle} photos={photos} title="Hmayed & Farhat" />}
    </section>
  )
}
