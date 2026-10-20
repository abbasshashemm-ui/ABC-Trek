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

/** Bakes a flat colour into the geometry, so differently coloured parts can share one mesh. */
function paint(geo: THREE.BufferGeometry, color: string) {
  const g = geo.index ? geo.toNonIndexed() : geo
  const c = new THREE.Color(color)
  const n = g.getAttribute('position').count
  g.setAttribute('color', new THREE.Float32BufferAttribute(Array.from({ length: n * 3 }, (_, k) => [c.r, c.g, c.b][k % 3]), 3))
  return g
}

const legGeo = new THREE.BoxGeometry(0.13, 0.5, 0.15).translate(0, -0.25, 0) // hinged at the hip
const poleGeo = new THREE.CylinderGeometry(0.018, 0.018, 1.05, 4).translate(0, 0.52, 0)
/** Everything that doesn't swing, merged per jacket colour: one draw call for the torso. */
const torsoGeo = (jacket: string) =>
  merge([
    paint(new THREE.CylinderGeometry(0.2, 0.24, 0.62, 8).translate(0, 0.81, 0), jacket),
    paint(new THREE.SphereGeometry(0.15, 10, 8).translate(0, 1.27, 0), '#c99a74'), // head
    paint(new THREE.CylinderGeometry(0.16, 0.17, 0.1, 10).translate(0, 1.38, 0), '#2d2d2d'), // hat
    paint(new THREE.BoxGeometry(0.34, 0.5, 0.2).translate(0, 0.86, -0.23), '#6b5a3f'), // pack
  ])
// Shared by all three walkers.
const torsoMat = new THREE.MeshLambertMaterial({ vertexColors: true })
const legMat = new THREE.MeshLambertMaterial({ color: '#3a3f47' })
const poleMat = new THREE.MeshLambertMaterial({ color: '#9aa0a6' })

interface WalkerRefs {
  root: THREE.Group | null
  legL: THREE.Group | null
  legR: THREE.Group | null
  pole: THREE.Group | null
}

function Walker({ jacket, setRef }: { jacket: string; setRef: (part: keyof WalkerRefs, g: THREE.Group | null) => void }) {
  const torso = useMemo(() => torsoGeo(jacket), [jacket])
  return (
    <group ref={(g) => setRef('root', g)}>
      <group ref={(g) => setRef('legL', g)} position={[-0.08, 0.5, 0]}>
        <mesh geometry={legGeo} material={legMat} />
      </group>
      <group ref={(g) => setRef('legR', g)} position={[0.08, 0.5, 0]}>
        <mesh geometry={legGeo} material={legMat} />
      </group>
      <mesh geometry={torso} material={torsoMat} />
      <group ref={(g) => setRef('pole', g)} position={[0.27, 0.05, 0.12]}>
        <mesh geometry={poleGeo} material={poleMat} />
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
  const walkers = useMemo<WalkerRefs[]>(() => JACKETS.map(() => ({ root: null, legL: null, legR: null, pole: null })), [])
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

    walkers.forEach((w, i) => {
      const g = w.root
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
      w.legL!.rotation.x = swing
      w.legR!.rotation.x = -swing
      w.pole!.rotation.x = -swing * 0.6
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
            setRef={(part, g) => {
              walkers[i][part] = g
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
