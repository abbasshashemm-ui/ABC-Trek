import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { trailCurve, dayToU, dayU, FIRST_FLIGHT, TRAIL_LENGTH } from '../utils/journey'
import { getTerrainHeight } from '../utils/terrainMath'
import { scrollState } from '../state/scrollStore'
import { merge } from './props/placement'

/** Jacket colours: the group should read as people on the trail, not as a marker. */
const JACKETS = ['#c8432f', '#2f6fb3', '#e0a526']
/** Spacing between walkers, in world units along the trail. */
const GAP = 1.5
/** Legs swing once per this many units walked, so they only walk while the page scrolls. */
const STRIDE = 1.1

const legGeo = new THREE.BoxGeometry(0.13, 0.5, 0.15).translate(0, -0.25, 0) // hinged at the hip
const bodyGeo = new THREE.CylinderGeometry(0.2, 0.24, 0.62, 8).translate(0, 0.81, 0) // jacket
const headGeo = new THREE.SphereGeometry(0.15, 10, 8).translate(0, 1.27, 0)
const hatGeo = new THREE.CylinderGeometry(0.16, 0.17, 0.1, 10).translate(0, 1.38, 0)
const packGeo = new THREE.BoxGeometry(0.34, 0.5, 0.2).translate(0, 0.86, -0.23)
const poleGeo = new THREE.CylinderGeometry(0.018, 0.018, 1.05, 4).translate(0, 0.52, 0)

function Walker({ jacket, setRef }: { jacket: string; setRef: (g: THREE.Group | null) => void }) {
  return (
    <group ref={setRef}>
      <group name="legL" position={[-0.08, 0.5, 0]}>
        <mesh geometry={legGeo}>
          <meshLambertMaterial color="#3a3f47" />
        </mesh>
      </group>
      <group name="legR" position={[0.08, 0.5, 0]}>
        <mesh geometry={legGeo}>
          <meshLambertMaterial color="#3a3f47" />
        </mesh>
      </group>
      <mesh geometry={bodyGeo}>
        <meshLambertMaterial color={jacket} />
      </mesh>
      <mesh geometry={headGeo}>
        <meshLambertMaterial color="#c99a74" />
      </mesh>
      <mesh geometry={hatGeo}>
        <meshLambertMaterial color="#2d2d2d" />
      </mesh>
      <mesh geometry={packGeo}>
        <meshLambertMaterial color="#6b5a3f" />
      </mesh>
      <group name="pole" position={[0.27, 0.05, 0.12]}>
        <mesh geometry={poleGeo}>
          <meshLambertMaterial color="#9aa0a6" />
        </mesh>
      </group>
    </group>
  )
}

/** Small prop plane for the two flights at the end. Nose points +z. */
function Plane({ setRef }: { setRef: (g: THREE.Group | null) => void }) {
  const geo = useMemo(
    () =>
      merge([
        new THREE.CapsuleGeometry(0.22, 1.5, 4, 8).rotateX(Math.PI / 2),
        new THREE.BoxGeometry(2.2, 0.05, 0.42).translate(0, 0, 0.1),
        new THREE.BoxGeometry(0.8, 0.04, 0.24).translate(0, 0.06, -0.85),
        new THREE.BoxGeometry(0.04, 0.38, 0.3).translate(0, 0.22, -0.85),
      ]),
    [],
  )
  return (
    <group ref={setRef} visible={false}>
      <mesh geometry={geo}>
        <meshLambertMaterial color="#f4f1ea" />
      </mesh>
    </group>
  )
}

/**
 * Three trekkers walk the trail in single file where the old glowing beacon was; on the two
 * flight legs a small plane takes over. Both grow with camera distance so they stay findable
 * in the overview.
 */
export default function Trekkers() {
  const walkers = useRef<(THREE.Group | null)[]>([])
  const party = useRef<THREE.Group>(null)
  const plane = useRef<THREE.Group | null>(null)
  const tmp = useMemo(
    () => ({ p: new THREE.Vector3(), ahead: new THREE.Vector3(), centre: new THREE.Vector3(), up: new THREE.Vector3(0, 1, 0) }),
    [],
  )
  const flightStart = dayU[FIRST_FLIGHT]

  useFrame((state) => {
    const u = dayToU(scrollState.dayFloat)
    const flying = u > flightStart + 0.002
    const walked = u * TRAIL_LENGTH
    party.current!.visible = !flying
    plane.current!.visible = flying

    trailCurve.getPointAt(u, tmp.centre)
    const scale = THREE.MathUtils.clamp(state.camera.position.distanceTo(tmp.centre) / 55, 1, 6)

    if (flying) {
      const g = plane.current!
      g.position.copy(tmp.centre)
      trailCurve.getPointAt(Math.min(1, u + 0.002), tmp.ahead)
      if (tmp.ahead.distanceToSquared(g.position) > 1e-6) g.lookAt(tmp.ahead)
      g.scale.setScalar(scale)
      return
    }

    walkers.current.forEach((g, i) => {
      if (!g) return
      const ui = Math.max(0, u - (i * GAP * scale) / TRAIL_LENGTH)
      trailCurve.getPointAt(ui, tmp.p)
      trailCurve.getPointAt(Math.min(1, ui + 0.003), tmp.ahead)
      tmp.p.y = getTerrainHeight(tmp.p.x, tmp.p.z)
      tmp.ahead.y = tmp.p.y
      g.position.copy(tmp.p)
      if (tmp.ahead.distanceToSquared(tmp.p) > 1e-6) g.lookAt(tmp.ahead)
      g.scale.setScalar(scale)

      // Walk cycle driven by distance, offset per walker so they don't march in step.
      const phase = ((walked - i * 0.7) / STRIDE) * Math.PI * 2
      const swing = Math.sin(phase) * 0.55
      g.getObjectByName('legL')!.rotation.x = swing
      g.getObjectByName('legR')!.rotation.x = -swing
      g.getObjectByName('pole')!.rotation.x = -swing * 0.6
      g.position.y += Math.abs(Math.cos(phase)) * 0.05 * scale
    })
  })

  return (
    <>
      <group ref={party}>
        {JACKETS.map((c, i) => (
          <Walker
            key={c}
            jacket={c}
            setRef={(g) => {
              walkers.current[i] = g
            }}
          />
        ))}
      </group>
      <Plane
        setRef={(g) => {
          plane.current = g
        }}
      />
    </>
  )
}
