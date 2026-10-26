import { terrainHeightGLSL } from './terrainHeight'
import { windGLSL } from '../scene/wind'

/** Forward-scattered sunlight in the air; the sky dome and the terrain haze share it so they match. */
const sunGlowGLSL = /* glsl */ `
vec3 sunGlow(float s) {
  return vec3(1.0, 0.86, 0.62) * pow(s, 5.0) * 0.22;
}
`

export const terrainVertex = /* glsl */ `
${terrainHeightGLSL}

uniform vec3 uSunDir;

varying vec3 vWorldPos;
varying vec3 vNormal;
varying float vFogDepth;
varying float vSun;
varying float vAO;

// Ridges cast shadows: march the height field toward the sun and keep the closest miss,
// so the edge softens with distance like a real penumbra. Per vertex (1 unit grid), not per pixel,
// which keeps it cheap on phones. The march stops at ~20 units: local ridges and gullies shade,
// but the big walls never put whole valleys (or the base-camp basin) in shadow.
float sunVisibility(vec3 p) {
  float vis = 1.0;
  float dist = 1.2;
  for (int i = 0; i < 7; i++) {
    vec3 s = p + uSunDir * dist;
    float clearance = s.y - getTerrainHeight(s.x, s.z);
    vis = min(vis, clamp(clearance / (0.6 + dist * 0.15), 0.0, 1.0));
    dist *= 1.6;
  }
  return vis;
}

// Cavity occlusion: how far the ground around sits above this point. Zero on straight slopes,
// darkens gullies and the valley floor under the walls.
float cavity(float x, float z, float h, float r) {
  return (getTerrainHeight(x + r, z) + getTerrainHeight(x - r, z) +
          getTerrainHeight(x, z + r) + getTerrainHeight(x, z - r)) * 0.25 - h;
}

void main() {
  vec3 p = position;
  float h = getTerrainHeight(p.x, p.z);
  p.y = h;

  // Height-field normal from forward differences of the same function.
  float e = 0.35;
  float hx = getTerrainHeight(p.x + e, p.z);
  float hz = getTerrainHeight(p.x, p.z + e);
  vNormal = normalize(vec3(h - hx, e, h - hz));

  vSun = sunVisibility(vec3(p.x, h + 0.25, p.z));
  vAO = clamp(1.0 - max(cavity(p.x, p.z, h, 3.5), 0.0) * 0.1, 0.55, 1.0);

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
uniform float uWindTime;
uniform vec3 uZenith;   // linear

varying vec3 vWorldPos;
varying vec3 vNormal;
varying float vFogDepth;
varying float vSun;
varying float vAO;

vec3 lin(vec3 c) { return pow(c, vec3(2.2)); }
${sunGlowGLSL}
${windGLSL}

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

// Value noise with its analytic gradient (xy = d/dx, d/dy): one lookup instead of three finite differences.
vec3 vnoised(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  vec2 du = 6.0 * f * (1.0 - f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  float k = a - b - c + d;
  return vec3(a + (b - a) * u.x + (c - a) * u.y + k * u.x * u.y,
              du * (vec2(b - a, c - a) + k * u.yx));
}

// x: colour noise, yz: grain slope for perturbing the normal (two octaves).
vec3 surface(vec2 q) {
  float noise = vnoise(q * 0.12) * 0.65 + vnoise(q * 0.45) * 0.35;
  vec2 g = vnoised(q * 0.7).yz * 0.14 + vnoised(q * 2.1).yz * 0.12;
  return vec3(noise, -g);
}

// Grass is never one green: fresh, dark and sun-dried greens mixed by broad and mid-scale
// patches, then a fine tuft speckle with bits of earth showing through up close (faded out
// with distance before it aliases). lushK: 0 = open pasture, 1 = Chitwan/Pokhara jungle floor.
vec3 grass(vec2 xz, float lushK, float dist) {
  vec3 fresh = mix(lin(vec3(0.37, 0.47, 0.2)), lin(vec3(0.22, 0.38, 0.14)), lushK);
  vec3 dark = lin(vec3(0.2, 0.3, 0.13));
  vec3 dry = lin(vec3(0.53, 0.51, 0.31));
  float broad = vnoise(xz * 0.035 + 3.1);
  float mid = vnoise(xz * 0.17 + 7.7) * 0.7 + vnoise(xz * 0.5 + 1.3) * 0.3;
  vec3 c = mix(fresh, dark, smoothstep(0.4, 0.8, mid) * 0.65);
  c = mix(c, dry, smoothstep(0.45, 0.85, broad) * 0.6 * (1.0 - lushK * 0.6));
  float fade = 1.0 - smoothstep(25.0, 80.0, dist);
  float fine = vnoise(xz * 2.3) * 0.6 + vnoise(xz * 6.1) * 0.4;
  c *= 1.0 + (fine - 0.5) * 0.4 * fade;
  c = mix(c, lin(vec3(0.43, 0.37, 0.27)), smoothstep(0.8, 0.95, fine) * 0.3 * fade);
  return c;
}

void main() {
  // Per-fragment height keeps contours smooth on steep walls.
  float vElevation = getTerrainHeight(vWorldPos.x, vWorldPos.z);
  vec3 n = normalize(vNormal);
  float slope = 1.0 - n.y;

  float t = -vWorldPos.z;
  float d = abs(vWorldPos.x - valleyCenter(vWorldPos.z));

  // Surface noise, projected top-down on gentle ground and onto the valley walls (z against height)
  // on steep ground, so walls don't stretch a top-down projection into streaks. The walls face
  // across the valley (+-x) almost everywhere, so one fixed side plane is enough; a plane that
  // turned with the normal warped the noise into marbling. The two are blended by value and
  // each is only evaluated where its weight is non-zero.
  float wSide = smoothstep(0.4, 0.6, slope);
  vec2 side = vec2(vWorldPos.z, vWorldPos.y * 1.3);
  vec3 surf = vec3(0.0); // x: colour noise, yz: grain gradient
  if (wSide < 0.999) surf += surface(vWorldPos.xz) * (1.0 - wSide);
  if (wSide > 0.001) surf += surface(side) * wSide;
  float noise = surf.x;

  // Fine surface grain: perturb the normal with value-noise gradients so rock
  // and snow read as textured rather than as a smooth sheet.
  float grain = 0.45 + smoothstep(0.25, 0.6, slope) * 0.6;
  grain *= 1.0 - smoothstep(50.0, 140.0, vFogDepth); // noise aliases into streaks at distance
  n = normalize(n + vec3(surf.y, 0.0, surf.z) * grain);

  // --- Biomes ---------------------------------------------------------------
  vec3 moraine = lin(vec3(0.58, 0.53, 0.45));
  vec3 forest  = lin(vec3(0.11, 0.3, 0.12));    // steep wooded hillsides below the treeline
  vec3 rock    = lin(vec3(0.46, 0.42, 0.38));
  vec3 snow    = lin(vec3(0.95, 0.97, 1.0));
  vec3 water   = lin(vec3(0.12, 0.42, 0.52));

  float lush = smoothstep(30.0, 60.0, t) * (1.0 - smoothstep(105.0, 135.0, t));
  // Top-down noise stretches into streaks on steep ground, so the fine tufts fade out there too.
  vec3 lowland = grass(vWorldPos.xz, lush, vFogDepth + smoothstep(0.15, 0.4, slope) * 100.0);
  // Alpine grass higher up: thinner and sun-bleached toward straw.
  vec3 meadow = mix(lowland, lin(vec3(0.55, 0.52, 0.33)), 0.4) * (0.9 + noise * 0.2);

  vec3 albedo = lowland;
  albedo = mix(albedo, meadow, smoothstep(13.0, 24.0, vElevation));
  albedo = mix(albedo, moraine, smoothstep(26.0, 34.0, vElevation));
  // Low steep slopes are wooded, not bare: rock takes over from ~18 up.
  float lowSlope = 1.0 - smoothstep(16.0, 28.0, vElevation);
  albedo = mix(albedo, mix(forest, lowland * 0.7, 0.45) * (0.85 + noise * 0.3), smoothstep(0.22, 0.5, slope) * lowSlope);
  albedo = mix(albedo, rock * (0.8 + noise * 0.4), smoothstep(0.38, 0.62, slope) * mix(0.35, 1.0, 1.0 - lowSlope));

  // Snow from ~41 up, clinging to all but the sheerest faces so the range reads as Himalayan.
  // Top-down noise here: wall-facing noise varies with height and would band the snowline.
  float snowline = 41.0 + (vnoise(vWorldPos.xz * 0.12) - 0.5) * 8.0;
  float snowAmt = smoothstep(snowline - 3.0, snowline + 3.0, vElevation) * (1.0 - smoothstep(0.7, 0.93, slope));
  albedo = mix(albedo, snow, snowAmt);

  // Phewa Lake around Day 5 (Pokhara): a rounded basin with a noisy shoreline (bays and points)
  // instead of a box, inside the trees' and herds' keep-out (|offset| < 10, t 74..100).
  vec2 lq = vec2((vWorldPos.x - valleyCenter(vWorldPos.z)) / 8.5, (t - 87.0) / 12.0);
  float lr = pow(pow(abs(lq.x), 3.0) + pow(abs(lq.y), 3.0), 1.0 / 3.0);
  lr += (vnoise(vWorldPos.xz * 0.22) - 0.5) * 0.16 + (vnoise(vWorldPos.xz * 0.9) - 0.5) * 0.05;
  float lake = 1.0 - smoothstep(0.95, 1.0, lr);
  // Damp, darker earth along the shore, then shallows that shade from green-blue into deep water.
  float shore = smoothstep(0.92, 0.98, lr) * (1.0 - smoothstep(1.0, 1.12, lr));
  albedo = mix(albedo, lin(vec3(0.44, 0.41, 0.3)), shore * 0.4);
  vec3 shallow = lin(vec3(0.2, 0.5, 0.5));
  water = mix(shallow, water * 0.8, 1.0 - smoothstep(0.5, 0.98, lr));
  albedo = mix(albedo, water, lake);

  // Phewa: wind ripples the surface. Two drifting wave sets perturb the normal (gusts roughen
  // it), so the sky sheen and the sun glints shimmer instead of sitting still.
  vec3 viewDir = normalize(vWorldPos - cameraPosition);
  float glint = 0.0;
  vec3 skyRefl = vec3(0.0);
  float reflAmt = 0.0;
  if (lake > 0.01) {
    float rough = 0.35 + windGust(vWorldPos.xz, uWindTime) * 0.65;
    vec2 w1 = vnoised(vWorldPos.xz * 1.3 - WIND_DIR * uWindTime * 0.9).yz;
    vec2 w2 = vnoised(vWorldPos.xz * 3.1 + vec2(uWindTime * 0.55, -uWindTime * 0.3)).yz;
    vec3 nw = normalize(vec3(0.0, 1.0, 0.0) + vec3(w1.x + w2.x * 0.5, 0.0, w1.y + w2.y * 0.5) * 0.18 * rough);
    n = normalize(mix(n, nw, lake));
    vec3 r = reflect(viewDir, nw);
    glint = pow(max(dot(r, uSunDir), 0.0), 90.0) * 2.2 * lake;
    // The ripples break up the reflected sky: brighter where a facet tilts toward the horizon.
    float fresnel = 0.04 + 0.96 * pow(1.0 - max(dot(-viewDir, nw), 0.0), 5.0);
    skyRefl = mix(uFogColor, uZenith, pow(max(r.y, 0.0), 0.55));
    reflAmt = fresnel * lake;
  }

  // --- Lighting: warm mid-morning sun + sky/ground hemisphere ---------------
  // Fair-weather clouds drift over and take the sun off the ground beneath them.
  float sunLeft = vSun * (1.0 - cloudShadow(vWorldPos.xz, uWindTime));
  float diff = max(dot(n, uSunDir), 0.0);
  float hemi = n.y * 0.5 + 0.5;
  vec3 sunCol = lin(vec3(1.0, 0.95, 0.84)) * 1.6;
  vec3 skyAmb = lin(vec3(0.62, 0.74, 0.90)) * 0.62;
  vec3 gndAmb = lin(vec3(0.42, 0.36, 0.26)) * 0.4;
  // Snow gets a touch of the cold sky in shade and bounces more light than rock.
  vec3 ambient = mix(gndAmb, skyAmb, hemi) * vAO * (1.0 + snowAmt * 0.25);
  vec3 col = albedo * (sunCol * diff * sunLeft + ambient);
  col += water * lake * 0.6 * pow(max(n.y, 0.0), 8.0); // sky sheen on the lake
  col = mix(col, skyRefl, reflAmt);
  col += vec3(1.0, 0.93, 0.8) * glint * sunLeft; // no glints in shadow or under a cloud

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
  // Haze takes the sky's colour along the view ray, including the warm glow toward the sun,
  // so far ridges toward the sun go golden and the rest go blue, and still meet the sky dome.
  vec3 fogCol = uFogColor + sunGlow(max(dot(viewDir, uSunDir), 0.0));
  float fogFactor = 1.0 - exp(-uFogDensity * vFogDepth * vFogDepth);
  // A thin haze layer pooled in the low valleys.
  fogFactor += (1.0 - fogFactor) * (1.0 - exp(-vFogDepth * 0.004)) * exp(-max(vWorldPos.y, 0.0) * 0.08) * 0.15;
  // Dissolve the mesh borders into the haze so the sky never shows a hard edge.
  float edge = max(smoothstep(85.0, 118.0, abs(vWorldPos.x)),
                   max(smoothstep(15.0, 38.0, vWorldPos.z), smoothstep(305.0, 335.0, t)));
  col = mix(col, fogCol, clamp(max(fogFactor, edge), 0.0, 1.0));

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
${sunGlowGLSL}
void main() {
  vec3 dir = normalize(vDir);
  float y = max(dir.y, 0.0);
  vec3 col = mix(uHorizon, uZenith, pow(y, 0.55));
  float s = max(dot(dir, uSunDir), 0.0);
  col += sunGlow(s) + vec3(1.0, 0.86, 0.62) * pow(s, 220.0) * 1.4;
  gl_FragColor = vec4(col, 1.0);
}
`
