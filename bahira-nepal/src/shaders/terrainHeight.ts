/** GLSL twin of `src/utils/terrainMath.ts`. Keep both in lockstep. */
export const terrainHeightGLSL = /* glsl */ `
float valleyCenter(float z) {
  return sin(z * 0.04) * 12.0;
}

float heightScale(float z) {
  float t = -z;
  float hs = 0.35;
  hs = mix(hs, 0.12, smoothstep(30.0, 60.0, t));
  hs = mix(hs, 1.4, smoothstep(105.0, 135.0, t));
  return hs;
}

float getTerrainHeight(float x, float z) {
  float t = -z;
  float d = abs(x - valleyCenter(z));
  float hs = heightScale(z);

  float k = (t - 171.4) / 48.0;
  float rise = max(0.0, t - 171.4);
  float floorH = t < 171.4 ? 30.0 * exp(-(k * k)) : 30.0 + 0.0025 * rise * rise;

  float wall = 55.0 * (1.0 - exp(-pow(d / 30.0, 1.5)));
  float s =
    sin(x * 0.11 + z * 0.05) * 0.42 +
    sin(x * 0.067 - z * 0.123 + 2.3) * 0.26 +
    sin(x * 0.27 - z * 0.19 + 1.7) * 0.24 +
    sin(x * 0.61 + z * 0.47 + 0.4) * 0.08;
  float rn = min(1.0, sqrt(s * s + 0.03));
  float ridged = (1.0 - rn) * (1.0 - rn);
  float peaks = 27.0 * smoothstep(8.0, 45.0, d) * ridged;

  float ripple = 0.15 * sin(x * 0.8 + z * 0.5) * sin(z * 0.6 - x * 0.3);

  float kb = (t - 171.4) / 13.0;
  float shelf = exp(-(kb * kb)) * (1.0 - smoothstep(9.0, 22.0, d)) * 0.9;

  return floorH + hs * (wall + peaks) * (1.0 - shelf) + ripple;
}
`
