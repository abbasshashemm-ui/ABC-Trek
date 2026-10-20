import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { getTerrainHeight, valleyCenter } from '../../utils/terrainMath'
import { dayZ, stationAt } from '../../utils/journey'

/** Deterministic PRNG so props land in the same place on every load. */
export function rng(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** World position `offset` units across the valley from the trail at a given (fractional) day, way up or way back. */
export function besideTrail(dayIndex: number, offset: number, along = 0) {
  const st = stationAt(dayIndex)
  const z = -st.t + along
  const x = valleyCenter(z) + st.off + offset
  return { x, z, y: getTerrainHeight(x, z) }
}

/** Like `besideTrail` on the way up, extrapolated past base camp: for the backdrop summits. */
export function upValley(dayIndex: number, offset: number, along = 0) {
  const z = dayZ(dayIndex) + along
  const x = valleyCenter(z) + offset
  return { x, z, y: getTerrainHeight(x, z) }
}

/** 0 = flat, 1 = vertical. */
export function slopeAt(x: number, z: number) {
  const e = 0.5
  const h = getTerrainHeight(x, z)
  const n = new THREE.Vector3(h - getTerrainHeight(x + e, z), e, h - getTerrainHeight(x, z + e)).normalize()
  return 1 - n.y
}

/** Lowest ground under a footprint, so the base never floats on a slope. */
export function groundUnder(x: number, z: number, halfW: number, halfD: number, rot: number) {
  const c = Math.cos(rot)
  const s = Math.sin(rot)
  let min = getTerrainHeight(x, z)
  for (const [u, v] of [[-halfW, -halfD], [halfW, -halfD], [-halfW, halfD], [halfW, halfD]]) {
    min = Math.min(min, getTerrainHeight(x + u * c + v * s, z - u * s + v * c))
  }
  return min
}

/** Y rotation that points a building's front (+z) across the valley toward the trail. */
export const faceTrail = (x: number, z: number) => (valleyCenter(z) > x ? 1 : -1) * (Math.PI / 2)

/**
 * mergeGeometries returns null when parts mix indexed and non-indexed geometry
 * (e.g. Cylinder + Icosahedron), so normalise first and fail loudly.
 */
export function merge(parts: THREE.BufferGeometry[]) {
  const g = mergeGeometries(parts.map((p) => (p.index ? p.toNonIndexed() : p)))
  if (!g) throw new Error('merge: incompatible geometry attributes')
  return g
}
