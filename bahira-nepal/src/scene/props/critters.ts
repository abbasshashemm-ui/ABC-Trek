import * as THREE from 'three'
import { merge } from './placement'
import { addCloudShade } from '../wind'

/**
 * Low-poly animals and people, front facing +z, standing on y = 0. Each part bakes three
 * attributes so one instanced mesh per species can still vary and move:
 * `color` (flat colour), `aTint` (1 = takes the instance colour, e.g. a cow's coat or a shirt;
 * 0 = keeps its own, e.g. horns and skin) and `aSway` (how far the vertex follows the idle
 * head/trunk motion in `herdMaterial`).
 */
function part(geo: THREE.BufferGeometry, color: string, o: { tint?: boolean; sway?: number } = {}) {
  const g = geo.index ? geo.toNonIndexed() : geo
  const n = g.getAttribute('position').count
  const c = new THREE.Color(color)
  g.setAttribute('color', new THREE.Float32BufferAttribute(Array.from({ length: n * 3 }, (_, k) => [c.r, c.g, c.b][k % 3]), 3))
  g.setAttribute('aTint', new THREE.Float32BufferAttribute(new Array(n).fill(o.tint ? 1 : 0), 1))
  g.setAttribute('aSway', new THREE.Float32BufferAttribute(new Array(n).fill(o.sway ?? 0), 1))
  return g
}

/** Smooth-shaded ellipsoid: radial normals even at detail 0, where three would bake flat face normals. */
function blob(r: [number, number, number], at: [number, number, number], detail = 1) {
  const g = new THREE.IcosahedronGeometry(1, detail)
  g.setAttribute('normal', g.getAttribute('position').clone())
  return g.scale(...r).translate(...at)
}
const leg = (r: number, h: number, x: number, z: number) => new THREE.CylinderGeometry(r, r * 0.85, h, 5).translate(x, h / 2, z)
const legs = (r: number, h: number, x: number, z: number, color: string, tint = false) =>
  [[-x, -z], [x, -z], [-x, z], [x, z]].map(([lx, lz]) => part(leg(r, h, lx, lz), color, { tint }))
const horn = (len: number, r: number, at: [number, number, number], tiltZ: number, tiltX = 0) =>
  new THREE.ConeGeometry(r, len, 4).rotateX(tiltX).rotateZ(tiltZ).translate(...at)

const SKIN = '#b98463'
const IVORY = '#efe6d2'
const HOOF = '#3a2f28'

/** Asian elephant. The saddle cloth is tinted: red for the ride elephants, body grey for the others. */
export const elephant = merge([
  part(blob([0.62, 0.6, 0.92], [0, 1.15, 0]), '#8a8580'),
  ...legs(0.21, 0.72, 0.32, 0.48, '#7e7975'),
  part(blob([0.42, 0.46, 0.42], [0, 1.35, 0.92]), '#8a8580', { sway: 0.2 }),
  part(new THREE.BoxGeometry(0.07, 0.58, 0.46).rotateY(0.45).translate(0.42, 1.35, 0.78), '#837e79', { sway: 0.3 }),
  part(new THREE.BoxGeometry(0.07, 0.58, 0.46).rotateY(-0.45).translate(-0.42, 1.35, 0.78), '#837e79', { sway: 0.3 }),
  part(new THREE.CylinderGeometry(0.08, 0.14, 0.95, 6).rotateX(-0.2).translate(0, 0.78, 1.26), '#837e79', { sway: 1 }),
  part(horn(0.34, 0.045, [0.17, 0.98, 1.24], 0, 1.9), IVORY, { sway: 0.4 }),
  part(horn(0.34, 0.045, [-0.17, 0.98, 1.24], 0, 1.9), IVORY, { sway: 0.4 }),
  part(new THREE.CylinderGeometry(0.02, 0.03, 0.6, 3).rotateX(0.3).translate(0, 1.05, -0.98), '#6f6a66'),
  // Draped over the back: an open half-cylinder hugging the body.
  part(new THREE.CylinderGeometry(1, 1, 0.75, 9, 1, true, -1.0, 2.0).rotateX(-Math.PI / 2).scale(0.65, 0.63, 1).translate(0, 1.15, -0.05), '#ffffff', { tint: true }),
])

/** Greater one-horned rhino, Chitwan's own. */
export const rhino = merge([
  part(blob([0.42, 0.38, 0.72], [0, 0.72, 0]), '#7a726b'),
  ...legs(0.12, 0.45, 0.24, 0.4, '#6c655f'),
  part(blob([0.24, 0.24, 0.36], [0, 0.66, 0.78]), '#7a726b', { sway: 0.6 }),
  part(horn(0.28, 0.07, [0, 0.9, 1.0], 0, 0.35), '#5a524b', { sway: 0.7 }),
  part(horn(0.12, 0.05, [0.13, 0.94, 0.62], -0.4), '#6c655f', { sway: 0.5 }),
  part(horn(0.12, 0.05, [-0.13, 0.94, 0.62], 0.4), '#6c655f', { sway: 0.5 }),
])

/** Chital (spotted deer). Coat is tinted so the herd isn't one flat brown. */
export const deer = merge([
  part(blob([0.2, 0.21, 0.4], [0, 0.66, 0]), '#ffffff', { tint: true }),
  ...legs(0.045, 0.5, 0.11, 0.25, '#6b4a2c'),
  part(new THREE.CylinderGeometry(0.06, 0.09, 0.36, 5).rotateX(0.6).translate(0, 0.88, 0.36), '#ffffff', { tint: true, sway: 0.5 }),
  part(blob([0.08, 0.08, 0.16], [0, 1.03, 0.49], 0), '#ffffff', { tint: true, sway: 1 }),
  part(horn(0.26, 0.015, [0.05, 1.22, 0.46], -0.35), '#d9c9a8', { sway: 1 }),
  part(horn(0.26, 0.015, [-0.05, 1.22, 0.46], 0.35), '#d9c9a8', { sway: 1 }),
])

/** Zebu cow with the shoulder hump; coat tinted per animal. */
export const cow = merge([
  part(blob([0.26, 0.27, 0.52], [0, 0.78, 0]), '#ffffff', { tint: true }),
  part(blob([0.13, 0.12, 0.12], [0, 1.03, 0.28], 0), '#ffffff', { tint: true }),
  ...legs(0.06, 0.55, 0.15, 0.32, '#ffffff', true),
  part(blob([0.13, 0.14, 0.22], [0, 0.8, 0.62]), '#ffffff', { tint: true, sway: 1 }),
  part(horn(0.18, 0.03, [0.09, 0.98, 0.58], -0.6), IVORY, { sway: 1 }),
  part(horn(0.18, 0.03, [-0.09, 0.98, 0.58], 0.6), IVORY, { sway: 1 }),
])

/** Hill goat. */
export const goat = merge([
  part(blob([0.15, 0.16, 0.28], [0, 0.5, 0]), '#ffffff', { tint: true }),
  ...legs(0.035, 0.36, 0.08, 0.17, HOOF),
  part(blob([0.08, 0.09, 0.13], [0, 0.6, 0.33], 0), '#ffffff', { tint: true, sway: 1 }),
  part(horn(0.16, 0.025, [0.04, 0.74, 0.27], -0.2, -0.6), '#4b4038', { sway: 1 }),
  part(horn(0.16, 0.025, [-0.04, 0.74, 0.27], 0.2, -0.6), '#4b4038', { sway: 1 }),
])

/** Yak: shaggy skirt down to the hooves, pale horns. */
export const yak = merge([
  part(blob([0.36, 0.38, 0.62], [0, 0.82, 0]), '#ffffff', { tint: true }),
  part(new THREE.CylinderGeometry(0.34, 0.42, 0.45, 7).scale(1, 1, 1.5).translate(0, 0.45, 0), '#ffffff', { tint: true }),
  ...legs(0.07, 0.3, 0.2, 0.36, HOOF),
  part(blob([0.17, 0.18, 0.24], [0, 0.78, 0.66]), '#ffffff', { tint: true, sway: 1 }),
  part(horn(0.28, 0.035, [0.17, 0.98, 0.64], -1.0), IVORY, { sway: 1 }),
  part(horn(0.28, 0.035, [-0.17, 0.98, 0.64], 1.0), IVORY, { sway: 1 }),
])

/** Pack mule with a load each side; the loads are tinted. */
export const mule = merge([
  part(blob([0.2, 0.24, 0.48], [0, 0.85, 0]), '#6e5442'),
  ...legs(0.045, 0.62, 0.11, 0.3, '#5a4434'),
  part(new THREE.CylinderGeometry(0.07, 0.1, 0.42, 5).rotateX(0.7).translate(0, 1.1, 0.46), '#6e5442', { sway: 0.5 }),
  part(blob([0.08, 0.1, 0.2], [0, 1.24, 0.66], 0), '#6e5442', { sway: 1 }),
  part(horn(0.14, 0.03, [0.05, 1.38, 0.6], -0.2), '#6e5442', { sway: 1 }),
  part(horn(0.14, 0.03, [-0.05, 1.38, 0.6], 0.2), '#6e5442', { sway: 1 }),
  part(new THREE.BoxGeometry(0.16, 0.3, 0.42).translate(0.27, 0.95, 0), '#ffffff', { tint: true }),
  part(new THREE.BoxGeometry(0.16, 0.3, 0.42).translate(-0.27, 0.95, 0), '#ffffff', { tint: true }),
])

/** Villager in a tinted shirt or kurta; the top half sways a little. */
export const villager = merge([
  part(new THREE.CylinderGeometry(0.06, 0.06, 0.5, 5).translate(-0.08, 0.25, 0), '#33302d'),
  part(new THREE.CylinderGeometry(0.06, 0.06, 0.5, 5).translate(0.08, 0.25, 0), '#33302d'),
  part(new THREE.CylinderGeometry(0.17, 0.22, 0.6, 7).translate(0, 0.8, 0), '#ffffff', { tint: true, sway: 0.3 }),
  part(blob([0.13, 0.14, 0.13], [0, 1.24, 0], 1), SKIN, { sway: 0.5 }),
  part(new THREE.CylinderGeometry(0.11, 0.13, 0.1, 7).translate(0, 1.37, 0), '#2b2622', { sway: 0.5 }),
])

/** Porter bent under a doko (cone basket) carried from a strap on the forehead. */
export const porter = merge([
  part(new THREE.CylinderGeometry(0.06, 0.06, 0.5, 5).translate(-0.08, 0.25, 0), '#33302d'),
  part(new THREE.CylinderGeometry(0.06, 0.06, 0.5, 5).translate(0.08, 0.25, 0), '#33302d'),
  part(new THREE.CylinderGeometry(0.17, 0.2, 0.58, 7).rotateX(0.35).translate(0, 0.78, 0.08), '#ffffff', { tint: true }),
  part(blob([0.13, 0.14, 0.13], [0, 1.16, 0.27], 1), SKIN),
  part(new THREE.CylinderGeometry(0.3, 0.12, 0.7, 7).rotateX(0.35).translate(0, 1.0, -0.26), '#a0783f'),
  part(new THREE.CylinderGeometry(0.27, 0.27, 0.12, 7).rotateX(0.35).translate(0, 1.35, -0.13), '#ffffff', { tint: true }),
])

/** Shared clock for every herd material; Wildlife writes it once a frame from `idleTime`. */
export const herdClock = { value: 0 }

/**
 * Smooth-shaded Lambert that honours `aTint` and moves `aSway` vertices: the head dips to graze
 * (`dip`) and swings side to side (`swing`); standing animals slowly shift round (`turn`, radians). Each animal's phase comes from its position, so
 * no per-frame matrix uploads are needed for the ones that stand still.
 */
export function herdMaterial({ dip = 0, swing = 0, rate = 0.6, turn = 0 }: { dip?: number; swing?: number; rate?: number; turn?: number }) {
  const mat = new THREE.MeshLambertMaterial({ vertexColors: true })
  mat.onBeforeCompile = (shader) => {
    addCloudShade(shader)
    shader.uniforms.uTime = herdClock
    shader.uniforms.uTurn = { value: turn }
    shader.uniforms.uDip = { value: dip }
    shader.uniforms.uSwing = { value: swing }
    shader.uniforms.uRate = { value: rate }
    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        '#include <common>\nattribute float aTint;\nattribute float aSway;\nuniform float uTime, uDip, uSwing, uRate, uTurn;',
      )
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
        float ph = 0.0;
        #ifdef USE_INSTANCING
          ph = instanceMatrix[3].x * 1.7 + instanceMatrix[3].z * 2.3;
        #endif
        // Graze: hold the head down most of the cycle, look up now and then.
        float down = smoothstep(-0.4, 0.3, sin(uTime * uRate + ph));
        transformed.y -= aSway * uDip * down;
        transformed.z += aSway * uDip * down * 0.4;
        transformed.x += aSway * uSwing * sin(uTime * uRate * 2.3 + ph * 1.3);
        // Shift their stance now and then: the whole body slowly turns a little and back.
        float yaw = uTurn * sin(uTime * uRate * 0.37 + ph * 0.7) * sin(uTime * 0.11 + ph);
        transformed.xz = mat2(cos(yaw), -sin(yaw), sin(yaw), cos(yaw)) * transformed.xz;`,
      )
      .replace(
        '#include <color_vertex>',
        `#include <color_vertex>
        #ifdef USE_INSTANCING_COLOR
          vColor.xyz = color.xyz * mix(vec3(1.0), instanceColor.xyz, aTint);
        #endif`,
      )
  }
  return mat
}
