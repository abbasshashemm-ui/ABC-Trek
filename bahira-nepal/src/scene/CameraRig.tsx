import { useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { trailCurve, dayToU } from '../utils/journey'
import { scrollState } from '../state/scrollStore'
import { getTerrainHeight, smoothstep, valleyCenter } from '../utils/terrainMath'

const MIN_CLEARANCE = 9

// Fixed pivot of the sanctuary (just below Annapurna Base Camp) for the descent orbit.
const SANCTUARY_Z = -185
const OVERVIEW_TARGET = new THREE.Vector3(0, 6, -165)

export default function CameraRig() {
  const camera = useThree((s) => s.camera)

  const v = useMemo(
    () => ({
      beacon: new THREE.Vector3(),
      ahead: new THREE.Vector3(),
      tangent: new THREE.Vector3(),
      sanctuary: new THREE.Vector3(),
      chasePos: new THREE.Vector3(),
      chaseLook: new THREE.Vector3(),
      ridgePos: new THREE.Vector3(),
      ridgeLook: new THREE.Vector3(),
      overPos: new THREE.Vector3(),
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

    // Ridge vantage (Days 10-12): orbit around the sanctuary pivot to a high ridge
    // on the east wall, looking back across the basin toward ABC.
    const sx = valleyCenter(SANCTUARY_Z)
    v.sanctuary.set(sx, getTerrainHeight(sx, SANCTUARY_Z), SANCTUARY_Z)
    v.ridgePos.set(sx + 58, v.sanctuary.y + 62, SANCTUARY_Z + 26)
    v.ridgeLook.lerpVectors(v.sanctuary, v.beacon, 0.45)

    // Overview (Act IV): slow orbital pull-up.
    const tOver = smoothstep(11, 12.8, d)
    const orbit = state.clock.elapsedTime * 0.05
    const a = 0.9 + orbit
    v.overPos.set(OVERVIEW_TARGET.x + Math.sin(a) * 150, 190, OVERVIEW_TARGET.z + Math.cos(a) * 230)

    // Chase -> ridge orbit (angle/radius interpolation about the sanctuary pivot).
    const tRidge = smoothstep(8.0, 9.2, d)
    const o1x = v.chasePos.x - sx
    const o1z = v.chasePos.z - SANCTUARY_Z
    const o2x = v.ridgePos.x - sx
    const o2z = v.ridgePos.z - SANCTUARY_Z
    const a1 = Math.atan2(o1z, o1x)
    let da = Math.atan2(o2z, o2x) - a1
    da = Math.atan2(Math.sin(da), Math.cos(da)) // shortest arc
    const ang = a1 + da * tRidge
    const rad = THREE.MathUtils.lerp(Math.hypot(o1x, o1z), Math.hypot(o2x, o2z), tRidge)
    const yy = THREE.MathUtils.lerp(v.chasePos.y, v.ridgePos.y, tRidge)
    v.pos.set(sx + Math.cos(ang) * rad, yy, SANCTUARY_Z + Math.sin(ang) * rad)
    v.look.lerpVectors(v.chaseLook, v.ridgeLook, tRidge)

    v.pos.lerp(v.overPos, tOver)
    v.look.lerp(OVERVIEW_TARGET, tOver)

    // Never let the lens drop into a wall.
    const floor = getTerrainHeight(v.pos.x, v.pos.z) + MIN_CLEARANCE
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
