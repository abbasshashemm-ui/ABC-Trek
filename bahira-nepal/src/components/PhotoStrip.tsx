import { useState } from 'react'
import type { Photo } from '../data/photos'
import Lightbox from './Lightbox'

/** 1 photo: wide. 2: side by side. 3: one tall lead + two stacked. */
export default function PhotoStrip({ photos, title }: { photos: Photo[]; title: string }) {
  const [open, setOpen] = useState<number | null>(null)
  if (!photos.length) return null
  const shown = photos.slice(0, 3)
  const grid =
    shown.length === 1 ? 'grid-cols-1' : shown.length === 2 ? 'grid-cols-2' : 'grid-cols-[1.4fr_1fr] grid-rows-2'

  return (
    <>
      <div className={`mb-5 grid gap-2 ${grid} ${shown.length === 3 ? 'h-56 md:h-64' : 'h-44 md:h-52'}`}>
        {shown.map((p, i) => (
          <button
            key={p.src}
            type="button"
            onClick={() => setOpen(i)}
            aria-label={`Open photo: ${p.alt}`}
            className={`group relative overflow-hidden rounded-xl bg-white/5 focus-visible:outline-2 focus-visible:outline-solar ${
              shown.length === 3 && i === 0 ? 'row-span-2' : ''
            }`}
          >
            <img
              src={p.src}
              srcSet={p.srcSet}
              sizes="(min-width: 768px) 360px, 90vw"
              alt={p.alt}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
            {p.ours && (
              <span className="absolute bottom-1.5 left-1.5 rounded-full bg-obsidian/70 px-2 py-0.5 font-mono text-[9px] tracking-wider text-solar-hi backdrop-blur">
                OUR TREK
              </span>
            )}
          </button>
        ))}
      </div>
      {open !== null && (
        <Lightbox photos={shown} index={open} title={title} onIndex={setOpen} onClose={() => setOpen(null)} />
      )}
    </>
  )
}
