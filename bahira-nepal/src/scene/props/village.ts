import { rng, besideTrail, slopeAt, groundUnder, faceTrail } from './placement'
import { clearOfLandmarks } from './spots'
import { getTerrainHeight } from '../../utils/terrainMath'
import { nearTrail } from '../../utils/journey'

export interface BuildingSpec {
  x: number
  z: number
  w: number
  d: number
  h: number
  rot: number
  wall: string
  roof: string
  roofH: number
  lit: boolean
}

export interface VillageOptions {
  seed: number
  day: number
  count: number
  /** distance from the trail centre line, both sides */
  minOff: number
  maxOff: number
  /** spread up/down the valley around the day's waypoint */
  along: number
  size: [number, number]
  walls: string[]
  roofs: string[]
  roofH?: number
  maxSlope?: number
  litRatio?: number
}

/** Scatter a village around a day's waypoint, keeping clear of the trail and steep ground. */
export function village(o: VillageOptions): BuildingSpec[] {
  const r = rng(o.seed)
  const out: BuildingSpec[] = []
  for (let tries = 0; out.length < o.count && tries < o.count * 40; tries++) {
    const side = r() < 0.5 ? -1 : 1
    const off = side * (o.minOff + r() * (o.maxOff - o.minOff))
    const p = besideTrail(o.day, off, (r() * 2 - 1) * o.along)
    const s = o.size[0] + r() * (o.size[1] - o.size[0])
    const d = s * (0.7 + r() * 0.3)
    const rot = faceTrail(p.x, p.z) + (r() - 0.5) * 0.5
    if (slopeAt(p.x, p.z) > (o.maxSlope ?? 0.35)) continue
    // Reject footprints whose downhill corner drops so far the house would stand on stilts.
    if (getTerrainHeight(p.x, p.z) - groundUnder(p.x, p.z, s / 2, d / 2, rot) > s * 0.35) continue
    if (!clearOfLandmarks(p.x, p.z, s / 2)) continue
    if (nearTrail(p.x, p.z, s * 0.5 + 0.8)) continue // the way back runs through some villages
    if (out.some((b) => Math.hypot(b.x - p.x, b.z - p.z) < (b.w + s) * 0.75)) continue
    out.push({
      x: p.x,
      z: p.z,
      w: s,
      d,
      h: s * (0.55 + r() * 0.25),
      rot,
      wall: o.walls[Math.floor(r() * o.walls.length)],
      roof: o.roofs[Math.floor(r() * o.roofs.length)],
      roofH: s * (o.roofH ?? 0.45),
      lit: r() < (o.litRatio ?? 0.55),
    })
  }
  return out
}
