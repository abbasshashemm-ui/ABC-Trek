import { useCallback, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import type { Photo } from '../data/photos'
import { scrollApi } from '../state/scrollApi'

interface Props {
  photos: Photo[]
  index: number
  title: string
  onIndex: (i: number) => void
  onClose: () => void
}

export default function Lightbox({ photos, index, title, onIndex, onClose }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null)
  const photo = photos[index]
  const step = useCallback((dir: number) => onIndex((index + dir + photos.length) % photos.length), [index, photos.length, onIndex])

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null
    scrollApi.lenis?.stop()
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') step(1)
      if (e.key === 'ArrowLeft') step(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      scrollApi.lenis?.start()
      opener?.focus()
    }
  }, [onClose, step])

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${title}: photo ${index + 1} of ${photos.length}`}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-obsidian/92 p-4 backdrop-blur-md"
      onClick={onClose}
    >
      <figure className="relative max-h-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
        <img
          src={photo.src}
          srcSet={photo.srcSet}
          sizes="(min-width: 1024px) 1024px, 100vw"
          alt={photo.alt}
          width={photo.width}
          height={photo.height}
          className="max-h-[80vh] w-auto rounded-xl object-contain"
        />
        <figcaption className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
          <span>{photo.alt}</span>
          <PhotoCredit photo={photo} />
        </figcaption>
      </figure>

      <button ref={closeRef} type="button" onClick={onClose} aria-label="Close" className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-ink hover:bg-white/20">
        <X size={20} />
      </button>
      {photos.length > 1 && (
        <>
          <button type="button" onClick={(e) => { e.stopPropagation(); step(-1) }} aria-label="Previous photo" className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-ink hover:bg-white/20">
            <ChevronLeft size={22} />
          </button>
          <button type="button" onClick={(e) => { e.stopPropagation(); step(1) }} aria-label="Next photo" className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-ink hover:bg-white/20">
            <ChevronRight size={22} />
          </button>
        </>
      )}
    </div>,
    document.body,
  )
}

/** Attribution: ours by name; licensed images by author, licence and a link to the source. */
export function PhotoCredit({ photo }: { photo: Photo }) {
  if (photo.ours) return <span className="text-solar-hi/90">📷 {photo.credit}</span>
  return (
    <span>
      Photo: {photo.credit}
      {photo.license && <> · {photo.license}</>}
      {photo.source && (
        <>
          {' · '}
          <a href={photo.source} target="_blank" rel="noopener noreferrer" className="underline hover:text-ink">
            source
          </a>
        </>
      )}
    </span>
  )
}
