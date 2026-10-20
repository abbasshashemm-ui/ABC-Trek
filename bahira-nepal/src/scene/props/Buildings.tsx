import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { groundUnder } from './placement'
import type { BuildingSpec } from './village'

const box = new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0)
// 4-sided cone turned 45deg = pyramid roof with a square base slightly wider than the walls.
const pyramid = new THREE.ConeGeometry(0.8, 1, 4).rotateY(Math.PI / 4).translate(0, 0.5, 0)
const pane = new THREE.PlaneGeometry(1, 1)
const WINDOW = new THREE.Color(2.4, 1.5, 0.6) // > 1 so the bloom pass gives a warm glow

export default function Buildings({ specs }: { specs: BuildingSpec[] }) {
  const bodies = useRef<THREE.InstancedMesh>(null)
  const roofs = useRef<THREE.InstancedMesh>(null)
  const windows = useRef<THREE.InstancedMesh>(null)
  const litCount = useMemo(() => specs.filter((s) => s.lit).length, [specs])

  useLayoutEffect(() => {
    const m = new THREE.Matrix4()
    const q = new THREE.Quaternion()
    const up = new THREE.Vector3(0, 1, 0)
    const pos = new THREE.Vector3()
    const scl = new THREE.Vector3()
    const off = new THREE.Vector3()
    const col = new THREE.Color()
    let wi = 0
    specs.forEach((b, i) => {
      q.setFromAxisAngle(up, b.rot)
      // Walls start at the lowest ground under the footprint so nothing floats.
      const base = groundUnder(b.x, b.z, b.w / 2, b.d / 2, b.rot) - 0.15
      const top = groundUnder(b.x, b.z, 0, 0, 0) + b.h
      m.compose(pos.set(b.x, base, b.z), q, scl.set(b.w, top - base, b.d))
      bodies.current!.setMatrixAt(i, m)
      bodies.current!.setColorAt(i, col.set(b.wall))

      m.compose(pos.set(b.x, top, b.z), q, scl.set(b.w, b.roofH, b.d))
      roofs.current!.setMatrixAt(i, m)
      roofs.current!.setColorAt(i, col.set(b.roof))

      if (b.lit) {
        off.set(0, -b.h * 0.55, b.d / 2 + 0.02).applyQuaternion(q)
        m.compose(pos.set(b.x, top, b.z).add(off), q, scl.set(b.w * 0.28, b.h * 0.3, 1))
        windows.current!.setMatrixAt(wi++, m)
      }
    })
    for (const mesh of [bodies.current!, roofs.current!, windows.current!]) {
      mesh.instanceMatrix.needsUpdate = true
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
      mesh.computeBoundingSphere()
    }
  }, [specs])

  return (
    <group>
      <instancedMesh ref={bodies} args={[box, undefined, specs.length]}>
        <meshLambertMaterial flatShading />
      </instancedMesh>
      <instancedMesh ref={roofs} args={[pyramid, undefined, specs.length]}>
        <meshLambertMaterial flatShading />
      </instancedMesh>
      <instancedMesh ref={windows} args={[pane, undefined, Math.max(1, litCount)]} count={litCount}>
        <meshBasicMaterial color={WINDOW} toneMapped={false} />
      </instancedMesh>
    </group>
  )
}
