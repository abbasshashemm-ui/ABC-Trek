import * as THREE from 'three'
import { terrainHeightGLSL } from '../../shaders/terrainHeight'
import { SUN_DIR } from '../palette'
import { windClock, windGLSL } from '../wind'
import { COARSE } from '../device'

/**
 * Ground shadows for the props. Real shadow maps would draw every prop a second time (the terrain
 * is a custom shader and props are thousands of instances), so each caster gets a soft ellipse
 * instead, stretched away from the sun by its height and draped over the terrain in the vertex
 * shader. All casters of a kind share one instanced mesh: one draw call. They darken the ground by
 * multiplying it, fade where a cloud has already taken the sun, and fade into the haze.
 */

/** Horizontal direction shadows fall in, and how far per unit of caster height. */
const sunFlat = new THREE.Vector2(-SUN_DIR.x, -SUN_DIR.z)
const REACH = sunFlat.length() / SUN_DIR.y
sunFlat.normalize()
const YAW = Math.atan2(-sunFlat.y, sunFlat.x)

export interface Caster {
  x: number
  z: number
  /** footprint radius */
  r: number
  /** height above the ground */
  h: number
  /** 0..1 darkness at the core */
  k?: number
}

// Phones drape a coarser grid (9 vertices per shadow instead of 25).
const SEGMENTS = COARSE ? 2 : 4
export const blobGeometry = new THREE.PlaneGeometry(1, 1, SEGMENTS, SEGMENTS).rotateX(-Math.PI / 2)

const vertex = /* glsl */ `
${terrainHeightGLSL}
varying vec2 vUv;
varying float vFade;
varying float vStrength;
varying float vSplit;
uniform float uFogDensity;
uniform float uWindTime;
${windGLSL}

void main() {
  vUv = uv;
  vec4 world = modelMatrix * instanceMatrix * vec4(position, 1.0);
  world.y = getTerrainHeight(world.x, world.z) + 0.07;
  vec4 mv = viewMatrix * world;
  gl_Position = projectionMatrix * mv;
  float fog = 1.0 - exp(-uFogDensity * mv.z * mv.z);
  // No sun, no cast shadow: under a cloud only a faint contact shade stays.
  vFade = (1.0 - fog) * (1.0 - cloudShadow(world.xz, uWindTime) * 1.2);
  vStrength = instanceColor.r;
  vSplit = instanceColor.g;
}
`

const fragment = /* glsl */ `
varying vec2 vUv;
varying float vFade;
varying float vStrength;
varying float vSplit;
void main() {
  // The caster stands at u = vSplit: darkest there, softening toward the tip of the shadow.
  vec2 q = vec2((vUv.x - vSplit) / (vUv.x < vSplit ? vSplit : 1.0 - vSplit), vUv.y * 2.0 - 1.0);
  float a = 1.0 - smoothstep(0.25, 1.0, length(q));
  a *= vStrength * vFade;
  // Multiplied over the ground: the sun's share goes, the cool sky light stays.
  gl_FragColor = vec4(mix(vec3(1.0), vec3(0.42, 0.48, 0.62), a), 1.0);
}
`

export function blobMaterial() {
  return new THREE.ShaderMaterial({
    vertexShader: vertex,
    fragmentShader: fragment,
    uniforms: { uFogDensity: { value: 0 }, uWindTime: windClock },
    transparent: true,
    depthWrite: false,
    blending: THREE.CustomBlending,
    blendEquation: THREE.AddEquation,
    blendSrc: THREE.ZeroFactor,
    blendDst: THREE.SrcColorFactor,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -2,
  })
}

const tmp = { m: new THREE.Matrix4(), q: new THREE.Quaternion(), p: new THREE.Vector3(), s: new THREE.Vector3(), up: new THREE.Vector3(0, 1, 0), c: new THREE.Color() }
tmp.q.setFromAxisAngle(tmp.up, YAW)

/** Writes one caster's shadow into an instanced blob mesh. */
export function setBlob(mesh: THREE.InstancedMesh, i: number, c: Caster, withColor = true) {
  // From just behind the caster's base out to where its top's shadow lands.
  const len = c.r * 2 + c.h * REACH * 0.85
  const centre = len * 0.5 - c.r // the plane spans -0.5..0.5 of its length; the caster is `r` in
  tmp.p.set(c.x + sunFlat.x * centre, 0, c.z + sunFlat.y * centre)
  tmp.s.set(len, 1, c.r * 2.2)
  mesh.setMatrixAt(i, tmp.m.compose(tmp.p, tmp.q, tmp.s))
  // Colour carries data: r = darkness, g = where along the shadow the caster stands.
  if (withColor) mesh.setColorAt(i, tmp.c.setRGB(c.k ?? 0.55, c.r / len, 0))
}
