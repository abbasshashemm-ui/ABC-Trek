import { useState } from 'react'
import clsx from 'clsx'
import { Dialog } from '@base-ui/react/dialog'
import type { Photo } from '../data/photos'
import Lightbox from './Lightbox'

/** 1 photo: wide. 2: side by side. 3: one tall lead + two stacked. */
export default function PhotoStrip({ photos, title }: { photos: Photo[]; title: string }) {
  const [handle] = useState(() => Dialog.createHandle<number>())
  if (!photos.length) return null
  const shown = photos.slice(0, 3)
  const n = shown.length

  return (
    <>
      <div
        className={clsx(
          'mb-5 grid gap-1.5',
          n === 1 && 'h-48 grid-cols-1 md:h-56',
          n === 2 && 'h-44 grid-cols-2 md:h-52',
          n === 3 && 'h-56 grid-cols-[1.4fr_1fr] grid-rows-2 md:h-64',
        )}
      >
        {shown.map((p, i) => (
          <Dialog.Trigger
            key={p.src}
            handle={handle}
            payload={i}
            aria-label={`Open photo: ${p.alt}`}
            className={clsx(
              'group relative overflow-hidden rounded-lg bg-white/5 focus-visible:outline-2 focus-visible:outline-solar-hi',
              n === 3 && i === 0 && 'row-span-2',
            )}
          >
            <img
              src={p.src}
              srcSet={p.srcSet}
              sizes="(min-width: 768px) 360px, 90vw"
              alt={p.alt}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
            />
            {p.ours && (
              <span className="absolute bottom-1.5 left-1.5 rounded bg-obsidian/75 px-1.5 py-0.5 font-mono text-[10px] text-solar-hi backdrop-blur">
                Our trek
              </span>
            )}
          </Dialog.Trigger>
        ))}
      </div>
      <Lightbox handle={handle} photos={shown} title={title} />
    </>
  )
}
