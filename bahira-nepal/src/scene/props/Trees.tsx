import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { merge } from './placement'
import { windyFoliage } from '../wind'
import { forest, CONIFER_H, BROADLEAF_H, type Tree } from './forest'

const conifer = merge([
  new THREE.CylinderGeometry(0.06, 0.08, 0.5, 5).translate(0, 0.25, 0),
  new THREE.ConeGeometry(0.42, 1.0, 6).translate(0, 0.85, 0),
  new THREE.ConeGeometry(0.32, 0.8, 6).translate(0, 1.25, 0),
])
const broadleaf = merge([
  new THREE.CylinderGeometry(0.06, 0.09, 0.6, 5).translate(0, 0.3, 0),
  new THREE.IcosahedronGeometry(0.55, 0).translate(0, 0.95, 0),
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
