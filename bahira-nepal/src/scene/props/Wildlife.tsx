import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { getTerrainHeight } from '../../utils/terrainMath'
import { nearTrail } from '../../utils/journey'
import { idleTime } from '../motion'
import { rng, besideTrail, slopeAt, faceTrail } from './placement'
import { buildings } from './places'
import { clearOfLandmarks } from './spots'
import { cow, deer, elephant, goat, herdClock, herdMaterial, mule, porter, rhino, villager, yak } from './critters'

/** Units along the valley per day on the way up (JOURNEY_LENGTH / 14). */
const DAY_UNITS = 300 / 14

interface Animal {
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
    villagers: villagers(),
  }
}

/** Oval position for a walker at time `time` (and a hair later, for its heading). */
function walkAt(w: NonNullable<Animal['walk']>, time: number, out: THREE.Vector3) {
  const theta = (time * w.speed) / (w.span * DAY_UNITS) + w.phase
  const p = besideTrail(w.day + w.span * Math.sin(theta), w.side + w.width * Math.cos(theta))
  return out.set(p.x, p.y, p.z)
}

const tmp = { m: new THREE.Matrix4(), q: new THREE.Quaternion(), p: new THREE.Vector3(), n: new THREE.Vector3(), s: new THREE.Vector3(), up: new THREE.Vector3(0, 1, 0) }

function place(mesh: THREE.InstancedMesh, i: number, a: Animal, time: number) {
  let rot = a.rot
  if (a.walk) {
    walkAt(a.walk, time, tmp.p)
    walkAt(a.walk, time + 0.2, tmp.n)
    rot = Math.atan2(tmp.n.x - tmp.p.x, tmp.n.z - tmp.p.z)
    tmp.p.y += Math.abs(Math.sin(time * 5 + a.walk.phase * 9)) * 0.03 * a.s
  } else {
    tmp.p.set(a.x, a.y - 0.03, a.z)
  }
  tmp.q.setFromAxisAngle(tmp.up, rot)
  mesh.setMatrixAt(i, tmp.m.compose(tmp.p, tmp.q, tmp.s.setScalar(a.s)))
}

function Herd({ animals, geometry, material }: { animals: Animal[]; geometry: THREE.BufferGeometry; material: THREE.Material }) {
  const ref = useRef<THREE.InstancedMesh>(null)
  const walkers = useMemo(() => animals.flatMap((a, i) => (a.walk ? [i] : [])), [animals])

  useLayoutEffect(() => {
    const mesh = ref.current!
    const c = new THREE.Color()
    animals.forEach((a, i) => {
      place(mesh, i, a, 0)
      mesh.setColorAt(i, c.set(a.color))
    })
    mesh.instanceMatrix.needsUpdate = true
    mesh.instanceColor!.needsUpdate = true
    mesh.computeBoundingSphere()
  }, [animals])

  useFrame((state) => {
    if (!walkers.length) return
    const time = idleTime(state.clock.elapsedTime)
    for (const i of walkers) place(ref.current!, i, animals[i], time)
    ref.current!.instanceMatrix.needsUpdate = true
  })

  if (!animals.length) return null
  // Walkers leave their spawn point, so their bounds would go stale: skip culling for them.
  return <instancedMesh ref={ref} args={[geometry, material, animals.length]} frustumCulled={!walkers.length} />
}

/** Animals and people along the route. One instanced mesh (one draw call) per species. */
export default function Wildlife() {
  const h = useMemo(() => populate(), [])
  const mats = useMemo(
    () => ({
      grazer: herdMaterial({ dip: 0.42, swing: 0.05, rate: 0.35 }),
      browser: herdMaterial({ dip: 0.22, swing: 0.06, rate: 0.3 }),
      trunk: herdMaterial({ swing: 0.18, rate: 0.5 }),
      walker: herdMaterial({ swing: 0.04, rate: 1.4 }),
      person: herdMaterial({ swing: 0.03, rate: 0.5 }),
    }),
    [],
  )
  useFrame((state) => {
    herdClock.value = idleTime(state.clock.elapsedTime)
  })

  return (
    <group>
      <Herd animals={h.elephants} geometry={elephant} material={mats.trunk} />
      <Herd animals={h.rhinos} geometry={rhino} material={mats.browser} />
      <Herd animals={h.deer} geometry={deer} material={mats.grazer} />
      <Herd animals={h.cows} geometry={cow} material={mats.grazer} />
      <Herd animals={h.goats} geometry={goat} material={mats.grazer} />
      <Herd animals={h.yaks} geometry={yak} material={mats.grazer} />
      <Herd animals={h.mules} geometry={mule} material={mats.walker} />
      <Herd animals={h.porters} geometry={porter} material={mats.walker} />
      <Herd animals={h.villagers} geometry={villager} material={mats.person} />
    </group>
  )
}
