import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { besideTrail } from './placement'
import { getTerrainHeight } from '../../utils/terrainMath'
import { SPOTS } from './spots'

const COLORS = ['#1f5fbf', '#f5f5f0', '#c62828', '#2e7d32', '#f9c80e'] // sky, air, fire, water, earth
const flag = new THREE.PlaneGeometry(0.32, 0.24).translate(0, -0.12, 0)

interface Flag {
  pos: THREE.Vector3
  dir: THREE.Vector3
  phase: number
}

/** Sagging string of flags between two points. */
function string(a: THREE.Vector3, b: THREE.Vector3, sag: number, out: Flag[]) {
  const len = a.distanceTo(b)
  const n = Math.max(3, Math.floor(len / 0.42))
  const dir = b.clone().sub(a).normalize()
  for (let i = 1; i < n; i++) {
    const t = i / n
    const p = a.clone().lerp(b, t)
    p.y -= sag * 4 * t * (1 - t)
    out.push({ pos: p, dir, phase: out.length * 0.7 })
  }
}

const at = (day: number, offset: number, along: number, lift: number) => {
  const p = besideTrail(day, offset, along)
  return new THREE.Vector3(p.x, getTerrainHeight(p.x, p.z) + lift, p.z)
}

export default function PrayerFlags() {
  const { flags, poles } = useMemo(() => {
    const flags: Flag[] = []
    const poles: THREE.Vector3[] = []
    // Base camp: radiating strings from a tall central mast
    const c = SPOTS.abcChorten
    const mast = at(c.day, c.offset, c.along, 4.2)
    poles.push(mast)
    for (let k = 0; k < 7; k++) {
      const ang = (k / 7) * Math.PI * 2
      const end = at(c.day, c.offset + Math.cos(ang) * 5.5, c.along + Math.sin(ang) * 5.5, 0.4)
      string(mast, end, 0.5, flags)
    }
    // Boudhanath: from spire to the terrace corners
    const b = SPOTS.boudhanath
    const spire = at(b.day, b.offset, b.along, 4.2)
    for (let k = 0; k < 8; k++) {
      const ang = (k / 8) * Math.PI * 2
      string(spire, at(b.day, b.offset + Math.cos(ang) * 4, b.along + Math.sin(ang) * 4, 0.6), 0.4, flags)
    }
    // Strung across the trail at the teahouse stops and on the high passes
    for (const [day, along] of [[6, 1.5], [7, -1], [9, 1], [10, 0], [11, 2], [7.5, 0], [8.4, 0]] as const) {
      const a = at(day, -3.2, along, 2.4)
      const b = at(day, 3.2, along + 0.8, 2.4)
      poles.push(a, b)
      string(a, b, 0.6, flags)
    }
    return { flags, poles }
  }, [])

  const ref = useRef<THREE.InstancedMesh>(null)
  const tmp = useMemo(
    () => ({ m: new THREE.Matrix4(), q: new THREE.Quaternion(), q2: new THREE.Quaternion(), s: new THREE.Vector3(1, 1, 1), c: new THREE.Color() }),
    [],
  )
  const colored = useRef(false)

  useFrame((state) => {
    const mesh = ref.current!
    const time = state.clock.elapsedTime
    flags.forEach((f, i) => {
      // Face across the string, then flutter about it.
      tmp.q.setFromUnitVectors(new THREE.Vector3(1, 0, 0), f.dir)
      tmp.q2.setFromAxisAngle(f.dir, Math.sin(time * 3.1 + f.phase) * 0.45)
      tmp.m.compose(f.pos, tmp.q2.multiply(tmp.q), tmp.s)
      mesh.setMatrixAt(i, tmp.m)
      if (!colored.current) mesh.setColorAt(i, tmp.c.set(COLORS[i % COLORS.length]))
    })
    mesh.instanceMatrix.needsUpdate = true
    if (!colored.current) {
      mesh.instanceColor!.needsUpdate = true
      mesh.computeBoundingSphere()
      colored.current = true
    }
  })

  return (
    <group>
      <instancedMesh ref={ref} args={[flag, undefined, flags.length]} frustumCulled={false}>
        <meshLambertMaterial side={THREE.DoubleSide} />
      </instancedMesh>
      {poles.map((p, i) => (
        <mesh key={i} position={[p.x, p.y / 2 + getTerrainHeight(p.x, p.z) / 2, p.z]}>
          <cylinderGeometry args={[0.05, 0.05, p.y - getTerrainHeight(p.x, p.z) + 0.3, 5]} />
          <meshLambertMaterial color="#6b5a45" />
        </mesh>
      ))}
    </group>
  )
}
