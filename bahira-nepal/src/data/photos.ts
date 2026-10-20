import generated from './photos.generated.json'

export interface Photo {
  src: string
  srcSet: string
  width: number
  height: number
  alt: string
  credit: string
  license?: string
  source?: string
  /** true = from the trek leaders' own past treks */
  ours: boolean
}

/** Written by `npm run photos`; keyed by 1-based itinerary day. */
const byDay = generated as Record<string, Photo[]>

export const photosForDay = (day: number): Photo[] => byDay[String(day)] ?? []
