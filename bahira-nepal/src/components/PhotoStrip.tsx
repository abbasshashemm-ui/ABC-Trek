import { useState } from 'react'
import clsx from 'clsx'
import { Dialog } from '@base-ui/react/dialog'
import type { Photo } from '../data/photos'
import Lightbox from './Lightbox'

/**
 * 1 photo: its own shape (clamped). 2: side by side. 3: one tall lead + two stacked.
 * 4–7: the 3-photo mosaic plus a row of square thumbnails underneath; the lightbox pages through all.
 */
const MAX_SHOWN = 7

/**
 * A lone photo keeps its own aspect ratio, clamped between 4:5 and 2.4:1: a fixed 2:1 strip cut
 * portrait shots down to a band through the middle (Phewa Lake lost both Machhapuchhre and the boats).
 */
const soloRatio = (p: Photo) => Math.min(2.4, Math.max(4 / 5, p.width / p.height))

/**
 * Rendered width of each tile (column is max-w-md = 448px, phones get 100vw minus the 40px gutter),
 * so a phone downloads the 800w file for a half-width tile instead of the 1600w one.
 */
function tileSizes(n: number, i: number) {
  if (n === 1) return '(min-width: 768px) 448px, calc(100vw - 40px)'
  if (n === 2) return '(min-width: 768px) 224px, calc(50vw - 20px)'
  return i === 0 ? '(min-width: 768px) 262px, 58vw' : '(min-width: 768px) 186px, 42vw'
}
export default function PhotoStrip({ photos, title }: { photos: Photo[]; title: string }) {
  const [handle] = useState(() => Dialog.createHandle<number>())
  if (!photos.length) return null
  const shown = photos.slice(0, MAX_SHOWN)
  const lead = shown.slice(0, 3)
  const extra = shown.slice(3)
  const n = lead.length

  return (
    <>
      <div
        style={n === 1 ? { aspectRatio: soloRatio(lead[0]) } : undefined}
        className={clsx(
          'pointer-events-auto grid gap-1.5',
          extra.length ? 'mb-1.5' : 'mb-6',
          n === 1 && 'grid-cols-1',
          n === 2 && 'h-44 grid-cols-2 md:h-52',
          n === 3 && 'h-56 grid-cols-[1.4fr_1fr] grid-rows-2 md:h-64',
        )}
      >
        {lead.map((p, i) => (
          <Dialog.Trigger
            key={p.src}
            handle={handle}
            payload={i}
            aria-label={`Open photo: ${p.alt}`}
            className={clsx(
              'group relative overflow-hidden rounded-xl bg-white/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember',
              n === 3 && i === 0 && 'row-span-2',
            )}
          >
            <img
              src={p.src}
              srcSet={p.srcSet}
              sizes={tileSizes(n, i)}
              alt={p.alt}
              loading="lazy"
              decoding="async"
              style={p.focus ? { objectPosition: p.focus } : undefined}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
            />
            {p.ours && (
              <span className="absolute bottom-1.5 left-1.5 rounded bg-obsidian/75 px-1.5 py-0.5 text-[10px] font-semibold text-ember backdrop-blur">
                Our trek
              </span>
            )}
          </Dialog.Trigger>
        ))}
      </div>
      {extra.length > 0 && (
        <div className="pointer-events-auto mb-6 grid grid-cols-4 gap-1.5">
          {extra.map((p, i) => (
            <Dialog.Trigger
              key={p.src}
              handle={handle}
              payload={i + 3}
              aria-label={`Open photo: ${p.alt}`}
              className="group relative aspect-square overflow-hidden rounded-lg bg-white/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
            >
              <img
                src={p.src}
                srcSet={p.srcSet}
                sizes="(min-width: 768px) 108px, calc(25vw - 15px)"
                alt={p.alt}
                loading="lazy"
                decoding="async"
                style={p.focus ? { objectPosition: p.focus } : undefined}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
              />
            </Dialog.Trigger>
          ))}
        </div>
      )}
      <Lightbox handle={handle} photos={shown} title={title} />
    </>
  )
}
