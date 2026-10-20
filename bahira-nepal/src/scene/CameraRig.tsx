import { useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { trailCurve, dayToU, waypoints } from '../utils/journey'
import { scrollState } from '../state/scrollStore'
import { getTerrainHeight, smoothstep } from '../utils/terrainMath'
import { ANNAPURNA } from './props/spots'

const MIN_CLEARANCE = 14

const OVERVIEW_TARGET = new THREE.Vector3(0, 6, -165)

const BASE_FOV = 35
// Day 9 reveal: stand in the base-camp basin, then tilt from the lodges up to the summit.
const ABC = waypoints[8]
const SUMMIT = new THREE.Vector3(
  ANNAPURNA.x,
  getTerrainHeight(ANNAPURNA.x, ANNAPURNA.z) - ANNAPURNA.sink + ANNAPURNA.height * 0.85,
  ANNAPURNA.z,
)

export default function CameraRig() {
  const camera = useThree((s) => s.camera)

  const v = useMemo(
    () => ({
      beacon: new THREE.Vector3(),
      ahead: new THREE.Vector3(),
      tangent: new THREE.Vector3(),
      chasePos: new THREE.Vector3(),
      chaseLook: new THREE.Vector3(),
      dronePos: new THREE.Vector3(),
      droneLook: new THREE.Vector3(),
      overPos: new THREE.Vector3(),
      revealPos: new THREE.Vector3(),
      revealLook: new THREE.Vector3(),
      pos: new THREE.Vector3(),
      look: new THREE.Vector3(),
      curPos: new THREE.Vector3(0, 30, 60),
      curLook: new THREE.Vector3(0, 0, 0),
      init: false,
    }),
    [],
  )

  useFrame((state, delta) => {
    const d = scrollState.dayFloat
    const u = dayToU(d)

    trailCurve.getPointAt(u, v.beacon)
    trailCurve.getPointAt(Math.min(1, u + 0.05), v.ahead)
    trailCurve.getTangentAt(u, v.tangent)
    v.tangent.y = 0
    v.tangent.normalize()

    // Chase: behind and slightly above the beacon, looking up the canyon.
    v.chasePos.copy(v.beacon).addScaledVector(v.tangent, -46)
    v.chasePos.y = v.beacon.y + 19
    v.chaseLook.copy(v.ahead)
    v.chaseLook.y += 6

    // Drone follow (Days 10-12): high above and behind the trekker on the descent, so the
    // teahouse stops stay in frame. (A fixed east-ridge vantage was tried: from there the
    // basin is all shadowed walls in haze and the trail disappears.)
    v.dronePos.copy(v.beacon).addScaledVector(v.tangent, -60)
    v.dronePos.x += 14
    v.dronePos.y = v.beacon.y + 46
    v.droneLook.copy(v.beacon).addScaledVector(v.tangent, 22)

    // Overview (Act IV): slow orbital pull-up.
    const tOver = smoothstep(11, 12.8, d)
    const orbit = state.clock.elapsedTime * 0.05
    const a = 0.9 + orbit
    v.overPos.set(OVERVIEW_TARGET.x + Math.sin(a) * 110, 300, OVERVIEW_TARGET.z + Math.cos(a) * 170)

    const tDrone = smoothstep(8.8, 9.6, d)
    v.pos.lerpVectors(v.chasePos, v.dronePos, tDrone)
    v.look.lerpVectors(v.chaseLook, v.droneLook, tDrone)

    v.pos.lerp(v.overPos, tOver)
    v.look.lerp(OVERVIEW_TARGET, tOver)

    const wReveal = smoothstep(7.4, 7.95, d) * (1 - smoothstep(8.7, 9.3, d))
    if (wReveal > 0) {
      const tilt = smoothstep(8.2, 8.8, d)
      v.revealPos.set(ABC.x + 6, ABC.y + 9, ABC.z + 16)
      v.revealLook.set(ABC.x - 6, ABC.y + 1, ABC.z - 8).lerp(SUMMIT, tilt * 0.6)
      v.pos.lerp(v.revealPos, wReveal)
      v.look.lerp(v.revealLook, wReveal)
    }
    // Wider lens in the basin so the lodges and the face above fit one frame.
    const fov = BASE_FOV + 17 * wReveal
    const cam = camera as THREE.PerspectiveCamera
    if (Math.abs(cam.fov - fov) > 0.01) {
      cam.fov = fov
      cam.updateProjectionMatrix()
    }

    // Never let the lens drop into a wall (closer allowed inside the basin).
    const floor = getTerrainHeight(v.pos.x, v.pos.z) + THREE.MathUtils.lerp(MIN_CLEARANCE, 5, wReveal)
    if (v.pos.y < floor) v.pos.y = floor

    if (!v.init) {
      v.curPos.copy(v.pos)
      v.curLook.copy(v.look)
      v.init = true
    }
    const k = 1 - Math.exp(-3.2 * Math.min(delta, 0.1))
    v.curPos.lerp(v.pos, k)
    v.curLook.lerp(v.look, k)
    camera.position.copy(v.curPos)
    camera.lookAt(v.curLook)
  })

  return null
}
