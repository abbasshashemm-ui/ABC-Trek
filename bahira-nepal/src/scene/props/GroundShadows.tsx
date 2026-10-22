import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { scrollState } from '../../state/scrollStore'
import { fogDensityAt } from '../palette'
import { idleTime } from '../motion'
import { blobGeometry, blobMaterial, setBlob, type Caster } from './shadows'
import { forest, treeSize } from './forest'
import { buildings } from './places'
import { spotPos, SPOTS } from './spots'
import { wildlife, walkAt, BODY, type Animal } from './herds'

/** Everything that stands still: trees, houses, landmarks, grazing animals, villagers at their doors. */
function staticCasters(): Caster[] {
  const { conifers, jungle } = forest()
  const out: Caster[] = [
    ...conifers.map((t) => ({ x: t.x, z: t.z, ...treeSize(t, true), k: 0.5 })),
    ...jungle.map((t) => ({ x: t.x, z: t.z, ...treeSize(t, false), k: 0.5 })),
    ...buildings.map((b) => ({ x: b.x, z: b.z, r: (b.w + b.d) * 0.3, h: b.h + b.roofH, k: 0.6 })),
  ]
  for (const [key, size] of [
    [SPOTS.pashupati, { r: 1.3, h: 4.5 }],
    [SPOTS.boudhanath, { r: 1.9, h: 4.3 }],
    [SPOTS.peacePagoda, { r: 2.4, h: 5.6 }],
    [SPOTS.abcChorten, { r: 0.85, h: 1.9 }],
  ] as const) {
    const p = spotPos(key)
    out.push({ x: p.x, z: p.z, ...size, k: 0.6 })
  }
  const herds = wildlife()
  for (const key of Object.keys(herds) as (keyof typeof herds)[]) {
    for (const a of herds[key]) if (!a.walk) out.push({ x: a.x, z: a.z, r: BODY[key].r * a.s, h: BODY[key].h * a.s, k: 0.55 })
  }
  return out
}

type Walker = { a: Animal & { walk: NonNullable<Animal['walk']> }; r: number; h: number }
const at = new THREE.Vector3()

function placeWalkers(mesh: THREE.InstancedMesh, walkers: Walker[], time: number, withColor: boolean) {
  walkers.forEach((w, i) => {
    walkAt(w.a.walk, time, at)
    setBlob(mesh, i, { x: at.x, z: at.z, r: w.r * w.a.s, h: w.h * w.a.s, k: 0.55 }, withColor)
  })
  mesh.instanceMatrix.needsUpdate = true
}

/** The ground shadows of every prop: one draw call for those standing still, one for the walkers. */
export default function GroundShadows() {
  const casters = useMemo(() => staticCasters(), [])
  const walkers = useMemo<Walker[]>(() => {
    const herds = wildlife()
    return (Object.keys(herds) as (keyof typeof herds)[]).flatMap((key) =>
      herds[key].filter((a) => a.walk).map((a) => ({ a: a as Walker['a'], ...BODY[key] })),
    )
  }, [])
  const still = useRef<THREE.InstancedMesh>(null)
  const moving = useRef<THREE.InstancedMesh>(null)
  const material = useMemo(() => blobMaterial(), [])

  useLayoutEffect(() => {
    casters.forEach((c, i) => setBlob(still.current!, i, c))
    placeWalkers(moving.current!, walkers, 0, true)
    for (const mesh of [still.current!, moving.current!]) {
      mesh.instanceMatrix.needsUpdate = true
      mesh.instanceColor!.needsUpdate = true
    }
  }, [casters, walkers])

  useFrame((state) => {
    material.uniforms.uFogDensity.value = fogDensityAt(scrollState.dayFloat)
    placeWalkers(moving.current!, walkers, idleTime(state.clock.elapsedTime), false)
  })

  // Draped in the vertex shader, so the CPU bounds mean nothing: never cull.
  return (
    <group>
      <instancedMesh ref={still} args={[blobGeometry, material, casters.length]} frustumCulled={false} renderOrder={1} />
      <instancedMesh ref={moving} args={[blobGeometry, material, walkers.length]} frustumCulled={false} renderOrder={1} />
    </group>
  )
}
