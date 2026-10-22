import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { getTerrainHeight } from '../../utils/terrainMath'
import { idleTime } from '../motion'
import { WIND_DIR } from '../wind'
import { rng } from './placement'
import { puffGeometry, puffMaterial } from './puffs'
import { ANNAPURNA, FISHTAIL } from './spots'

interface Puff {
  base: THREE.Vector3
  r: number
  phase: number
}

/** A bank of cloud: overlapping soft puffs, wider than tall, clinging to a summit's flank. */
function bank(seed: number, at: THREE.Vector3, size: number, out: Puff[]) {
  const r = rng(seed)
  const n = 7 + Math.floor(r() * 4)
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + r()
    const d = size * (0.3 + r() * 0.7)
    out.push({
      base: at.clone().add(new THREE.Vector3(Math.cos(a) * d * 1.4, r() * size * 0.35, Math.sin(a) * d * 0.7)),
      r: size * (0.45 + r() * 0.45),
      phase: r() * Math.PI * 2,
    })
  }
}

/**
 * Cloud caught on the high summits, drifting with the valley wind and slowly reshaping. Kept on the
 * peaks (west of the valley, above the walls) so none ever comes between the camera and the trail.
 */
export default function Clouds() {
  const puffs = useMemo(() => {
    const out: Puff[] = []
    const peak = (p: typeof ANNAPURNA, k: number) => getTerrainHeight(p.x, p.z) - p.sink + p.height * k
    bank(1, new THREE.Vector3(ANNAPURNA.x + 8, peak(ANNAPURNA, 0.62), ANNAPURNA.z + 10), 7, out)
    bank(2, new THREE.Vector3(ANNAPURNA.x - 6, peak(ANNAPURNA, 0.7), ANNAPURNA.z - 14), 8, out)
    bank(3, new THREE.Vector3(FISHTAIL.x + 7, peak(FISHTAIL, 0.6), FISHTAIL.z + 3), 6, out)
    bank(4, new THREE.Vector3(FISHTAIL.x - 8, peak(FISHTAIL, 0.68), FISHTAIL.z - 6), 7, out)
    return out
  }, [])
  const ref = useRef<THREE.InstancedMesh>(null)
  const material = useMemo(() => puffMaterial([0.62, 0.68, 0.78], [1.05, 1.04, 1.0]), [])
  const tmp = useMemo(() => ({ m: new THREE.Matrix4(), q: new THREE.Quaternion(), p: new THREE.Vector3(), s: new THREE.Vector3(), c: new THREE.Color() }), [])

  useFrame((state) => {
    const time = idleTime(state.clock.elapsedTime)
    puffs.forEach((c, i) => {
      // Drift a few units up-valley and back over a few minutes; each blob swells and shrinks.
      const drift = Math.sin(time * 0.025 + c.phase * 0.2) * 5
      tmp.p.set(c.base.x + WIND_DIR.x * drift, c.base.y + Math.sin(time * 0.08 + c.phase) * 0.6, c.base.z + WIND_DIR.y * drift)
      const k = 1 + Math.sin(time * 0.06 + c.phase) * 0.12
      tmp.s.set(c.r * k * 1.5, c.r * k * 0.8, 1)
      ref.current!.setMatrixAt(i, tmp.m.compose(tmp.p, tmp.q, tmp.s))
      ref.current!.setColorAt(i, tmp.c.setRGB(0.75, 0, 0))
    })
    ref.current!.instanceMatrix.needsUpdate = true
    ref.current!.instanceColor!.needsUpdate = true
  })

  return (
    <instancedMesh ref={ref} args={[puffGeometry, material, puffs.length]} frustumCulled={false} />
  )
}
