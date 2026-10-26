import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { merge } from './placement'
import { windyFoliage } from '../wind'
import { forest, CONIFER_H, BROADLEAF_H, type Tree } from './forest'

/**
 * Tags a tree part for `windyFoliage`: `color` is baked occlusion (crowns darken toward the
 * bottom and the inside, like real foliage), `aTrunk` = 1 keeps bark brown under the instance's green.
 */
function treePart(g: THREE.BufferGeometry, ao: (p: THREE.Vector3) => number, trunk = false) {
  const geo = g.index ? g.toNonIndexed() : g
  const pos = geo.getAttribute('position')
  const colors = new Float32Array(pos.count * 3)
  const p = new THREE.Vector3()
  for (let i = 0; i < pos.count; i++) colors.fill(ao(p.fromBufferAttribute(pos, i)), i * 3, i * 3 + 3)
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  geo.setAttribute('aTrunk', new THREE.BufferAttribute(new Float32Array(pos.count).fill(trunk ? 1 : 0), 1))
  return geo
}

const hash3 = (x: number, y: number, z: number) => {
  const s = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453
  return s - Math.floor(s)
}

/**
 * A rounded leaf clump: a slightly lumpy sphere whose normals point away from the crown's
 * centre, so the clumps shade as one soft canopy instead of a cluster of facets.
 */
function clump(r: number, at: [number, number, number], crown: THREE.Vector3, detail: number) {
  const g = new THREE.IcosahedronGeometry(r, detail)
  const pos = g.getAttribute('position')
  const nrm = g.getAttribute('normal')
  const v = new THREE.Vector3()
  const n = new THREE.Vector3()
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i)
    // Hashed from position, so the copies of a shared vertex move together and never crack.
    v.multiplyScalar(0.9 + hash3(v.x, v.y, v.z) * 0.2).add(new THREE.Vector3(...at))
    pos.setXYZ(i, v.x, v.y, v.z)
    n.subVectors(v, crown).normalize()
    nrm.setXYZ(i, n.x, n.y, n.z)
  }
  return g
}

const crownAo = (centre: THREE.Vector3, r: number) => (p: THREE.Vector3) =>
  THREE.MathUtils.clamp(0.62 + (p.y - centre.y) / r * 0.3 + p.distanceTo(centre) / r * 0.15, 0.5, 1.05)

// Three stacked tiers, smooth-shaded, narrowing to a spire (top at CONIFER_H).
const coniferCrown = new THREE.Vector3(0, 1.0, 0)
const conifer = merge([
  treePart(new THREE.CylinderGeometry(0.05, 0.08, 0.5, 6).translate(0, 0.25, 0), () => 1, true),
  treePart(new THREE.ConeGeometry(0.44, 0.9, 8).translate(0, 0.8, 0), crownAo(coniferCrown, 0.7)),
  treePart(new THREE.ConeGeometry(0.34, 0.75, 8).rotateY(0.4).translate(0, 1.13, 0), crownAo(coniferCrown, 0.7)),
  treePart(new THREE.ConeGeometry(0.22, 0.5, 7).rotateY(0.9).translate(0, 1.4, 0), crownAo(coniferCrown, 0.7)),
])

// A round main crown with two smaller clumps hanging off it (top at BROADLEAF_H).
const leafCrown = new THREE.Vector3(0, 0.95, 0)
const broadleaf = merge([
  treePart(new THREE.CylinderGeometry(0.05, 0.09, 0.62, 6).translate(0, 0.31, 0), () => 1, true),
  treePart(clump(0.5, [0, 1.0, 0], leafCrown, 1), crownAo(leafCrown, 0.6)),
  treePart(clump(0.32, [0.36, 0.82, 0.12], leafCrown, 0), crownAo(leafCrown, 0.6)),
  treePart(clump(0.3, [-0.28, 0.84, -0.22], leafCrown, 0), crownAo(leafCrown, 0.6)),
])

function Forest({ trees, geometry, height, colors }: { trees: Tree[]; geometry: THREE.BufferGeometry; height: number; colors: [string, string] }) {
  const ref = useRef<THREE.InstancedMesh>(null)
  const material = useMemo(() => windyFoliage(height), [height])
  useLayoutEffect(() => {
    const m = new THREE.Matrix4()
    const q = new THREE.Quaternion()
    const a = new THREE.Color(colors[0])
    const b = new THREE.Color(colors[1])
    const c = new THREE.Color()
    trees.forEach((t, i) => {
      q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), t.rot)
      m.compose(new THREE.Vector3(t.x, t.y, t.z), q, new THREE.Vector3(t.s, t.s * (0.9 + t.shade * 0.3), t.s))
      ref.current!.setMatrixAt(i, m)
      ref.current!.setColorAt(i, c.copy(a).lerp(b, t.shade))
    })
    ref.current!.instanceMatrix.needsUpdate = true
    ref.current!.instanceColor!.needsUpdate = true
    ref.current!.computeBoundingSphere()
  }, [trees, colors])
  return (
    <instancedMesh ref={ref} args={[geometry, material, trees.length]} />
  )
}

export default function Trees() {
  const { conifers, jungle } = forest()
  return (
    <group>
      <Forest trees={conifers} geometry={conifer} height={CONIFER_H} colors={['#1f3b26', '#3a5a2c']} />
      <Forest trees={jungle} geometry={broadleaf} height={BROADLEAF_H} colors={['#244d1f', '#4f7a2a']} />
    </group>
  )
}
