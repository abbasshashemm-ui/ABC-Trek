import { getTerrainHeight, valleyCenter } from '../../utils/terrainMath'
import { rng, slopeAt } from './placement'
import { buildings } from './places'
import { clearOfLandmarks } from './spots'
import { nearTrail } from '../../utils/journey'

/** Local heights of the two shapes (to the top of the crown), for the wind bend. */
export const CONIFER_H = 1.65
export const BROADLEAF_H = 1.5

export interface Tree {
  x: number
  y: number
  z: number
  s: number
  rot: number
  shade: number
}

/** Biome rules mirror the terrain shader: jungle in Act II lowlands, conifers on Act I/III slopes. */
function plant() {
  const r = rng(2024)
  const conifers: Tree[] = []
  const jungle: Tree[] = []
  for (let i = 0; i < 9000 && conifers.length + jungle.length < 1900; i++) {
    const t = r() * 310
    const z = -t
    const off = (r() < 0.5 ? -1 : 1) * (4.5 + Math.pow(r(), 1.4) * 55)
    const x = valleyCenter(z) + off
    const h = getTerrainHeight(x, z)
    const slope = slopeAt(x, z)
    if (slope > 0.5 || h > 33) continue
    if (t > 74 && t < 100 && Math.abs(off) < 10) continue // Phewa Lake
    if (buildings.some((b) => Math.hypot(b.x - x, b.z - z) < b.w + 0.6)) continue
    if (!clearOfLandmarks(x, z, 0.5)) continue
    if (nearTrail(x, z, 1.4)) continue

    const lush = t > 35 && t < 120 && h < 10
    const tree = { x, y: h - 0.1, z, s: 0.8 + r() * 0.9, rot: r() * Math.PI * 2, shade: r() }
    if (lush) {
      if (r() < 0.85) jungle.push(tree)
    } else if (h > 4 && r() < 0.6) {
      conifers.push(tree)
    }
  }
  return { conifers, jungle }
}

let planted: ReturnType<typeof plant> | undefined
/** The forest layout, planted once and shared with the ground shadows. */
export const forest = () => (planted ??= plant())

/** Crown radius and height (world units) of a tree, for its shadow. */
export const treeSize = (t: Tree, conifer: boolean) => ({
  r: (conifer ? 0.42 : 0.55) * t.s,
  h: (conifer ? CONIFER_H : BROADLEAF_H) * t.s * (0.9 + t.shade * 0.3),
})
