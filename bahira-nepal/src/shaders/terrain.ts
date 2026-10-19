import { terrainHeightGLSL } from './terrainHeight'

export const terrainVertex = /* glsl */ `
${terrainHeightGLSL}

varying vec3 vWorldPos;
varying float vFogDepth;

void main() {
  vec3 p = position;
  float h = getTerrainHeight(p.x, p.z);
  p.y = h;

  vec4 world = modelMatrix * vec4(p, 1.0);
  vec4 mv = viewMatrix * world;

  vWorldPos = world.xyz;
  vFogDepth = -mv.z;
  gl_Position = projectionMatrix * mv;
}
`

// fwidth() is core in WebGL2 / GLSL ES 3.00, which three.js targets; the
// GL_OES_standard_derivatives pragma is WebGL1-only and not needed here.
export const terrainFragment = /* glsl */ `
${terrainHeightGLSL}

uniform vec3 uActivePos;
uniform vec3 uFogColor;
uniform float uFogDensity;

varying vec3 vWorldPos;
varying float vFogDepth;

void main() {
  // Evaluated per fragment (not interpolated from vertices) so contours stay
  // smooth on steep walls instead of showing triangle facets.
  float vElevation = getTerrainHeight(vWorldPos.x, vWorldPos.z);

  float contourFreq = 1.8;
  float scaledHeight = vElevation * contourFreq;
  float fw = fwidth(scaledHeight);
  float line = abs(fract(scaledHeight - 0.5) - 0.5) / fw;
  float contourAlpha = 1.0 - smoothstep(0.0, 1.35, line);

  // Major contour every 5th line
  float majorScaled = vElevation * (contourFreq * 0.2);
  float fwMajor = fwidth(majorScaled);
  float majorLine = abs(fract(majorScaled - 0.5) - 0.5) / fwMajor;
  float majorAlpha = 1.0 - smoothstep(0.0, 1.6, majorLine);

  // Fade lines that would collapse below pixel spacing (moire on steep/far slopes)
  contourAlpha *= 1.0 - smoothstep(0.55, 1.1, fw);
  majorAlpha *= 1.0 - smoothstep(0.55, 1.1, fwMajor);

  // Proximity glow from the active trekker position
  float distToTrail = length(vWorldPos.xz - uActivePos.xz);
  float trailGlow = exp(-distToTrail * 0.09);

  vec3 baseColor = mix(vec3(0.02, 0.03, 0.05), vec3(0.05, 0.09, 0.15), clamp(vElevation / 25.0, 0.0, 1.0));
  vec3 cyanContour = vec3(0.0, 0.898, 1.0);
  vec3 goldGlow = vec3(1.0, 0.54, 0.0);

  vec3 lineColor = mix(cyanContour * 0.35, goldGlow, trailGlow);
  vec3 col = mix(baseColor, lineColor, clamp(contourAlpha * 0.45 + majorAlpha * 0.85, 0.0, 1.0));
  col += goldGlow * trailGlow * 0.035;

  // Exponential depth fog
  float fogFactor = 1.0 - exp(-uFogDensity * vFogDepth * vFogDepth);
  col = mix(col, uFogColor, clamp(fogFactor, 0.0, 1.0));

  // Palette above is authored in sRGB; the post chain expects linear input.
  gl_FragColor = vec4(pow(col, vec3(2.2)), 1.0);
}
`
