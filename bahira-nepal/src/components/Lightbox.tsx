import { useState } from 'react'
import { Dialog } from '@base-ui/react/dialog'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import type { Photo } from '../data/photos'
import { scrollApi } from '../state/scrollApi'

/** One handle per gallery: thumbnails are `Dialog.Trigger`s carrying their index as payload. */
export type LightboxHandle = ReturnType<typeof Dialog.createHandle<number>>

const navButton = 'absolute top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-ink transition hover:bg-white/20'

/**
 * base-ui Dialog owns focus: it moves focus in on open, traps Tab, closes on Escape
 * and returns focus to the thumbnail that opened it.
 */
export default function Lightbox({ handle, photos, title }: { handle: LightboxHandle; photos: Photo[]; title: string }) {
  return (
    <Dialog.Root
      handle={handle}
      // Lenis drives scrolling itself, so pause it while the dialog is up.
      onOpenChange={(open) => (open ? scrollApi.lenis?.stop() : scrollApi.lenis?.start())}
    >
      {({ payload }) => (
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 z-[60] bg-obsidian/92 backdrop-blur-md transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0" />
          <Dialog.Popup className="fixed inset-0 z-[61] flex items-center justify-center p-4 outline-none transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0">
            {/* keyed so each open starts at the clicked photo */}
            <Viewer key={payload ?? 0} photos={photos} title={title} start={payload ?? 0} />
          </Dialog.Popup>
        </Dialog.Portal>
      )}
    </Dialog.Root>
  )
}

function Viewer({ photos, title, start }: { photos: Photo[]; title: string; start: number }) {
  const [index, setIndex] = useState(start)
  const photo = photos[index]
  const step = (dir: number) => setIndex((i) => (i + dir + photos.length) % photos.length)

  return (
    <div
      className="contents"
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') step(1)
        if (e.key === 'ArrowLeft') step(-1)
      }}
    >
      <Dialog.Title className="sr-only">
        {title}: photo {index + 1} of {photos.length}
      </Dialog.Title>
      <figure className="max-h-full max-w-5xl">
        <img
          src={photo.src}
          srcSet={photo.srcSet}
          sizes="(min-width: 1024px) 1024px, 100vw"
          alt={photo.alt}
          width={photo.width}
          height={photo.height}
          className="max-h-[80vh] w-auto rounded-xl object-contain"
        />
        <figcaption className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm text-muted">
          <span>{photo.alt}</span>
          <PhotoCredit photo={photo} />
        </figcaption>
      </figure>

      <Dialog.Close aria-label="Close" className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-ink transition hover:bg-white/20">
        <X size={20} />
      </Dialog.Close>
      {photos.length > 1 && (
        <>
          <button type="button" onClick={() => step(-1)} aria-label="Previous photo" className={`${navButton} left-3`}>
            <ChevronLeft size={22} />
          </button>
          <button type="button" onClick={() => step(1)} aria-label="Next photo" className={`${navButton} right-3`}>
            <ChevronRight size={22} />
          </button>
        </>
      )}
    </div>
  )
}

/** Attribution: ours by name; licensed images by author, licence and a link to the source. */
function PhotoCredit({ photo }: { photo: Photo }) {
  if (photo.ours) return <span className="text-ember/90">{photo.credit}</span>
  // Never invent attribution: unknown-source images show no credit line.
  if (!photo.credit) return null
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
