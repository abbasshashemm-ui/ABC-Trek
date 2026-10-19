# BAHIRA — "The Golden Thread"

3D scrollytelling promo for a 15-day Beirut → Annapurna Base Camp expedition.
Vite + React + TypeScript, react-three-fiber, GLSL terrain, Lenis + GSAP, Tailwind v4.

## Commands
- `npm run dev` / `npm run build` (tsc + vite) / `npm run lint`
- Drop the client logo at `public/bahira-logo.jpeg`. Until then `<BahiraLogo />` draws a placeholder.

## Rules that must not drift
- **Terrain height is defined twice and must stay identical:** `src/utils/terrainMath.ts` (trail, beacon, camera)
  and `src/shaders/terrainHeight.ts` (vertex + fragment shader). Change both or the trail clips the mountains.
  GLSL `smoothstep` needs `edge0 < edge1` and `pow` needs a non-negative base, hence `t = -z` and `k*k`.
- Contours use per-fragment height (`getTerrainHeight(vWorldPos.xz)`), not the interpolated vertex value (avoids facets).
- No `GL_OES_standard_derivatives` pragma: three targets WebGL2, where `fwidth` is core.
- Terrain palette is authored in sRGB and `pow(col, 2.2)` on output because the post chain is linear.
- Scroll state lives in `src/state/scrollStore.ts` (mutable, updated once per GSAP tick). Never put per-frame
  scroll values in React state.
- Trail curve = all 15 day waypoints plus 6 terrain-sampled points per leg (Catmull-Rom overshoot would otherwise
  dip under the terrain on the ABC crest).
- Camera: Days 1-9 chase, Days 10-12 orbit to an east-ridge vantage looking back at ABC, Act IV orbital overview.
  Fog density eases down for the overview.

## Data
- `src/data/itinerary.ts`: the full 15-day dataset (do not summarise).
- `src/data/booking.ts`: price/seats/date, 10 inclusions, and `BOOKING_URL` (placeholder `#booking`; wire to checkout).
