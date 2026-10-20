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
  /** true = from the trek leaders' own past treks */
  ours: boolean
  /** sharp enough to fill the screen (shortest side of the largest rendition ≥ 1000 px) */
  full: boolean
}

/** Written by `npm run photos`; keyed by 1-based itinerary day, plus named galleries ("guides"). */
const byKey = generated as Record<string, Photo[]>

export const photosFor = (key: number | string): Photo[] => byKey[String(key)] ?? []
