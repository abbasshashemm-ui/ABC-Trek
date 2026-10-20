import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { getTerrainHeight, valleyCenter } from '../../utils/terrainMath'
import { rng, slopeAt, merge } from './placement'
import { buildings } from './places'
import { clearOfLandmarks } from './spots'

const conifer = merge([
  new THREE.CylinderGeometry(0.06, 0.08, 0.5, 5).translate(0, 0.25, 0),
  new THREE.ConeGeometry(0.42, 1.0, 6).translate(0, 0.85, 0),
  new THREE.ConeGeometry(0.32, 0.8, 6).translate(0, 1.25, 0),
])
const broadleaf = merge([
  new THREE.CylinderGeometry(0.06, 0.09, 0.6, 5).translate(0, 0.3, 0),
  new THREE.IcosahedronGeometry(0.55, 0).translate(0, 0.95, 0),
])

interface Tree {
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

function Forest({ trees, geometry, colors }: { trees: Tree[]; geometry: THREE.BufferGeometry; colors: [string, string] }) {
  const ref = useRef<THREE.InstancedMesh>(null)
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
    <instancedMesh ref={ref} args={[geometry, undefined, trees.length]}>
      <meshLambertMaterial flatShading />
    </instancedMesh>
  )
}

export default function Trees() {
  const { conifers, jungle } = useMemo(() => plant(), [])
  return (
    <group>
      <Forest trees={conifers} geometry={conifer} colors={['#1f3b26', '#3a5a2c']} />
      <Forest trees={jungle} geometry={broadleaf} colors={['#244d1f', '#4f7a2a']} />
    </group>
  )
}
