import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { skyVertex, skyFragment } from '../shaders/terrain'
import { HORIZON, ZENITH, SUN_DIR } from './palette'

export default function Sky() {
  const mesh = useRef<THREE.Mesh>(null)
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: skyVertex,
        fragmentShader: skyFragment,
        uniforms: {
          uHorizon: { value: HORIZON },
          uZenith: { value: ZENITH },
          uSunDir: { value: SUN_DIR },
        },
        side: THREE.BackSide,
        depthWrite: false,
      }),
    [],
  )

  // Follow the camera so the dome never clips at any zoom level.
  useFrame(({ camera }) => mesh.current!.position.copy(camera.position))

  return (
    <mesh ref={mesh} material={material} renderOrder={-1} frustumCulled={false}>
      <sphereGeometry args={[500, 32, 16]} />
    </mesh>
  )
}
