import { itinerary, actOf, ABC_ALTITUDE, type ActId } from '../data/itinerary'
import { DAY_COUNT } from '../utils/journey'
import { smoothstep } from '../utils/terrainMath'

/**
 * Mutable, non-reactive scroll state shared by the R3F scene and the HUD.
 * Written once per frame by `updateScroll`; read in useFrame / rAF loops so
 * scrolling never triggers React renders.
 */
export const scrollState = {
  /** 0..14 fractional day index, aligned to the centre of each waypoint section. */
  dayFloat: 0,
  /** 0..1 over the whole itinerary. */
  progress: 0,
  altitude: itinerary[0].altitude,
  act: 'I' as ActId,
}

export function altitudeAt(dayFloat: number): number {
  const f = Math.min(DAY_COUNT - 1, Math.max(0, dayFloat))
  const i = Math.min(DAY_COUNT - 2, Math.floor(f))
  const t = f - i
  const e = t * t * (3 - 2 * t)
  return itinerary[i].altitude * (1 - e) + itinerary[i + 1].altitude * e
}

export const altitudeRatio = (alt: number) => Math.min(1, alt / ABC_ALTITUDE)

export function updateScroll(journeyEl: HTMLElement | null) {
  if (!journeyEl) return
  const rect = journeyEl.getBoundingClientRect()
  const vh = window.innerHeight
  const sectionH = rect.height / DAY_COUNT
  const raw = (-rect.top + vh / 2 - sectionH / 2) / sectionH
  const dayFloat = Math.min(DAY_COUNT - 1, Math.max(0, raw))
  scrollState.dayFloat = dayFloat
  scrollState.progress = dayFloat / (DAY_COUNT - 1)
  scrollState.altitude = altitudeAt(dayFloat)
  scrollState.act = actOf(itinerary[Math.round(dayFloat)])
}

export { smoothstep }
