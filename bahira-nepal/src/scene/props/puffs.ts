import * as THREE from 'three'
import { scrollState } from '../../state/scrollStore'
import { fogDensityAt } from '../palette'

/** A unit quad; `puffMaterial` turns it to face the camera. */
export const puffGeometry = new THREE.PlaneGeometry(2, 2)

/**
 * Soft round puffs (smoke, cloud) that always face the camera. The instance matrix gives the centre
 * and the size (x and y scale), instance colour r the opacity. Shaded from `bottom` to `top`
 * (linear RGB) like a sunlit puff, and faded into the haze like the terrain.
 */
export function puffMaterial(bottom: [number, number, number], top: [number, number, number]) {
  const mat = new THREE.ShaderMaterial({
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      varying float vAlpha;
      uniform float uFogDensity;
      void main() {
        vUv = uv;
        vec3 centre = (modelMatrix * instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
        vec2 size = vec2(length(instanceMatrix[0].xyz), length(instanceMatrix[1].xyz));
        vec3 right = vec3(viewMatrix[0][0], viewMatrix[1][0], viewMatrix[2][0]);
        vec3 up = vec3(viewMatrix[0][1], viewMatrix[1][1], viewMatrix[2][1]);
        vec4 mv = viewMatrix * vec4(centre + right * position.x * size.x + up * position.y * size.y, 1.0);
        gl_Position = projectionMatrix * mv;
        vAlpha = instanceColor.r * exp(-uFogDensity * mv.z * mv.z);
      }
    `,
    fragmentShader: /* glsl */ `
      varying vec2 vUv;
      varying float vAlpha;
      uniform vec3 uBottom;
      uniform vec3 uTop;
      void main() {
        float a = 1.0 - smoothstep(0.15, 1.0, length(vUv * 2.0 - 1.0));
        gl_FragColor = vec4(mix(uBottom, uTop, smoothstep(0.2, 0.9, vUv.y)), a * vAlpha);
      }
    `,
    uniforms: {
      uFogDensity: { value: 0 },
      uBottom: { value: new THREE.Vector3(...bottom) },
      uTop: { value: new THREE.Vector3(...top) },
    },
    transparent: true,
    depthWrite: false,
  })
  mat.onBeforeRender = () => {
    mat.uniforms.uFogDensity.value = fogDensityAt(scrollState.dayFloat)
  }
  return mat
}
