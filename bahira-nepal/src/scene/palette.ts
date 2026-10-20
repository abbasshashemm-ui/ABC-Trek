import * as THREE from 'three'
import { smoothstep } from '../utils/terrainMath'

/** Mid-morning sun from the south-west: high enough for a bright, open valley, low enough that ridges still model. */
export const SUN_DIR = new THREE.Vector3(-0.7, 0.62, -0.3).normalize()

const lin = (r: number, g: number, b: number) => new THREE.Vector3(r ** 2.2, g ** 2.2, b ** 2.2)

/** Haze at the horizon; terrain fog fades into exactly this so the two meet seamlessly. */
export const HORIZON = lin(0.74, 0.82, 0.88)
export const ZENITH = lin(0.27, 0.5, 0.8)

/**
 * Terrain fog is `1 - exp(-density * depth^2)`. Three's FogExp2 is `1 - exp(-(d * depth)^2)`,
 * so props use sqrt(density) to fade identically. Eased down for the Act IV pull-up,
 * where close-range fog would swallow the whole overview.
 */
export const fogDensityAt = (dayFloat: number) =>
  THREE.MathUtils.lerp(0.000042, 0.000005, smoothstep(11, 12.8, dayFloat))
