import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { trailCurve, dayToU, dayU, waypoints, FIRST_FLIGHT, DAY_COUNT } from '../utils/journey'
import { getTerrainHeight } from '../utils/terrainMath'
import { scrollState } from '../state/scrollStore'
import { merge, rng } from './props/placement'
import { idleTime } from './motion'

// Prayer-flag colours (sky, air, fire, water, earth): each checkpoint's pennant takes the next one.
const FLAG_COLORS = ['#1f5fbf', '#f5f5f0', '#c62828', '#2e7d32', '#f9c80e'].map((c) => new THREE.Color(c))
const UNREACHED = new THREE.Color('#d9d4c8')

const pathVertex = /* glsl */ `
varying vec2 vUv;
varying float vFacing;
void main() {
  vUv = uv;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  // How squarely the tube faces the camera: its sides shade off so it reads round, not as a flat cut-out.
  vFacing = abs(dot(normalize(normalMatrix * normal), normalize(-mv.xyz)));
  gl_Position = projectionMatrix * mv;
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
varying float vFacing;
void main() {
  if (vUv.x > uFlight && fract(vUv.x * 900.0) > 0.55) discard;
  if (uWalked > 0.5) {
    if (vUv.x > uProgress) discard;
    float head = exp(-(uProgress - vUv.x) * 80.0);
    float shade = mix(0.68, 1.0, sqrt(vFacing));
    gl_FragColor = vec4(mix(vec3(0.86, 0.6, 0.2), vec3(1.0, 0.82, 0.45), head) * (0.9 + head * 0.5) * shade, 1.0);
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

const UP = new THREE.Vector3(0, 1, 0)

/** A trailside cairn: three stacked stones and a pole with a pennant (pennant is a separate mesh). */
const cairnGeo = (() => {
  const r = rng(101)
  const stone = (s: number, y: number) =>
    new THREE.DodecahedronGeometry(s, 0).scale(1, 0.62, 1).rotateY(r() * Math.PI).translate((r() - 0.5) * 0.08, y, (r() - 0.5) * 0.08)
  return merge([stone(0.42, 0.2), stone(0.32, 0.5), stone(0.22, 0.74), new THREE.CylinderGeometry(0.035, 0.035, 2.1, 5).translate(0, 1.6, 0)])
})()
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

  // Checkpoints at every stop on the ground (Day 15 is mid-air, on the way home). One cairn shape,
  // instanced (two draw calls for all of them), varied by a turn and a slight size change.
  const stops = useMemo(() => {
    const r = rng(101)
    return waypoints.slice(0, DAY_COUNT - 1).map((p, i) => ({
      pos: new THREE.Vector3(p.x + 1.1, getTerrainHeight(p.x + 1.1, p.z), p.z),
      turn: new THREE.Quaternion().setFromAxisAngle(UP, r() * Math.PI * 2),
      size: 0.85 + r() * 0.3,
      color: FLAG_COLORS[i % FLAG_COLORS.length],
    }))
  }, [])
  const cairns = useRef<THREE.InstancedMesh>(null)
  const flags = useRef<THREE.InstancedMesh>(null)
  const tmp = useMemo(() => ({ m: new THREE.Matrix4(), q: new THREE.Quaternion(), s: new THREE.Vector3(), c: new THREE.Color() }), [])

  useFrame((state) => {
    const { dayFloat } = scrollState
    const t = trailCurve.getUtoTmapping(dayToU(dayFloat), 0)
    fgMat.uniforms.uProgress.value = t
    fgMat.uniforms.uFlight.value = bgMat.uniforms.uFlight.value = flightT
    const time = idleTime(state.clock.elapsedTime)

    stops.forEach((st, i) => {
      // Stay legible from the overview without towering over the valley up close.
      const scale = THREE.MathUtils.clamp(state.camera.position.distanceTo(st.pos) / 70, 1, 4) * st.size
      tmp.s.setScalar(scale)
      cairns.current!.setMatrixAt(i, tmp.m.compose(st.pos, st.turn, tmp.s))
      tmp.q.setFromAxisAngle(UP, Math.sin(time * 1.7 + i) * 0.35)
      flags.current!.setMatrixAt(i, tmp.m.compose(st.pos, tmp.q, tmp.s))
      const reached = THREE.MathUtils.smoothstep(dayFloat - i, -0.15, 0.1)
      flags.current!.setColorAt(i, tmp.c.copy(UNREACHED).lerp(st.color, reached))
    })
    cairns.current!.instanceMatrix.needsUpdate = true
    flags.current!.instanceMatrix.needsUpdate = true
    flags.current!.instanceColor!.needsUpdate = true
  })

  return (
    <group>
      <mesh geometry={bgGeo} material={bgMat} />
      <mesh geometry={fgGeo} material={fgMat} />

      <instancedMesh ref={cairns} args={[cairnGeo, undefined, stops.length]} frustumCulled={false}>
        <meshLambertMaterial color="#8d867b" flatShading />
      </instancedMesh>
      <instancedMesh ref={flags} args={[pennant, undefined, stops.length]} frustumCulled={false}>
        <meshLambertMaterial side={THREE.DoubleSide} />
      </instancedMesh>
    </group>
  )
}
