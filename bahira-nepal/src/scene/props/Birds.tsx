import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { besideTrail } from './placement'
import { idleTime } from '../motion'

// One wing: a thin triangle hinged at the body (x = 0), spanning +x.
const wing = new THREE.BufferGeometry().setAttribute(
  'position',
  new THREE.Float32BufferAttribute([0, 0, 0.18, 0, 0, -0.18, 0.75, 0, -0.05], 3),
)
wing.computeVertexNormals()

interface Flock {
  center: THREE.Vector3
  radius: number
  count: number
  speed: number
  /** wing size: swallows ~0.5, crows 1, eagles and griffons ~2 */
  size: number
  /** wingbeat amplitude; the big birds mostly glide */
  flap: number
}

const crows = { size: 1, flap: 0.6 }
const swallows = { size: 0.5, flap: 0.8 }
const raptors = { size: 2.1, flap: 0.12 }

export default function Birds() {
  const flocks: Flock[] = useMemo(
    () =>
      [
        { day: 0.6, side: 15, lift: 20, radius: 8, count: 6, speed: 0.2, ...crows },
        { day: 2.5, side: -16, lift: 22, radius: 9, count: 6, speed: 0.22, ...crows },
        { day: 3.1, side: 13, lift: 9, radius: 6, count: 9, speed: 0.45, ...swallows },
        { day: 4.4, side: 18, lift: 26, radius: 11, count: 7, speed: 0.18, ...crows },
        { day: 4.1, side: -14, lift: 8, radius: 7, count: 10, speed: 0.5, ...swallows },
        { day: 5.4, side: 16, lift: 12, radius: 6, count: 8, speed: 0.42, ...swallows },
        { day: 6.5, side: -24, lift: 34, radius: 10, count: 3, speed: 0.08, ...raptors },
        { day: 7.4, side: 24, lift: 38, radius: 10, count: 2, speed: 0.07, ...raptors },
        { day: 8, side: -10, lift: 34, radius: 13, count: 5, speed: 0.14, ...crows },
        { day: 8.6, side: 26, lift: 44, radius: 12, count: 3, speed: 0.06, ...raptors },
        { day: 10.4, side: -15, lift: 10, radius: 6, count: 7, speed: 0.4, ...swallows },
        { day: 11.2, side: 24, lift: 32, radius: 10, count: 2, speed: 0.08, ...raptors },
      ].map((f) => {
        // Kept above and beside the chase camera's path so no bird crosses the lens.
        const p = besideTrail(f.day, f.side)
        return { center: new THREE.Vector3(p.x, p.y + f.lift, p.z), radius: f.radius, count: f.count, speed: f.speed, size: f.size, flap: f.flap }
      }),
    [],
  )
  const total = flocks.reduce((n, f) => n + f.count, 0)
  const ref = useRef<THREE.InstancedMesh>(null)
  const tmp = useMemo(
    () => ({ m: new THREE.Matrix4(), q: new THREE.Quaternion(), e: new THREE.Euler(), p: new THREE.Vector3(), s: new THREE.Vector3(1, 1, 1) }),
    [],
  )

  useFrame((state) => {
    const time = idleTime(state.clock.elapsedTime)
    let i = 0
    for (const f of flocks) {
      for (let b = 0; b < f.count; b++) {
        const ang = time * f.speed + (b / f.count) * Math.PI * 2 + Math.sin(b * 12.9) * 0.4
        const r = f.radius * (0.75 + 0.25 * Math.sin(b * 3.7))
        tmp.p.set(f.center.x + Math.cos(ang) * r, f.center.y + Math.sin(time * 0.7 + b) * 1.2, f.center.z + Math.sin(ang) * r)
        const heading = -ang // tangent to the circle
        // Big birds beat slower and mostly glide, wings held in a shallow V.
        const flap = Math.sin((time * 9) / Math.sqrt(f.size) + b * 1.3) * f.flap + (f.flap < 0.3 ? 0.12 : 0)
        for (const side of [1, -1]) {
          tmp.e.set(0, heading, side * flap)
          tmp.q.setFromEuler(tmp.e)
          tmp.s.set(side * f.size, f.size, f.size)
          tmp.m.compose(tmp.p, tmp.q, tmp.s)
          ref.current!.setMatrixAt(i++, tmp.m)
        }
      }
    }
    ref.current!.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={ref} args={[wing, undefined, total * 2]} frustumCulled={false}>
      <meshLambertMaterial color="#1d2420" side={THREE.DoubleSide} />
    </instancedMesh>
  )
}
