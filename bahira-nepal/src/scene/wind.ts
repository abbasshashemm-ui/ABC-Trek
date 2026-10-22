import * as THREE from 'three'

/**
 * One breeze for the whole valley: trees, prayer flags, smoke and the cloud shadows all read it,
 * so a gust visibly rolls up the valley through all of them. The clock is written once a frame
 * from `idleTime` (see `Wind`), so reduced motion freezes everything that sways.
 */
export const windClock = { value: 0 }

/** Daytime valley wind blows up the valley (-z), a little east. */
const DIR = new THREE.Vector2(0.3, -1).normalize()

/** GLSL: gust strength (0..1) and the cloud-shadow cover (0..1) at a world xz. */
export const windGLSL = /* glsl */ `
const vec2 WIND_DIR = vec2(${DIR.x.toFixed(4)}, ${DIR.y.toFixed(4)});

// Broad gust bands that roll up the valley at ~12 units/s, with a slower swell over the top.
float windGust(vec2 xz, float t) {
  float band = sin(dot(xz, WIND_DIR) * 0.085 - t * 1.05 + sin(xz.x * 0.05) * 1.5) * 0.5 + 0.5;
  float swell = sin(t * 0.21) * 0.25 + 0.75;
  return band * band * swell;
}

float cloudHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}
float cloudNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(cloudHash(i), cloudHash(i + vec2(1.0, 0.0)), u.x),
             mix(cloudHash(i + vec2(0.0, 1.0)), cloudHash(i + vec2(1.0, 1.0)), u.x), u.y);
}

// Fair-weather cumulus shadows, 20-40 units across, drifting up the valley at ~1.5 units/s.
// Returns how much of the direct sun they block.
float cloudShadow(vec2 xz, float t) {
  vec2 p = xz * 0.022 - WIND_DIR * t * 0.034;
  float n = cloudNoise(p) * 0.68 + cloudNoise(p * 2.4 + 7.3) * 0.32;
  return smoothstep(0.56, 0.74, n) * 0.58;
}
`

/** JS twin of `windGust`, for the props animated on the CPU (prayer flags, smoke). */
export function windGust(x: number, z: number, t: number) {
  const band = Math.sin((x * DIR.x + z * DIR.y) * 0.085 - t * 1.05 + Math.sin(x * 0.05) * 1.5) * 0.5 + 0.5
  return band * band * (Math.sin(t * 0.21) * 0.25 + 0.75)
}
export const WIND_DIR = DIR

/**
 * Lets clouds take the sun off a standard Lambert material: only the direct (sun) light is
 * dimmed, the sky light stays, exactly like the terrain. Call from `onBeforeCompile`.
 */
export function addCloudShade(shader: THREE.WebGLProgramParametersWithUniforms) {
  shader.uniforms.uWindTime = windClock
  shader.vertexShader = shader.vertexShader
    .replace('#include <common>', '#include <common>\nvarying vec2 vCloudXZ;')
    .replace(
      '#include <project_vertex>',
      `#include <project_vertex>
      vec4 cloudWorld = vec4(transformed, 1.0);
      #ifdef USE_INSTANCING
        cloudWorld = instanceMatrix * cloudWorld;
      #endif
      vCloudXZ = (modelMatrix * cloudWorld).xz;`,
    )
  shader.fragmentShader = shader.fragmentShader
    .replace('#include <common>', `#include <common>\nvarying vec2 vCloudXZ;\nuniform float uWindTime;\n${windGLSL}`)
    .replace(
      '#include <lights_fragment_end>',
      '#include <lights_fragment_end>\nreflectedLight.directDiffuse *= 1.0 - cloudShadow(vCloudXZ, uWindTime);',
    )
}

/**
 * Instanced trees that bend in the wind: the top moves most (height squared), each tree a little
 * out of step, and gusts roll through the canopy as a visible wave (leaves turn and catch the light).
 * `height` is the tree's local height, so the bend is the same in world units whatever the scale.
 */
export function windyFoliage(height: number) {
  const mat = new THREE.MeshLambertMaterial({ flatShading: true })
  mat.onBeforeCompile = (shader) => {
    addCloudShade(shader)
    shader.uniforms.uTreeHeight = { value: height }
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', `#include <common>\nuniform float uWindTime;\nuniform float uTreeHeight;\nvarying float vGust;\n${windGLSL}`)
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
        vGust = 0.0;
        #ifdef USE_INSTANCING
          vec3 root = instanceMatrix[3].xyz;
          float gust = windGust(root.xz, uWindTime);
          float own = sin(uWindTime * 2.1 + root.x * 0.9 + root.z * 0.6);
          // World-space lean at the tree top, then into the instance's local frame (yaw + scale).
          vec2 lean = WIND_DIR * (0.05 + gust * 0.24) * (0.75 + 0.25 * own)
                    + vec2(-WIND_DIR.y, WIND_DIR.x) * own * 0.035;
          vec3 local = transpose(mat3(instanceMatrix)) * vec3(lean.x, 0.0, lean.y);
          local /= dot(instanceMatrix[0].xyz, instanceMatrix[0].xyz);
          float k = clamp(transformed.y / uTreeHeight, 0.0, 1.0);
          transformed.xz += local.xz * k * k;
          vGust = gust * k;
        #endif`,
      )
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying float vGust;')
      // Leaves flip their paler undersides as a gust passes; the trunk (low k) stays put.
      .replace('#include <color_fragment>', '#include <color_fragment>\ndiffuseColor.rgb *= 1.0 + vGust * 0.22;')
  }
  return mat
}

/** Flat-shaded Lambert that clouds can shade (houses, landmarks). */
export function cloudShadedLambert(params: THREE.MeshLambertMaterialParameters = {}) {
  const mat = new THREE.MeshLambertMaterial({ flatShading: true, ...params })
  mat.onBeforeCompile = addCloudShade
  return mat
}
