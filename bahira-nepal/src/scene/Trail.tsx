import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { trailCurve, dayToU, dayU, waypoints, FIRST_FLIGHT, DAY_COUNT } from '../utils/journey'
import { getTerrainHeight } from '../utils/terrainMath'
import { scrollState } from '../state/scrollStore'
import { merge, rng } from './props/placement'

// Prayer-flag colours (sky, air, fire, water, earth): each checkpoint's pennant takes the next one.
const FLAG_COLORS = ['#1f5fbf', '#f5f5f0', '#c62828', '#2e7d32', '#f9c80e'].map((c) => new THREE.Color(c))
const UNREACHED = new THREE.Color('#d9d4c8')

const pathVertex = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`
/**
 * One shader for both tubes. Walked: warm gold up to the trekkers. Ahead: a faint sand-coloured
 * footpath. Flight legs (past uFlight) are dashed.
 */
const pathFragment = /* glsl */ `
uniform float uProgress;
uniform float uFlight;
uniform float uWalked;
varying vec2 vUv;
void main() {
  if (vUv.x > uFlight && fract(vUv.x * 900.0) > 0.55) discard;
  if (uWalked > 0.5) {
    if (vUv.x > uProgress) discard;
    float head = exp(-(uProgress - vUv.x) * 80.0);
    gl_FragColor = vec4(mix(vec3(0.86, 0.6, 0.2), vec3(1.0, 0.82, 0.45), head) * (0.9 + head * 0.5), 1.0);
  } else {
    gl_FragColor = vec4(0.95, 0.9, 0.78, 0.45);
  }
}
`

const material = (walked: boolean) =>
  new THREE.ShaderMaterial({
    vertexShader: pathVertex,
    fragmentShader: pathFragment,
    uniforms: { uProgress: { value: 0 }, uFlight: { value: 1 }, uWalked: { value: walked ? 1 : 0 } },
    transparent: !walked,
    depthWrite: walked,
    toneMapped: false,
  })

/** A trailside cairn: three stacked stones and a pole with a pennant (pennant is a separate mesh). */
function cairnGeometry(seed: number) {
  const r = rng(seed)
  const stone = (s: number, y: number) =>
    new THREE.DodecahedronGeometry(s, 0).scale(1, 0.62, 1).rotateY(r() * Math.PI).translate((r() - 0.5) * 0.08, y, (r() - 0.5) * 0.08)
  return merge([stone(0.42, 0.2), stone(0.32, 0.5), stone(0.22, 0.74), new THREE.CylinderGeometry(0.035, 0.035, 2.1, 5).translate(0, 1.6, 0)])
}
// Triangular pennant flying from the pole top, +x downwind.
const pennant = new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute([0, 2.6, 0, 0, 2.05, 0, 0.85, 2.36, 0], 3))
pennant.computeVertexNormals()

export default function Trail() {
  const bgGeo = useMemo(() => new THREE.TubeGeometry(trailCurve, 1400, 0.12, 6, false), [])
  const fgGeo = useMemo(() => new THREE.TubeGeometry(trailCurve, 1400, 0.2, 6, false), [])
  const bgMat = useMemo(() => material(false), [])
  const fgMat = useMemo(() => material(true), [])
  // TubeGeometry's uv.x is the curve's t, not arc length.
  const flightT = useMemo(() => trailCurve.getUtoTmapping(dayU[FIRST_FLIGHT], 0), [])

  // Checkpoints at every stop on the ground (Day 15 is mid-air, on the way home).
  const stops = useMemo(
    () =>
      waypoints.slice(0, DAY_COUNT - 1).map((p, i) => ({
        pos: new THREE.Vector3(p.x + 1.1, getTerrainHeight(p.x + 1.1, p.z), p.z),
        geo: cairnGeometry(101 + i),
        color: FLAG_COLORS[i % FLAG_COLORS.length],
      })),
    [],
  )
  const groups = useRef<(THREE.Group | null)[]>([])
  const flags = useRef<(THREE.Mesh | null)[]>([])

  useFrame((state) => {
    const { dayFloat } = scrollState
    const t = trailCurve.getUtoTmapping(dayToU(dayFloat), 0)
    fgMat.uniforms.uProgress.value = t
    fgMat.uniforms.uFlight.value = bgMat.uniforms.uFlight.value = flightT
    const time = state.clock.elapsedTime

    stops.forEach((s, i) => {
      const g = groups.current[i]
      const f = flags.current[i]
      if (!g || !f) return
      // Stay legible from the overview without towering over the valley up close.
      g.scale.setScalar(THREE.MathUtils.clamp(state.camera.position.distanceTo(s.pos) / 70, 1, 4))
      const reached = THREE.MathUtils.smoothstep(dayFloat - i, -0.15, 0.1)
      ;(f.material as THREE.MeshLambertMaterial).color.copy(UNREACHED).lerp(s.color, reached)
      f.rotation.y = Math.sin(time * 1.7 + i) * 0.35
    })
  })

  return (
    <group>
      <mesh geometry={bgGeo} material={bgMat} />
      <mesh geometry={fgGeo} material={fgMat} />

      {stops.map((s, i) => (
        <group
          key={i}
          position={s.pos}
          ref={(el) => {
            groups.current[i] = el
          }}
        >
          <mesh geometry={s.geo}>
            <meshLambertMaterial color="#8d867b" flatShading />
          </mesh>
          <mesh
            geometry={pennant}
            ref={(el) => {
              flags.current[i] = el
            }}
          >
            <meshLambertMaterial side={THREE.DoubleSide} />
          </mesh>
        </group>
      ))}
    </group>
  )
}
