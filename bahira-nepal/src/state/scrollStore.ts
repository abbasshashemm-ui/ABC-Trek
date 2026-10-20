// Not from utils/journey: that module pulls in three.js, which must stay in the lazy Scene chunk.
import { itinerary, actOf, ABC_ALTITUDE, DAY_COUNT, type ActId } from '../data/itinerary'
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

/**
 * Map scroll position to a fractional day. Each day's anchor is its `[data-day]` element; the day is
 * "current" when that element's centre crosses the viewport centre. Anchors can have different
 * heights (some days add a full-screen photo), so we interpolate between their real positions.
 */
export function updateScroll(journeyEl: HTMLElement | null) {
  if (!journeyEl) return
  const anchors = journeyEl.querySelectorAll<HTMLElement>('[data-day]')
  if (anchors.length < 2) return
  const mid = window.innerHeight / 2
  const centres = Array.from(anchors, (a) => {
    const r = a.getBoundingClientRect()
    return r.top + r.height / 2
  })
  let dayFloat: number
  if (mid <= centres[0]) dayFloat = 0
  else if (mid >= centres[centres.length - 1]) dayFloat = centres.length - 1
  else {
    let i = 0
    while (centres[i + 1] < mid) i++
    dayFloat = i + (mid - centres[i]) / (centres[i + 1] - centres[i])
  }
  dayFloat = Math.min(DAY_COUNT - 1, Math.max(0, dayFloat))
  scrollState.dayFloat = dayFloat
  scrollState.progress = dayFloat / (DAY_COUNT - 1)
  scrollState.altitude = altitudeAt(dayFloat)
  scrollState.act = actOf(itinerary[Math.round(dayFloat)])
}

export { smoothstep }
