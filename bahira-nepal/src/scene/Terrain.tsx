import { useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { terrainVertex, terrainFragment } from '../shaders/terrain'
import { trailCurve, dayToU } from '../utils/journey'
import { scrollState } from '../state/scrollStore'
import { smoothstep } from '../utils/terrainMath'

export const FOG_COLOR = '#05070B'

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
          // sRGB components of #05070B; the shader linearises on output.
          uFogColor: { value: new THREE.Vector3(5 / 255, 7 / 255, 11 / 255) },
          uFogDensity: { value: 0.00012 },
        },
      }),
    [],
  )

  useFrame(() => {
    // Act IV pull-up: the close-range fog would swallow the whole overview.
    const over = smoothstep(11, 12.8, scrollState.dayFloat)
    material.uniforms.uFogDensity.value = THREE.MathUtils.lerp(0.00012, 0.000005, over)
    trailCurve.getPointAt(dayToU(scrollState.dayFloat), material.uniforms.uActivePos.value)
  })

  return <mesh geometry={geometry} material={material} frustumCulled={false} />
}
