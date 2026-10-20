import * as THREE from 'three'
import { smoothstep } from '../utils/terrainMath'

/** Low golden-hour sun from the west, shared by terrain lighting and the sky dome. */
export const SUN_DIR = new THREE.Vector3(-0.8, 0.42, -0.25).normalize()

const lin = (r: number, g: number, b: number) => new THREE.Vector3(r ** 2.2, g ** 2.2, b ** 2.2)

/** Haze at the horizon; terrain fog fades into exactly this so the two meet seamlessly. */
export const HORIZON = lin(0.42, 0.49, 0.54)
export const ZENITH = lin(0.1, 0.17, 0.27)

/**
 * Terrain fog is `1 - exp(-density * depth^2)`. Three's FogExp2 is `1 - exp(-(d * depth)^2)`,
 * so props use sqrt(density) to fade identically. Eased down for the Act IV pull-up,
 * where close-range fog would swallow the whole overview.
 */
export const fogDensityAt = (dayFloat: number) =>
  THREE.MathUtils.lerp(0.00006, 0.000005, smoothstep(11, 12.8, dayFloat))
