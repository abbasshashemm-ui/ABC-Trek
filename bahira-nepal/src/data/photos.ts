import generated from './photos.generated.json'

export interface Photo {
  src: string
  srcSet: string
  width: number
  height: number
  alt: string
  credit?: string
  license?: string
  source?: string
  /** CSS object-position kept in frame when a tile crops the photo (default centre) */
  focus?: string
  /** true = from the trek leaders' own past treks */
  ours: boolean
}

/** Written by `npm run photos`; keyed by 1-based itinerary day, plus named galleries ("guides"). */
const byKey = generated as Record<string, Photo[]>

export const photosFor = (key: number | string): Photo[] => byKey[String(key)] ?? []
