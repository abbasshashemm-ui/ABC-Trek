# Bahira Expeditions: Beirut to Annapurna Base Camp

3D scrollytelling promo for a 15-day Beirut → Annapurna Base Camp expedition.
Vite + React + TypeScript, react-three-fiber, GLSL terrain, Lenis + GSAP, Tailwind v4.

## Commands
- `npm run dev` / `npm run build` (tsc + vite) / `npm run lint`
- Logo: `public/bahira-logo.png` is generated from `assets-src/bahira-logo-source.jpeg` by `node scripts/make-logo.mjs <src>`
  (colour-to-alpha, trimmed). Prefer a designer-exported transparent PNG if one exists.

## Rules that must not drift
- **Terrain height is defined twice and must stay identical:** `src/utils/terrainMath.ts` (trail, beacon, camera)
  and `src/shaders/terrainHeight.ts` (vertex + fragment shader). Change both or the trail clips the mountains.
  GLSL `smoothstep` needs `edge0 < edge1` and `pow` needs a non-negative base, hence `t = -z` and `k*k`.
- Contours use per-fragment height (`getTerrainHeight(vWorldPos.xz)`), not the interpolated vertex value (avoids facets).
- No `GL_OES_standard_derivatives` pragma: three targets WebGL2, where `fwidth` is core.
- Look: natural shaded terrain (biome by height/slope/act, snow above ~40, Phewa Lake at Day 5), golden-hour sun +
  sky dome (`src/scene/palette.ts` shared by both), faint contour overlay. Palette authored in sRGB, lit in linear (`lin()`).
  Terrain fog colour must equal the sky horizon or the seam shows.
- Scroll state lives in `src/state/scrollStore.ts` (mutable, updated once per GSAP tick). Never put per-frame
  scroll values in React state.
- Trail curve = all 15 day waypoints plus 6 terrain-sampled points per leg (Catmull-Rom overshoot would otherwise
  dip under the terrain on the ABC crest).
- Camera: Days 1-9 chase (Day 9: wide-lens reveal in the ABC basin tilting up to Annapurna), Days 10-12 high drone follow (an east-ridge
  vantage was tried and dropped: shadowed walls in haze, trail invisible), Act IV orbital overview.
  Fog density eases down for the overview.
- Props (`src/scene/props/`): procedural low-poly, instanced, placed with `getTerrainHeight` and a seeded RNG so
  layouts are stable. Landmark sites and the backdrop summits live in `spots.ts`; villages and trees keep clear of them.
  `merge()` normalises indexed/non-indexed parts (raw `mergeGeometries` returns null). `SceneBoundary` keeps the page
  usable if WebGL fails. The ABC basin is a shelf carved into the height function (both twins).

- Photos: `photos-src/manifest.json` maps days to files (folder mode is the fallback; see its README), `npm run photos` writes WebP to `public/photos/`
  and `src/data/photos.generated.json`. Never hand-edit the JSON. Non-trek photos need a `credits.json` entry
  (author, licence allowing commercial use, source URL); never ship placeholder or unlicensed images.

- Type: Instrument Serif (headings, large figures), Geist (body), Geist Mono (small labels only; its full-width
  commas look gappy at display sizes). Self-hosted via @fontsource; no Google Fonts request.
- Copy: plain, specific, no filler ("embark", "unforgettable", "memories to treasure"). Every line names a real
  place, height or activity. Don't promise sightings or add activities that aren't in the itinerary.
- UI libraries (Emil Kowalski's list): base-ui for dialogs (lightbox uses `Dialog.Trigger` + handle/payload so
  focus management works), clsx for conditional classes.

## Data
- `src/data/itinerary.ts`: all 15 days; every activity from the client's itinerary must stay.
- `src/data/booking.ts`: $1,570 per person + international ticket (not included), optional insurance $120,
  seats/date, 9 inclusions + `extras`, and `BOOKING_URL` (WhatsApp deep link, +961 71 661 075).
