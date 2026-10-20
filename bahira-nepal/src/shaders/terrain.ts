import { terrainHeightGLSL } from './terrainHeight'

export const terrainVertex = /* glsl */ `
${terrainHeightGLSL}

varying vec3 vWorldPos;
varying vec3 vNormal;
varying float vFogDepth;

void main() {
  vec3 p = position;
  float h = getTerrainHeight(p.x, p.z);
  p.y = h;

  // Height-field normal from forward differences of the same function.
  float e = 0.35;
  float hx = getTerrainHeight(p.x + e, p.z);
  float hz = getTerrainHeight(p.x, p.z + e);
  vNormal = normalize(vec3(h - hx, e, h - hz));

  vec4 world = modelMatrix * vec4(p, 1.0);
  vec4 mv = viewMatrix * world;

  vWorldPos = world.xyz;
  vFogDepth = -mv.z;
  gl_Position = projectionMatrix * mv;
}
`

// fwidth() is core in WebGL2 / GLSL ES 3.00, which three.js targets; the
// GL_OES_standard_derivatives pragma is WebGL1-only and not needed here.
// All palette values are authored in sRGB and converted with lin() so
// lighting and fog happen in linear space.
export const terrainFragment = /* glsl */ `
${terrainHeightGLSL}

uniform vec3 uActivePos;
uniform vec3 uFogColor;   // linear
uniform float uFogDensity;
uniform vec3 uSunDir;

varying vec3 vWorldPos;
varying vec3 vNormal;
varying float vFogDepth;

vec3 lin(vec3 c) { return pow(c, vec3(2.2)); }

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}
float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

void main() {
  // Per-fragment height keeps contours smooth on steep walls.
  float vElevation = getTerrainHeight(vWorldPos.x, vWorldPos.z);
  vec3 n = normalize(vNormal);
  float slope = 1.0 - n.y;

  float t = -vWorldPos.z;
  float d = abs(vWorldPos.x - valleyCenter(vWorldPos.z));

  // Noise coords skewed by height so steep walls don't stretch a top-down projection into streaks.
  vec2 q = vWorldPos.xz + vWorldPos.y * vec2(0.71, -0.53);
  float noise = vnoise(q * 0.12) * 0.65 + vnoise(q * 0.45) * 0.35;

  // Fine surface grain: perturb the normal with value-noise gradients so rock
  // and snow read as textured rather than as a smooth sheet.
  float b0 = vnoise(q * 0.7) + 0.5 * vnoise(q * 2.1);
  float bx = vnoise((q + vec2(0.2, 0.0)) * 0.7) + 0.5 * vnoise((q + vec2(0.2, 0.0)) * 2.1);
  float bz = vnoise((q + vec2(0.0, 0.2)) * 0.7) + 0.5 * vnoise((q + vec2(0.0, 0.2)) * 2.1);
  float grain = 0.45 + smoothstep(0.25, 0.6, slope) * 0.6;
  grain *= 1.0 - smoothstep(50.0, 140.0, vFogDepth); // noise aliases into streaks at distance
  n = normalize(n + vec3(b0 - bx, 0.0, b0 - bz) * grain);

  // --- Biomes ---------------------------------------------------------------
  vec3 terrace = lin(vec3(0.33, 0.56, 0.17));   // Kathmandu valley / Act IV
  vec3 jungle  = lin(vec3(0.13, 0.44, 0.13));   // Chitwan & Pokhara (Act II)
  vec3 meadow  = lin(vec3(0.44, 0.6, 0.24));   // alpine scrub
  vec3 moraine = lin(vec3(0.58, 0.53, 0.45));
  vec3 rock    = lin(vec3(0.46, 0.42, 0.38));
  vec3 snow    = lin(vec3(0.95, 0.97, 1.0));
  vec3 water   = lin(vec3(0.12, 0.42, 0.52));

  float lush = smoothstep(30.0, 60.0, t) * (1.0 - smoothstep(105.0, 135.0, t));
  vec3 lowland = mix(terrace, jungle, lush) * (0.8 + noise * 0.4);

  vec3 albedo = lowland;
  albedo = mix(albedo, meadow * (0.85 + noise * 0.3), smoothstep(13.0, 24.0, vElevation));
  albedo = mix(albedo, moraine, smoothstep(26.0, 34.0, vElevation));
  albedo = mix(albedo, rock * (0.8 + noise * 0.4), smoothstep(0.38, 0.62, slope));

  // Snow from ~41 up, clinging to all but the sheerest faces so the range reads as Himalayan.
  float snowline = 41.0 + (noise - 0.5) * 8.0;
  float snowAmt = smoothstep(snowline - 3.0, snowline + 3.0, vElevation) * (1.0 - smoothstep(0.7, 0.93, slope));
  albedo = mix(albedo, snow, snowAmt);

  // Phewa Lake around Day 5 (Pokhara)
  float lake = (1.0 - smoothstep(6.0, 9.0, d)) * smoothstep(76.0, 80.0, t) * (1.0 - smoothstep(94.0, 98.0, t));
  albedo = mix(albedo, water, lake);

  // --- Lighting: warm mid-morning sun + sky/ground hemisphere ---------------
  float diff = max(dot(n, uSunDir), 0.0);
  float hemi = n.y * 0.5 + 0.5;
  vec3 sunCol = lin(vec3(1.0, 0.95, 0.84)) * 1.6;
  vec3 skyAmb = lin(vec3(0.62, 0.74, 0.90)) * 0.62;
  vec3 gndAmb = lin(vec3(0.42, 0.36, 0.26)) * 0.4;
  vec3 col = albedo * (sunCol * diff + mix(gndAmb, skyAmb, hemi));
  col += water * lake * 0.6 * pow(max(n.y, 0.0), 8.0); // sky sheen on the lake

  // --- Subtle topographic overlay --------------------------------------------
  float contourFreq = 1.8;
  float scaledHeight = vElevation * contourFreq;
  float fw = max(fwidth(scaledHeight), 1e-4); // 0 on flat patches -> NaN, which bloom smears over the frame
  float line = abs(fract(scaledHeight - 0.5) - 0.5) / fw;
  float contourAlpha = 1.0 - smoothstep(0.0, 1.35, line);

  float majorScaled = vElevation * (contourFreq * 0.2);
  float fwMajor = max(fwidth(majorScaled), 1e-4);
  float majorLine = abs(fract(majorScaled - 0.5) - 0.5) / fwMajor;
  float majorAlpha = 1.0 - smoothstep(0.0, 1.6, majorLine);

  contourAlpha *= 1.0 - smoothstep(0.55, 1.1, fw);
  majorAlpha *= 1.0 - smoothstep(0.55, 1.1, fwMajor);
  float ink = (contourAlpha * 0.1 + majorAlpha * 0.2) * (1.0 - lake);

  // Contours are faint shade lines; around the trekkers they lift to a sunlit tone (no orange glow).
  float distToTrail = length(vWorldPos.xz - uActivePos.xz);
  float near = exp(-distToTrail * 0.15);
  col = mix(col, mix(col * 0.62, col * 1.3, near), clamp(ink, 0.0, 1.0));

  // --- Aerial perspective -----------------------------------------------------
  float fogFactor = 1.0 - exp(-uFogDensity * vFogDepth * vFogDepth);
  // Dissolve the mesh borders into the haze so the sky never shows a hard edge.
  float edge = max(smoothstep(85.0, 118.0, abs(vWorldPos.x)),
                   max(smoothstep(15.0, 38.0, vWorldPos.z), smoothstep(305.0, 335.0, t)));
  col = mix(col, uFogColor, clamp(max(fogFactor, edge), 0.0, 1.0));

  gl_FragColor = vec4(max(col, vec3(0.0)), 1.0);
}
`

export const skyVertex = /* glsl */ `
varying vec3 vDir;
void main() {
  vDir = normalize(position);
  vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  gl_Position = p.xyww; // pin to the far plane
}
`

export const skyFragment = /* glsl */ `
uniform vec3 uHorizon; // linear
uniform vec3 uZenith;  // linear
uniform vec3 uSunDir;
varying vec3 vDir;
void main() {
  vec3 dir = normalize(vDir);
  float y = max(dir.y, 0.0);
  vec3 col = mix(uHorizon, uZenith, pow(y, 0.55));
  float s = max(dot(dir, uSunDir), 0.0);
  col += vec3(1.0, 0.86, 0.62) * (pow(s, 5.0) * 0.22 + pow(s, 220.0) * 1.4);
  gl_FragColor = vec4(col, 1.0);
}
`
