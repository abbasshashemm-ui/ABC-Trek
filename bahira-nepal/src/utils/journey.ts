import * as THREE from 'three'
import { getTerrainHeight, valleyCenter, JOURNEY_LENGTH } from './terrainMath'
import { itinerary, DAY_COUNT } from '../data/itinerary'

export { DAY_COUNT }
const SEGMENTS_PER_LEG = 7
const TRAIL_LIFT = 0.6

/** Base camp is Day 9 (index 8): the far end of the valley. */
export const ABC_INDEX = 8
/** Legs from this index on are flights (Pokhara -> Kathmandu, Kathmandu -> Beirut). */
export const FIRST_FLIGHT = 12
const CRUISE = 30
const CLIMB_OUT = 46

/** Z position of a (fractional, 0-based) day index on the way up. Also used to place the backdrop. */
export const dayZ = (dayIndex: number) => -(dayIndex * JOURNEY_LENGTH) / (DAY_COUNT - 1)

/**
 * Where each day ends: `t` up the valley (-z) and `off` across it from the valley centre.
 * Days 1-9 climb the centre line to base camp. The trip then turns: Days 10-12 come back down
 * the other bank (the same trail the other way, Jhinu Danda's hot springs, the trailhead),
 * Day 13 is Pokhara's east shore, then two flights: to Kathmandu, and home to Beirut
 * (out past the edge of the map, into the haze).
 */
const STATIONS: { t: number; off: number }[] = [
  ...itinerary.slice(0, ABC_INDEX + 1).map((_, i) => ({ t: -dayZ(i), off: 0 })),
  { t: 142, off: 5 },
  { t: 124, off: 5.5 },
  { t: 110, off: 6.5 },
  { t: 100, off: 12 },
  { t: 8, off: 9 },
  { t: -34, off: 22 },
]

/** Interpolated (t, off) for a fractional day index. */
export function stationAt(dayFloat: number) {
  const f = Math.min(DAY_COUNT - 1, Math.max(0, dayFloat))
  const i = Math.min(DAY_COUNT - 2, Math.floor(f))
  const s = f - i
  const a = STATIONS[i]
  const b = STATIONS[i + 1]
  return { t: a.t + (b.t - a.t) * s, off: a.off + (b.off - a.off) * s }
}

const groundPoint = (dayFloat: number) => {
  const { t, off } = stationAt(dayFloat)
  const z = -t
  const x = valleyCenter(z) + off
  return new THREE.Vector3(x, getTerrainHeight(x, z) + TRAIL_LIFT, z)
}

/**
 * Trail point for a fractional day. On foot/by road it hugs the terrain; flight legs arc
 * between the two airfields instead (the last one climbs away and keeps going).
 */
export function trailPointAt(dayFloat: number) {
  const f = Math.min(DAY_COUNT - 1, Math.max(0, dayFloat))
  const i = Math.min(DAY_COUNT - 2, Math.floor(f))
  const p = groundPoint(f)
  if (i < FIRST_FLIGHT) return p
  const s = f - i
  const a = groundPoint(i)
  if (i === DAY_COUNT - 2) {
    p.y = a.y + CLIMB_OUT * s * s * (3 - 2 * s) // take off from Kathmandu and keep climbing
    return p
  }
  const b = groundPoint(i + 1)
  p.y = Math.max(a.y + (b.y - a.y) * s + CRUISE * Math.sin(Math.PI * s), p.y + 4 * Math.sin(Math.PI * s))
  return p
}

export const waypoints: THREE.Vector3[] = itinerary.map((_, i) => trailPointAt(i))

/**
 * The curve passes through all 15 day waypoints. Intermediate control points are
 * sampled from the same height function so Catmull-Rom overshoot can never dip
 * the tube below the terrain between waypoints.
 */
const controlPoints: THREE.Vector3[] = []
for (let i = 0; i < DAY_COUNT - 1; i++) {
  for (let s = 0; s < SEGMENTS_PER_LEG; s++) {
    controlPoints.push(s === 0 ? waypoints[i].clone() : trailPointAt(i + s / SEGMENTS_PER_LEG))
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

/** Total length of the curve in world units (for walk cycles and spacing). */
export const TRAIL_LENGTH = trailCurve.getLength()

/**
 * Ground-level trail samples (flights excluded) in 4-unit buckets, so props can keep off
 * both the way up and the way back without scanning the whole curve.
 */
const CELL = 4
const trailCells = new Map<string, THREE.Vector2[]>()
for (const p of trailCurve.getSpacedPoints(Math.round(TRAIL_LENGTH * 2))) {
  if (p.y > getTerrainHeight(p.x, p.z) + 2) continue // flights
  const key = `${Math.floor(p.x / CELL)},${Math.floor(p.z / CELL)}`
  const cell = trailCells.get(key) ?? []
  cell.push(new THREE.Vector2(p.x, p.z))
  trailCells.set(key, cell)
}

/** True if (x, z) is within `r` of the walked or driven trail. */
export function nearTrail(x: number, z: number, r: number) {
  const cx = Math.floor(x / CELL)
  const cz = Math.floor(z / CELL)
  const reach = Math.ceil(r / CELL)
  for (let i = -reach; i <= reach; i++)
    for (let j = -reach; j <= reach; j++)
      for (const p of trailCells.get(`${cx + i},${cz + j}`) ?? []) if (Math.hypot(p.x - x, p.y - z) < r) return true
  return false
}
