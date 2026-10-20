/**
 * Deterministic terrain height. This file and `src/shaders/terrainHeight.ts`
 * MUST stay formula-identical: the vertex shader displaces the mesh with the
 * GLSL twin, while the trail, beacon and camera sample this one.
 *
 * z runs 0 (Day 1) -> -300 (Day 15).
 */

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))

/** GLSL smoothstep(a, b, x); requires a < b. */
export const smoothstep = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a))
  return t * t * (3 - 2 * t)
}

const mix = (a: number, b: number, t: number) => a * (1 - t) + b * t

export const JOURNEY_LENGTH = 300

/** Centre line of the canyon the trail follows. */
export function valleyCenter(z: number): number {
  return Math.sin(z * 0.04) * 12
}

/** Per-act amplitude: I basin 0.35, II plains 0.12, III canyon 1.4, IV open horizon 0.55. */
export function heightScale(z: number): number {
  const t = -z
  let hs = 0.35
  hs = mix(hs, 0.12, smoothstep(30, 60, t))
  hs = mix(hs, 1.4, smoothstep(105, 135, t))
  hs = mix(hs, 0.55, smoothstep(225, 255, t))
  return hs
}

export function getTerrainHeight(x: number, z: number): number {
  const t = -z
  const d = Math.abs(x - valleyCenter(z))
  const hs = heightScale(z)

  // Valley floor climbs to a Gaussian crest at Annapurna Base Camp (z ~ -171).
  const k = (t - 171.4) / 48
  const floor = 30 * Math.exp(-(k * k))

  // Saturating canyon wall + ridged peaks, both fading to zero on the centre line.
  const wall = 55 * (1 - Math.exp(-Math.pow(d / 30, 1.5)))
  const s =
    Math.sin(x * 0.11 + z * 0.05) * 0.55 +
    Math.sin(x * 0.27 - z * 0.19 + 1.7) * 0.3 +
    Math.sin(x * 0.61 + z * 0.47 + 0.4) * 0.15
  // Smooth abs: a hard V crest is finer than the 1-unit mesh and renders as saw-teeth.
  const rn = Math.sqrt(s * s + 0.004)
  const ridged = (1 - rn) * (1 - rn)
  const peaks = 22 * smoothstep(8, 45, d) * ridged

  const ripple = 0.15 * Math.sin(x * 0.8 + z * 0.5) * Math.sin(z * 0.6 - x * 0.3)

  return floor + hs * (wall + peaks) + ripple
}
