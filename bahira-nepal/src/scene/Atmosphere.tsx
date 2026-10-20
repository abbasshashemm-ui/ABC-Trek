import { useEffect, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { scrollState } from '../state/scrollStore'
import { HORIZON, SUN_DIR, fogDensityAt } from './palette'

const linear = (r: number, g: number, b: number) => new THREE.Color().setRGB(r ** 2.2, g ** 2.2, b ** 2.2)

/**
 * Lights + fog for the standard-material props, tuned to match the terrain shader:
 * three's Lambert divides by PI, hence the PI factors on the shader's intensities.
 */
export default function Atmosphere() {
  const scene = useThree((s) => s.scene)
  const fog = useMemo(() => new THREE.FogExp2(new THREE.Color().setRGB(HORIZON.x, HORIZON.y, HORIZON.z), 0), [])

  useEffect(() => {
    scene.fog = fog
    return () => {
      scene.fog = null
    }
  }, [scene, fog])

  useFrame(() => {
    fog.density = Math.sqrt(fogDensityAt(scrollState.dayFloat))
  })

  const sunPos = useMemo(() => SUN_DIR.clone().multiplyScalar(200), [])

  return (
    <>
      <directionalLight position={sunPos} color={linear(1, 0.88, 0.7)} intensity={1.25 * Math.PI} />
      <hemisphereLight args={[linear(0.55, 0.66, 0.8), linear(0.3, 0.26, 0.2), 0.5 * Math.PI]} />
    </>
  )
}
