import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { idleTime } from '../motion'
import { cow, deer, elephant, goat, herdClock, herdMaterial, mule, porter, rhino, villager, yak } from './critters'
import { wildlife, walkAt, type Animal } from './herds'

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

/** Animals and people along the route. One instanced mesh (one draw call) per species, and per species on the move. */
export default function Wildlife() {
  const h = wildlife()
  const mats = useMemo(
    () => ({
      grazer: herdMaterial({ dip: 0.42, swing: 0.05, rate: 0.35, turn: 0.4 }),
      browser: herdMaterial({ dip: 0.22, swing: 0.06, rate: 0.3, turn: 0.3 }),
      trunk: herdMaterial({ swing: 0.18, rate: 0.5, turn: 0.15 }),
      walker: herdMaterial({ swing: 0.04, rate: 1.4 }),
      person: herdMaterial({ swing: 0.03, rate: 0.5, turn: 0.5 }),
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
      <Herd animals={h.cowsWalking} geometry={cow} material={mats.walker} />
      <Herd animals={h.goats} geometry={goat} material={mats.grazer} />
      <Herd animals={h.goatsWalking} geometry={goat} material={mats.walker} />
      <Herd animals={h.yaks} geometry={yak} material={mats.grazer} />
      <Herd animals={h.mules} geometry={mule} material={mats.walker} />
      <Herd animals={h.porters} geometry={porter} material={mats.walker} />
      <Herd animals={h.villagers} geometry={villager} material={mats.person} />
      <Herd animals={h.villagersWalking} geometry={villager} material={mats.walker} />
    </group>
  )
}
