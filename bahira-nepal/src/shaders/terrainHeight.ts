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
  hs = mix(hs, 0.55, smoothstep(225.0, 255.0, t));
  return hs;
}

float getTerrainHeight(float x, float z) {
  float t = -z;
  float d = abs(x - valleyCenter(z));
  float hs = heightScale(z);

  float k = (t - 171.4) / 48.0;
  float floorH = 30.0 * exp(-(k * k));

  float wall = 55.0 * (1.0 - exp(-pow(d / 30.0, 1.5)));
  float rn = abs(
    sin(x * 0.11 + z * 0.05) * 0.55 +
    sin(x * 0.27 - z * 0.19 + 1.7) * 0.3 +
    sin(x * 0.61 + z * 0.47 + 0.4) * 0.15
  );
  float ridged = (1.0 - rn) * (1.0 - rn);
  float peaks = 22.0 * smoothstep(8.0, 45.0, d) * ridged;

  float ripple = 0.15 * sin(x * 0.8 + z * 0.5) * sin(z * 0.6 - x * 0.3);

  return floorH + hs * (wall + peaks) + ripple;
}
`
