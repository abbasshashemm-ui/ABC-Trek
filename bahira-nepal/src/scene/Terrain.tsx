import { useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { terrainVertex, terrainFragment } from '../shaders/terrain'
import { trailCurve, dayToU } from '../utils/journey'
import { scrollState } from '../state/scrollStore'
import { HORIZON, ZENITH, SUN_DIR, fogDensityAt } from './palette'
import { windClock } from './wind'

export default function Terrain() {
  const geometry = useMemo(() => {
    // x: -120..120, z: +40..-340. Displacement happens in the vertex shader.
    const g = new THREE.PlaneGeometry(240, 380, 240, 380)
    g.rotateX(-Math.PI / 2)
    g.translate(0, 0, -150)
    return g
  }, [])

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: terrainVertex,
        fragmentShader: terrainFragment,
        uniforms: {
          uActivePos: { value: new THREE.Vector3() },
          uFogColor: { value: HORIZON },
          uFogDensity: { value: 0.00006 },
          uSunDir: { value: SUN_DIR },
          uWindTime: windClock,
          uZenith: { value: ZENITH },
        },
      }),
    [],
  )

  useFrame(() => {
    material.uniforms.uFogDensity.value = fogDensityAt(scrollState.dayFloat)
    trailCurve.getPointAt(dayToU(scrollState.dayFloat), material.uniforms.uActivePos.value)
  })

  return <mesh geometry={geometry} material={material} frustumCulled={false} />
}
