import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { puffGeometry, puffMaterial } from './puffs'
import { getTerrainHeight } from '../../utils/terrainMath'
import { idleTime } from '../motion'
import { windGust, WIND_DIR } from '../wind'
import { buildings } from './places'

const PUFFS = 7

/**
 * Wood smoke from the kitchens of lived-in houses and teahouses (every third lit one): puffs rise,
 * swell and lean off downwind, harder in a gust, then thin out. One instanced mesh of soft puffs.
 */
export default function Smoke() {
  const chimneys = useMemo(
    () =>
      buildings
        .filter((b) => b.lit)
        .filter((_, i) => i % 3 === 0)
        .map((b, i) => ({
          // Off-centre on the roof, toward the back.
          x: b.x - Math.sin(b.rot) * b.d * 0.2,
          z: b.z - Math.cos(b.rot) * b.d * 0.2,
          y: getTerrainHeight(b.x, b.z) + b.h + b.roofH * 0.6,
          size: b.w,
          phase: (i * 0.37) % 1,
        })),
    [],
  )
  const ref = useRef<THREE.InstancedMesh>(null)
  const material = useMemo(() => puffMaterial([0.5, 0.53, 0.58], [0.86, 0.84, 0.8]), [])
  const tmp = useMemo(() => ({ m: new THREE.Matrix4(), q: new THREE.Quaternion(), p: new THREE.Vector3(), s: new THREE.Vector3(), c: new THREE.Color() }), [])

  useFrame((state) => {
    const time = idleTime(state.clock.elapsedTime)
    const mesh = ref.current!
    let i = 0
    for (const c of chimneys) {
      const lean = 0.6 + windGust(c.x, c.z, time) * 1.6
      for (let k = 0; k < PUFFS; k++) {
        const a = (time * 0.11 + k / PUFFS + c.phase) % 1 // 0 at the chimney, 1 where it has thinned out
        const rise = a * 2.4 * c.size
        const drift = a * a * lean * c.size
        tmp.p.set(
          c.x + WIND_DIR.x * drift + Math.sin(time * 0.7 + k * 2.1) * 0.06 * a,
          c.y + rise,
          c.z + WIND_DIR.y * drift + Math.cos(time * 0.6 + k * 1.7) * 0.06 * a,
        )
        // Swells as it rises and thins out: fades in at the chimney, away at the top.
        const r = (0.1 + a * 0.5) * c.size
        mesh.setMatrixAt(i, tmp.m.compose(tmp.p, tmp.q, tmp.s.setScalar(r)))
        mesh.setColorAt(i++, tmp.c.setRGB(Math.min(1, a / 0.12) * (1 - a) * 0.6, 0, 0))
      }
    }
    mesh.instanceMatrix.needsUpdate = true
    mesh.instanceColor!.needsUpdate = true
  })

  return (
    <instancedMesh ref={ref} args={[puffGeometry, material, chimneys.length * PUFFS]} frustumCulled={false} />
  )
}
