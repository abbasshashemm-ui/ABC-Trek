import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { trailCurve, dayToU, waypoints } from '../utils/journey'
import { scrollState } from '../state/scrollStore'

const GOLD = new THREE.Color('#FFB800')
const DIM = new THREE.Color('#00E5FF')

const progressVertex = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`
const progressFragment = /* glsl */ `
uniform float uProgress;
uniform float uTime;
varying vec2 vUv;
void main() {
  if (vUv.x > uProgress) discard;
  float head = exp(-(uProgress - vUv.x) * 60.0);
  float pulse = 0.85 + 0.15 * sin(vUv.x * 400.0 - uTime * 4.0);
  vec3 gold = mix(vec3(1.0, 0.54, 0.0), vec3(1.0, 0.78, 0.0), head);
  // >1.0 so the bloom pass picks the thread up
  gl_FragColor = vec4(gold * (0.95 + head * 1.6) * pulse, 1.0);
}
`

export default function Trail() {
  const bgGeo = useMemo(() => new THREE.TubeGeometry(trailCurve, 900, 0.2, 8, false), [])
  const fgGeo = useMemo(() => new THREE.TubeGeometry(trailCurve, 900, 0.3, 8, false), [])

  const fgMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: progressVertex,
        fragmentShader: progressFragment,
        uniforms: { uProgress: { value: 0 }, uTime: { value: 0 } },
        toneMapped: false,
      }),
    [],
  )

  const markers = useRef<(THREE.Mesh | null)[]>([])
  const tmp = useMemo(() => new THREE.Color(), [])

  useFrame((state) => {
    const { dayFloat } = scrollState
    // TubeGeometry's uv.x is the curve's t, not arc length -> convert.
    fgMat.uniforms.uProgress.value = trailCurve.getUtoTmapping(dayToU(dayFloat), 0)
    fgMat.uniforms.uTime.value = state.clock.elapsedTime

    markers.current.forEach((m, i) => {
      if (!m) return
      const reached = THREE.MathUtils.smoothstep(dayFloat - i, -0.15, 0.1)
      const mat = m.material as THREE.MeshBasicMaterial
      tmp.copy(DIM).multiplyScalar(0.6).lerp(GOLD, reached).multiplyScalar(1 + reached * 2.2)
      mat.color.copy(tmp)
      m.scale.setScalar(1 + reached * 0.5)
    })
  })

  return (
    <group>
      <mesh geometry={bgGeo}>
        <meshBasicMaterial color="#FF8A00" transparent opacity={0.2} depthWrite={false} toneMapped={false} />
      </mesh>
      <mesh geometry={fgGeo} material={fgMat} />

      {waypoints.map((p, i) => (
        <group key={i} position={p}>
          <mesh position={[0, 3.2, 0]}>
            <cylinderGeometry args={[0.05, 0.05, 6.4, 6]} />
            <meshBasicMaterial color="#FF8A00" transparent opacity={0.25} depthWrite={false} toneMapped={false} />
          </mesh>
          <mesh
            ref={(el) => {
              markers.current[i] = el
            }}
            position={[0, 6.6, 0]}
          >
            <octahedronGeometry args={[0.7, 0]} />
            <meshBasicMaterial toneMapped={false} />
          </mesh>
        </group>
      ))}
    </group>
  )
}
