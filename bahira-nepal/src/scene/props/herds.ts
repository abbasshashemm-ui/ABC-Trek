import * as THREE from 'three'
import { getTerrainHeight } from '../../utils/terrainMath'
import { nearTrail } from '../../utils/journey'
import { rng, besideTrail, slopeAt, faceTrail } from './placement'
import { buildings } from './places'
import { clearOfLandmarks } from './spots'

/** Units along the valley per day on the way up (JOURNEY_LENGTH / 14). */
const DAY_UNITS = 300 / 14

export interface Animal {
  x: number
  y: number
  z: number
  rot: number
  s: number
  color: string
  /**
   * Walkers loop a stretched oval beside the trail: `day ± span` along it, `side ± width` across,
   * so they turn round smoothly at the ends and a train never walks into itself.
   */
  walk?: { day: number; span: number; side: number; width: number; speed: number; /** radians round the oval */ phase: number }
}

interface HerdOptions {
  seed: number
  day: number
  /** across the valley from the trail, both sides unless `side` is set */
  off: [number, number]
  side?: 1 | -1
  /** up/down the valley around the day, in world units */
  along: number
  count: number
  scale: [number, number]
  colors: string[]
  maxSlope?: number
  /** keep clear of the trail by this much (they wander right up to it in the villages) */
  trail?: number
}

/** Scatter a herd, with the same keep-outs as villages and trees: steep ground, the lake, houses, landmarks, the trail. */
function herd(o: HerdOptions): Animal[] {
  const r = rng(o.seed)
  const out: Animal[] = []
  for (let tries = 0; out.length < o.count && tries < o.count * 60; tries++) {
    const side = o.side ?? (r() < 0.5 ? -1 : 1)
    const off = side * (o.off[0] + r() * (o.off[1] - o.off[0]))
    const p = besideTrail(o.day, off, (r() * 2 - 1) * o.along)
    const s = o.scale[0] + r() * (o.scale[1] - o.scale[0])
    const t = -p.z
    if (slopeAt(p.x, p.z) > (o.maxSlope ?? 0.3)) continue
    if (t > 74 && t < 100 && Math.abs(off) < 10) continue // Phewa Lake
    if (buildings.some((b) => Math.hypot(b.x - p.x, b.z - p.z) < b.w * 0.75 + s * 0.6)) continue
    if (!clearOfLandmarks(p.x, p.z, s)) continue
    if (nearTrail(p.x, p.z, o.trail ?? 1.2)) continue
    if (out.some((a) => Math.hypot(a.x - p.x, a.z - p.z) < (a.s + s) * 0.6)) continue
    out.push({ ...p, rot: r() * Math.PI * 2, s, color: o.colors[Math.floor(r() * o.colors.length)] })
  }
  return out
}

/** A string of walkers on one oval, spaced `gap` apart. */
function train(n: number, walk: Omit<NonNullable<Animal['walk']>, 'phase'>, gap: number, s: number, colors: string[], seed = 1): Animal[] {
  const r = rng(seed)
  return Array.from({ length: n }, (_, i) => ({
    x: 0,
    y: 0,
    z: 0,
    rot: 0,
    s: s * (0.92 + r() * 0.16),
    color: colors[i % colors.length],
    walk: { ...walk, phase: -(i * gap) / (walk.span * DAY_UNITS) },
  }))
}

/** One villager standing in front of every third house, facing the trail. */
function villagers(): Animal[] {
  const r = rng(808)
  const shirts = ['#b5452f', '#2f5f9a', '#d1a23a', '#4f7a3c', '#e9e3d6', '#8a3a5c']
  return buildings
    .filter((_, i) => i % 3 === 0)
    .map((b) => {
      const face = faceTrail(b.x, b.z)
      const x = b.x + Math.sin(face) * (b.d * 0.5 + 0.45) + (r() - 0.5) * 0.6
      const z = b.z + Math.cos(face) * (b.d * 0.5 + 0.45) + (r() - 0.5) * 0.6
      return { x, y: getTerrainHeight(x, z), z, rot: face + (r() - 0.5) * 1.2, s: 0.95 + r() * 0.15, color: shirts[Math.floor(r() * shirts.length)] }
    })
    .filter((a) => !nearTrail(a.x, a.z, 0.5))
}

const COW_COATS = ['#efe9df', '#e3d7c4', '#a0714b', '#7a5236', '#3b302a']
const GOAT_COATS = ['#2c2622', '#efe9df', '#8a6545', '#5b4a3c']
const YAK_COATS = ['#2a221e', '#3a2e26', '#2a221e', '#e8e2d6']
const LOADS = ['#2f5f9a', '#b5452f', '#5b6b3a', '#c9a24a']
const GREY = '#8a8580'

/** Fixed layout (seeded), shared by every mesh below. Day indices are 0-based (Day 1 = 0). */
function populate() {
  return {
    // Act II: Chitwan. Two ride elephants with red saddle cloths walk a loop; a cow-and-calf
    // pair and a bull stand in the clearing. Rhino and chital graze in the open grass by the trail.
    elephants: [
      ...train(2, { day: 3, span: 0.16, side: -3.4, width: 0.9, speed: 0.55 }, 2.6, 1.15, ['#b23a2e']),
      ...herd({ seed: 301, day: 2.75, off: [2.4, 4], side: 1, along: 3, count: 3, scale: [0.6, 1.15], colors: [GREY] }),
    ],
    rhinos: herd({ seed: 302, day: 3.25, off: [2.2, 4.2], side: 1, along: 2, count: 2, scale: [0.7, 1.05], colors: [GREY] }),
    deer: [
      ...herd({ seed: 303, day: 2.3, off: [2.2, 4.3], along: 4, count: 6, scale: [0.85, 1.05], colors: ['#b8763e', '#a8672f', '#c4884d'] }),
      ...herd({ seed: 304, day: 3.6, off: [2.2, 4.3], side: -1, along: 3, count: 5, scale: [0.85, 1.05], colors: ['#b8763e', '#a8672f'] }),
    ],
    // Cows wander the Kathmandu lanes, the Tharu villages and the hill farms; goats from the
    // villages up to the teahouse terraces. They graze right up to the trail.
    cows: [0, 1, 2, 5, 9.6, 10.4, 11].flatMap((day, k) =>
      herd({ seed: 400 + k, day, off: [1.6, 9], along: 6, count: day < 2 ? 3 : 4, scale: [0.95, 1.1], colors: COW_COATS, trail: 0.9 }),
    ),
    goats: [2.5, 5.5, 6, 9.3, 10, 11.2].flatMap((day, k) =>
      herd({ seed: 500 + k, day, off: [1.4, 7], along: 5, count: 5, scale: [0.9, 1.1], colors: GOAT_COATS, maxSlope: 0.45, trail: 0.9 }),
    ),
    // Act III: yaks on the high grass below the sanctuary.
    yaks: [7.3, 7.8].flatMap((day, k) =>
      herd({ seed: 600 + k, day, off: [2, 8], along: 4, count: 4, scale: [0.95, 1.15], colors: YAK_COATS, maxSlope: 0.45 }),
    ),
    // Mule trains on the lower trail, up and back; porters with dokos between the teahouses.
    mules: [
      ...train(4, { day: 6.4, span: 0.25, side: 1.4, width: 0.5, speed: 0.7 }, 1.4, 1, LOADS, 7),
      ...train(3, { day: 10.5, span: 0.25, side: -1.4, width: 0.5, speed: 0.7 }, 1.4, 1, LOADS, 8),
    ],
    porters: [
      ...train(2, { day: 7, span: 0.3, side: -1.3, width: 0.45, speed: 0.5 }, 1.3, 1, ['#2f5f9a', '#b5452f'], 9),
      ...train(1, { day: 7.9, span: 0.25, side: 1.3, width: 0.45, speed: 0.45 }, 1, 1, ['#4f7a3c'], 10),
      ...train(2, { day: 9.7, span: 0.3, side: 1.3, width: 0.45, speed: 0.5 }, 1.3, 1, ['#d1a23a', '#2f5f9a'], 11),
    ],
    // People about the villages: a few walk the lanes beside the trail, the rest stand by their houses.
    villagers: villagers(),
    villagersWalking: [
      ...train(3, { day: 0.45, span: 0.14, side: -1.7, width: 0.35, speed: 0.32 }, 1.1, 1, ['#b5452f', '#e9e3d6', '#2f5f9a'], 12),
      ...train(2, { day: 4.75, span: 0.12, side: 1.7, width: 0.35, speed: 0.3 }, 1.2, 1, ['#d1a23a', '#8a3a5c'], 13),
      ...train(2, { day: 10.3, span: 0.12, side: -1.6, width: 0.35, speed: 0.3 }, 1.2, 1, ['#4f7a3c', '#e9e3d6'], 14),
    ],
    // A goat herd driven along the hillside below Ghandruk, and a cow pair ambling in the Kathmandu lanes.
    goatsWalking: train(5, { day: 6.15, span: 0.12, side: -2.2, width: 0.45, speed: 0.28 }, 0.8, 1, GOAT_COATS, 15),
    cowsWalking: train(2, { day: 1.4, span: 0.1, side: 2.2, width: 0.4, speed: 0.22 }, 1.6, 1.05, COW_COATS, 16),
  }
}

let populated: ReturnType<typeof populate> | undefined
/** The fixed layout, built once and shared with the ground shadows. */
export const wildlife = () => (populated ??= populate())

/** Footprint radius and height per unit scale, for each species' ground shadow. */
export const BODY: Record<keyof ReturnType<typeof populate>, { r: number; h: number }> = {
  elephants: { r: 0.75, h: 1.8 },
  rhinos: { r: 0.55, h: 1.0 },
  deer: { r: 0.32, h: 1.1 },
  cows: { r: 0.42, h: 1.05 },
  cowsWalking: { r: 0.42, h: 1.05 },
  goats: { r: 0.25, h: 0.75 },
  goatsWalking: { r: 0.25, h: 0.75 },
  yaks: { r: 0.48, h: 1.1 },
  mules: { r: 0.36, h: 1.3 },
  porters: { r: 0.3, h: 1.4 },
  villagers: { r: 0.25, h: 1.4 },
  villagersWalking: { r: 0.25, h: 1.4 },
}

/** Oval position for a walker at time `time` (and a hair later, for its heading). */
export function walkAt(w: NonNullable<Animal['walk']>, time: number, out: THREE.Vector3) {
  const theta = (time * w.speed) / (w.span * DAY_UNITS) + w.phase
  const p = besideTrail(w.day + w.span * Math.sin(theta), w.side + w.width * Math.cos(theta))
  return out.set(p.x, p.y, p.z)
}
