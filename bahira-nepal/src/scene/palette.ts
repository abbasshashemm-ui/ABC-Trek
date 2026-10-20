import * as THREE from 'three'

/** Low golden-hour sun from the west, shared by terrain lighting and the sky dome. */
export const SUN_DIR = new THREE.Vector3(-0.8, 0.42, -0.25).normalize()

const lin = (r: number, g: number, b: number) => new THREE.Vector3(r ** 2.2, g ** 2.2, b ** 2.2)

/** Haze at the horizon; terrain fog fades into exactly this so the two meet seamlessly. */
export const HORIZON = lin(0.42, 0.49, 0.54)
export const ZENITH = lin(0.1, 0.17, 0.27)
