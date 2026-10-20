/**
 * Deterministic terrain height. This file and `src/shaders/terrainHeight.ts`
 * MUST stay formula-identical: the vertex shader displaces the mesh with the
 * GLSL twin, while the trail, beacon and camera sample this one.
 *
 * z runs 0 (Kathmandu) -> -171.4 (Annapurna Base Camp); the trip turns there and comes back
 * down the valley (see utils/journey.ts). Beyond base camp the floor keeps climbing into the range.
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

/** Per-act amplitude: I basin 0.35, II plains 0.12, III canyon and the range behind it 1.4. */
export function heightScale(z: number): number {
  const t = -z
  let hs = 0.35
  hs = mix(hs, 0.12, smoothstep(30, 60, t))
  hs = mix(hs, 1.4, smoothstep(105, 135, t))
  return hs
}

export function getTerrainHeight(x: number, z: number): number {
  const t = -z
  const d = Math.abs(x - valleyCenter(z))
  const hs = heightScale(z)

  // Valley floor climbs to Annapurna Base Camp (z ~ -171), then keeps rising into the range behind it
  // (quadratic, so the slope is continuous at the sanctuary).
  const k = (t - 171.4) / 48
  const rise = Math.max(0, t - 171.4)
  const floor = t < 171.4 ? 30 * Math.exp(-(k * k)) : 30 + 0.0025 * rise * rise

  // Saturating canyon wall + ridged peaks, both fading to zero on the centre line.
  const wall = 55 * (1 - Math.exp(-Math.pow(d / 30, 1.5)))
  // Four waves at unrelated angles (amplitudes sum to 1) so the ridges don't line up into an egg-crate.
  const s =
    Math.sin(x * 0.11 + z * 0.05) * 0.42 +
    Math.sin(x * 0.067 - z * 0.123 + 2.3) * 0.26 +
    Math.sin(x * 0.27 - z * 0.19 + 1.7) * 0.24 +
    Math.sin(x * 0.61 + z * 0.47 + 0.4) * 0.08
  // Smooth abs, rounded enough that crests read as weathered ridges rather than blades.
  const rn = Math.min(1, Math.sqrt(s * s + 0.03))
  const ridged = (1 - rn) * (1 - rn)
  const peaks = 27 * smoothstep(8, 45, d) * ridged

  const ripple = 0.15 * Math.sin(x * 0.8 + z * 0.5) * Math.sin(z * 0.6 - x * 0.3)

  // Flat amphitheatre floor at Annapurna Base Camp so the lodges have somewhere to stand.
  const kb = (t - 171.4) / 13
  const shelf = Math.exp(-(kb * kb)) * (1 - smoothstep(9, 22, d)) * 0.9

  return floor + hs * (wall + peaks) * (1 - shelf) + ripple
}
