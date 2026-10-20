import * as THREE from 'three'
import { smoothstep } from '../utils/terrainMath'

/** Mid-morning sun from the south-west: high enough for a bright, open valley, low enough that ridges still model. */
export const SUN_DIR = new THREE.Vector3(-0.7, 0.62, -0.3).normalize()

const lin = (r: number, g: number, b: number) => new THREE.Vector3(r ** 2.2, g ** 2.2, b ** 2.2)

/** Haze at the horizon; terrain fog fades into exactly this so the two meet seamlessly. */
export const HORIZON = lin(0.7, 0.83, 0.95)
export const ZENITH = lin(0.2, 0.47, 0.9)

/**
 * Terrain fog is `1 - exp(-density * depth^2)`. Three's FogExp2 is `1 - exp(-(d * depth)^2)`,
 * so props use sqrt(density) to fade identically. Eased down for the Act IV pull-up,
 * where close-range fog would swallow the whole overview.
 */
export const fogDensityAt = (dayFloat: number) =>
  THREE.MathUtils.lerp(0.000042, 0.0000014, smoothstep(11, 12.8, dayFloat))
