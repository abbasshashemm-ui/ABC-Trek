import * as THREE from 'three'
import { getTerrainHeight, valleyCenter, JOURNEY_LENGTH } from './terrainMath'
import { itinerary, DAY_COUNT } from '../data/itinerary'

export { DAY_COUNT }
const SEGMENTS_PER_LEG = 7
const TRAIL_LIFT = 0.6

/** Z position of a (fractional, 0-based) day index. */
export const dayZ = (dayIndex: number) => -(dayIndex * JOURNEY_LENGTH) / (DAY_COUNT - 1)

export const waypointAt = (z: number) => {
  const x = valleyCenter(z)
  return new THREE.Vector3(x, getTerrainHeight(x, z) + TRAIL_LIFT, z)
}

export const waypoints: THREE.Vector3[] = itinerary.map((_, i) => waypointAt(dayZ(i)))

/**
 * The curve passes through all 15 day waypoints. Intermediate control points are
 * sampled from the same height function so Catmull-Rom overshoot can never dip
 * the tube below the terrain between waypoints.
 */
const controlPoints: THREE.Vector3[] = []
for (let i = 0; i < DAY_COUNT - 1; i++) {
  for (let s = 0; s < SEGMENTS_PER_LEG; s++) {
    controlPoints.push(waypointAt(dayZ(i + s / SEGMENTS_PER_LEG)))
  }
}
controlPoints.push(waypoints[DAY_COUNT - 1].clone())

export const trailCurve = new THREE.CatmullRomCurve3(controlPoints, false, 'centripetal')
trailCurve.arcLengthDivisions = (controlPoints.length - 1) * 10

/** Arc-length parameter (0..1) of each day's waypoint along the curve. */
export const dayU: number[] = (() => {
  const lengths = trailCurve.getLengths(trailCurve.arcLengthDivisions)
  const total = lengths[lengths.length - 1]
  return itinerary.map((_, i) => {
    const idx = Math.round((i * SEGMENTS_PER_LEG * 10))
    return lengths[idx] / total
  })
})()

/** Fractional day index (0..14) -> arc-length parameter. */
export function dayToU(dayFloat: number): number {
  const f = Math.min(DAY_COUNT - 1, Math.max(0, dayFloat))
  const i = Math.min(DAY_COUNT - 2, Math.floor(f))
  return THREE.MathUtils.lerp(dayU[i], dayU[i + 1], f - i)
}
