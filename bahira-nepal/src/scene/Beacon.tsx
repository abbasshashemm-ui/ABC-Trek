import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sparkles } from '@react-three/drei'
import * as THREE from 'three'
import { trailCurve, dayToU } from '../utils/journey'
import { scrollState } from '../state/scrollStore'

export default function Beacon() {
  const group = useRef<THREE.Group>(null)
  const halo = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    trailCurve.getPointAt(dayToU(scrollState.dayFloat), group.current!.position)
    group.current!.position.y += 1.2
    // Keep the beacon legible when the camera pulls back to the overview.
    const far = THREE.MathUtils.clamp(state.camera.position.distanceTo(group.current!.position) / 90, 1, 5)
    group.current!.scale.setScalar(far)
    const s = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.12
    halo.current!.scale.setScalar(s)
  })

  return (
    <group ref={group}>
      <mesh>
        <sphereGeometry args={[0.55, 24, 24]} />
        <meshBasicMaterial color={new THREE.Color(4, 2.6, 0.8)} toneMapped={false} />
      </mesh>
      <mesh ref={halo}>
        <sphereGeometry args={[1.4, 24, 24]} />
        <meshBasicMaterial
          color={new THREE.Color(1.6, 1.3, 0.8)}
          transparent
          opacity={0.18}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      <pointLight color="#FFD08A" intensity={60} distance={45} decay={2} />
      <Sparkles count={70} scale={[7, 7, 7]} size={7} speed={0.6} color="#FFC700" noise={0.6} />
    </group>
  )
}
