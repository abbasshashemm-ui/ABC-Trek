import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { besideTrail, groundUnder, rng, merge } from './placement'
import { getTerrainHeight } from '../../utils/terrainMath'
import { ANNAPURNA, FISHTAIL } from './spots'
import { idleTime } from '../motion'

const WHITE = '#f2efe8'
const GOLD = '#d4a72c'

/** Boudhanath-style stupa: stepped terrace, white dome, gilded harmika and spire. */
export function Stupa({ day, offset, along = 0, scale = 1 }: { day: number; offset: number; along?: number; scale?: number }) {
  const p = besideTrail(day, offset, along)
  const base = groundUnder(p.x, p.z, 1.8 * scale, 1.8 * scale, 0) - 0.2
  return (
    <group position={[p.x, base, p.z]} scale={scale}>
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[3.6, 0.6, 3.6]} />
        <meshLambertMaterial color={WHITE} />
      </mesh>
      <mesh position={[0, 0.75, 0]}>
        <boxGeometry args={[2.8, 0.3, 2.8]} />
        <meshLambertMaterial color={WHITE} />
      </mesh>
      <mesh position={[0, 0.9, 0]}>
        <sphereGeometry args={[1.3, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshLambertMaterial color={WHITE} />
      </mesh>
      <mesh position={[0, 2.45, 0]}>
        <boxGeometry args={[0.6, 0.5, 0.6]} />
        <meshLambertMaterial color={GOLD} />
      </mesh>
      <mesh position={[0, 3.5, 0]}>
        <coneGeometry args={[0.3, 1.6, 8]} />
        <meshLambertMaterial color={GOLD} />
      </mesh>
    </group>
  )
}

/** Tiered Newari temple (Pashupatinath-like). */
export function Pagoda({ day, offset, along = 0 }: { day: number; offset: number; along?: number }) {
  const p = besideTrail(day, offset, along)
  const base = groundUnder(p.x, p.z, 1.2, 1.2, 0) - 0.2
  const tiers = [
    { w: 2.2, h: 1.2, roof: 1.0 },
    { w: 1.6, h: 0.8, roof: 0.8 },
    { w: 1.1, h: 0.6, roof: 0.7 },
  ]
  let y = 0
  return (
    <group position={[p.x, base, p.z]} rotation={[0, Math.PI / 4, 0]}>
      {tiers.map((t, i) => {
        const bodyY = y + t.h / 2
        const roofY = y + t.h + t.roof / 2
        y += t.h + t.roof * 0.55
        return (
          <group key={i}>
            <mesh position={[0, bodyY, 0]}>
              <boxGeometry args={[t.w, t.h, t.w]} />
              <meshLambertMaterial color="#7a3b26" />
            </mesh>
            <mesh position={[0, roofY, 0]} rotation={[0, Math.PI / 4, 0]}>
              <coneGeometry args={[t.w * 1.05, t.roof, 4]} />
              <meshLambertMaterial color={GOLD} flatShading />
            </mesh>
          </group>
        )
      })}
      <mesh position={[0, y + 0.5, 0]}>
        <coneGeometry args={[0.12, 0.9, 6]} />
        <meshLambertMaterial color={GOLD} />
      </mesh>
    </group>
  )
}

/** Brightly painted boats on Phewa Lake, drifting and rocking. One instanced mesh. */
export function Boats() {
  const boats = useMemo(() => {
    const r = rng(77)
    const colors = ['#c0392b', '#2e86c1', '#f1c40f', '#27ae60', '#e67e22']
    return Array.from({ length: 9 }, (_, i) => {
      const p = besideTrail(4, (r() * 2 - 1) * 4.5 + (r() < 0.5 ? -1.5 : 1.5), (r() * 2 - 1) * 8)
      return { ...p, rot: r() * Math.PI, color: colors[i % colors.length], phase: r() * Math.PI * 2 }
    })
  }, [])
  const ref = useRef<THREE.InstancedMesh>(null)
  const tmp = useMemo(() => ({ m: new THREE.Matrix4(), q: new THREE.Quaternion(), e: new THREE.Euler(), p: new THREE.Vector3(), s: new THREE.Vector3(1, 1, 1) }), [])

  useLayoutEffect(() => {
    const c = new THREE.Color()
    boats.forEach((b, i) => ref.current!.setColorAt(i, c.set(b.color)))
    ref.current!.instanceColor!.needsUpdate = true
  }, [boats])

  useFrame((state) => {
    const time = idleTime(state.clock.elapsedTime)
    boats.forEach((b, i) => {
      // A slow drift along the hull and back, with a gentle rock.
      const drift = Math.sin(time * 0.12 + b.phase) * 0.6
      tmp.p.set(b.x + Math.sin(b.rot) * drift, b.y + 0.12 + Math.sin(time * 1.3 + b.phase) * 0.02, b.z + Math.cos(b.rot) * drift)
      tmp.e.set(Math.sin(time * 0.9 + b.phase) * 0.04, b.rot, Math.sin(time * 1.1 + b.phase * 2) * 0.06)
      tmp.m.compose(tmp.p, tmp.q.setFromEuler(tmp.e), tmp.s)
      ref.current!.setMatrixAt(i, tmp.m)
    })
    ref.current!.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, boats.length]} frustumCulled={false}>
      <boxGeometry args={[0.35, 0.18, 1.0]} />
      <meshLambertMaterial />
    </instancedMesh>
  )
}

const hash3 = (x: number, y: number, z: number) => {
  const s = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453
  return s - Math.floor(s)
}

/**
 * Faceted rock-and-snow peak built from displaced cones (one per summit). Displacement is
 * hashed from vertex position so shared seam vertices move together and never crack.
 */
function peakGeometry(summits: { x: number; z: number; h: number; r: number }[], snowFrom: number) {
  const parts = summits.map((s) => {
    const g = new THREE.ConeGeometry(s.r, s.h, 10, 7)
    g.translate(s.x, s.h / 2, s.z)
    const pos = g.attributes.position
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i)
      const y = pos.getY(i)
      const z = pos.getZ(i)
      const t = y / s.h
      if (t > 0.98) continue // keep the summit sharp
      const n = hash3(x, y, z)
      const k = 1 + (n - 0.5) * 0.55 * (1 - t)
      pos.setXYZ(i, s.x + (x - s.x) * k, y + (hash3(z, x, y) - 0.5) * 0.06 * s.h * (1 - t), s.z + (z - s.z) * k)
    }
    return g
  })
  const g = merge(parts)
  g.computeVertexNormals()

  // Colour per face: snow on the upper, less-steep faces; rock elsewhere.
  const pos = g.attributes.position
  const colors = new Float32Array(pos.count * 3)
  const rock = new THREE.Color('#5d5750')
  const rockDark = new THREE.Color('#47423d')
  const snow = new THREE.Color('#eef2f7')
  const a = new THREE.Vector3()
  const b = new THREE.Vector3()
  const c = new THREE.Vector3()
  const n = new THREE.Vector3()
  const maxH = Math.max(...summits.map((s) => s.h))
  for (let i = 0; i < pos.count; i += 3) {
    a.fromBufferAttribute(pos, i)
    b.fromBufferAttribute(pos, i + 1)
    c.fromBufferAttribute(pos, i + 2)
    n.subVectors(c, b).cross(b.clone().sub(a)).normalize()
    const cy = (a.y + b.y + c.y) / 3 / maxH
    const jitter = hash3(a.x, a.y, a.z) * 0.18
    const col = cy > snowFrom - jitter && Math.abs(n.y) > 0.18 ? snow : jitter > 0.09 ? rock : rockDark
    for (let k = 0; k < 3; k++) col.toArray(colors, (i + k) * 3)
  }
  g.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  return g
}

/** Backdrop summits around the sanctuary: Annapurna's south face and Machhapuchhre's fishtail. */
export function Peaks() {
  const annapurna = useMemo(
    () =>
      peakGeometry(
        [
          { x: 0, z: 0, h: ANNAPURNA.height, r: 16 },
          { x: 3, z: -14, h: 78, r: 13 },
          { x: -2, z: 13, h: 70, r: 12 },
        ],
        0.3,
      ),
    [],
  )
  const fishtail = useMemo(
    () =>
      peakGeometry(
        [
          { x: 0, z: 0, h: FISHTAIL.height, r: 11 },
          { x: 3.5, z: -2, h: 88, r: 8 },
        ],
        0.3,
      ),
    [],
  )
  const a = ANNAPURNA
  const f = FISHTAIL
  return (
    <group>
      <mesh geometry={annapurna} position={[a.x, getTerrainHeight(a.x, a.z) - a.sink, a.z]} scale={[1, 1, 1.4]}>
        <meshLambertMaterial vertexColors flatShading />
      </mesh>
      <mesh geometry={fishtail} position={[f.x, getTerrainHeight(f.x, f.z) - f.sink, f.z]}>
        <meshLambertMaterial vertexColors flatShading />
      </mesh>
    </group>
  )
}
