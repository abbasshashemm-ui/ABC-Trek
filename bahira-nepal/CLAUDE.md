# Bahira Expeditions: Beirut to Annapurna Base Camp

3D scrollytelling promo for a 15-day Beirut → Annapurna Base Camp expedition.
Vite + React + TypeScript, react-three-fiber, GLSL terrain, Lenis + GSAP, Tailwind v4.

## Commands
- `npm run dev` / `npm run build` (tsc + vite) / `npm run lint`
- Logo: `public/bahira-logo.png` is generated from `assets-src/bahira-logo-source.jpeg` by `node scripts/make-logo.mjs <src>`
  (colour-to-alpha, trimmed), plus `bahira-logo-nav.webp` (header, ~17 KB) and `icon-180/64.png`. The page never loads
  the 640px master. Prefer a designer-exported transparent PNG if one exists.

## Rules that must not drift
- **Terrain height is defined twice and must stay identical:** `src/utils/terrainMath.ts` (trail, beacon, camera)
  and `src/shaders/terrainHeight.ts` (vertex + fragment shader). Change both or the trail clips the mountains.
  GLSL `smoothstep` needs `edge0 < edge1` and `pow` needs a non-negative base, hence `t = -z` and `k*k`.
- Contours use per-fragment height (`getTerrainHeight(vWorldPos.xz)`), not the interpolated vertex value (avoids facets).
- No `GL_OES_standard_derivatives` pragma: three targets WebGL2, where `fwidth` is core.
- Look: sunny and inviting: natural shaded terrain (vivid green biomes by height/slope/act, snow from ~41 on all but
  sheer faces, rounded irregular ridges, Phewa Lake at Day 5), warm mid-morning sun, clear blue sky dome, light vignette.
  Contours are faint shade lines that lighten near the trekkers; no orange ground glow (`src/scene/palette.ts` shared by both), faint contour overlay. Palette authored in sRGB, lit in linear (`lin()`).
  Terrain fog colour must equal the sky horizon or the seam shows.
- Scroll state lives in `src/state/scrollStore.ts` (mutable, updated once per GSAP tick). Never put per-frame
  scroll values in React state.
- The trip is a loop, not a line: `STATIONS` in `utils/journey.ts` puts Days 1-9 up the valley centre to base camp
  (z = -171.4), Days 10-12 back down the other bank (offset +5..6.5), Day 13 Pokhara's east shore, then two flights
  (Pokhara -> Kathmandu arc, Kathmandu -> Beirut climbing off the map). Behind base camp the floor keeps rising into
  the range. `besideTrail` places by station (way up or back); `upValley` is for the backdrop summits. Villages and
  trees call `nearTrail` so they keep off both trails.
- Trail curve = all 15 day waypoints plus 6 sampled points per leg (Catmull-Rom overshoot would otherwise
  dip under the terrain on the ABC crest). Walked part gold, ahead a faint sand footpath, flight legs dashed.
  Checkpoints are cairns with a prayer-flag pennant that takes its colour when reached. Three trekkers (`Trekkers.tsx`)
  walk single file at the scroll position (legs swing with distance walked); a small plane replaces them on flights.
- Camera: Days 1-9 chase (Day 9: wide-lens reveal in the ABC basin tilting up to Annapurna, finished before d = 9),
  Days 10-12 a drone a little further down the trail looking back up at the group (following from behind put the lens
  in the range past base camp; an east-ridge vantage was all shadow), Act IV a swaying vantage south-east of Kathmandu
  over the whole loop (a full orbit drifted over the high range). Heading is averaged over a window so the camera
  turns smoothly at base camp. Fog density eases down for the overview.
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

- Layout (direction C, quiet/premium, phone first): no cards. Each day is a `DayStop` (`[data-day]`) with text on the
  valley under ONE journey-wide tint (`Journey.tsx`, fades in/out at the ends; per-day scrims caused visible bands) and its 2-3 photos above it (`PhotoStrip`, tap = gallery). Full-screen photo moments
  were tried and dropped (client preferred the grid). `updateScroll` interpolates between the real `[data-day]` centres.
  Header auto-hides on scroll down, returns on scroll up/focus.
- Guides (`Guides.tsx`, manifest key `"guides"`): experienced trekkers (EBC, this ABC trail, many more), Instagram links
  @mhmd_hmayed and @_hsenfarhat_; "Bahira Expeditions is run by Hussein Farhat" (= Farhat).
- Speed: three.js must only be imported under `src/scene/` (and `utils/journey.ts`, which only the scene uses); anything the
  page shell imports stays three-free (`DAY_COUNT` lives in `itinerary.ts` for that reason). The Scene chunk is fetched on
  idle after first paint and fades in; `PerformanceMonitor` drops DPR to 1 on slow devices. Photo `sizes` must match the
  rendered tile width so phones pick the 800w file.
- Base camp (`SummitCelebration.tsx`): when the Day 9 stop scrolls up into place, the page settles on it for 3 s (mouse
  and trackpad only: on touch screens stopping Lenis fights iOS momentum scrolling and the page jumps),
  "4,130 m" fades in above the photos (`[data-reached]`) and a few prayer-flag pieces drift. Skips jumps and button scrolls; Escape or
  `scrollToId` releases; reduced motion = number only. Hold = `lenis.stop()` then `scrollTo({ force })`.

- Chrome (Apple-style): header is a translucent material (`.nav-material`, blur fading out at the bottom, no border),
  padded by `env(safe-area-inset-*)`. Buttons: `.btn-primary` warm off-white fill, `.btn-glass` frosted; gold is an
  accent only (prices, the trail), never a button fill. Press feedback on `:active`. Reduced transparency/contrast
  fall back to solid. `viewport-fit=cover`, no fixed theme-color, 3D canvas is `100lvh` so it runs behind Safari's bars.

## Data
- `src/data/itinerary.ts`: all 15 days; every activity from the client's itinerary must stay.
- `src/data/booking.ts`: $1,570 per person + international ticket (not included), optional insurance $120,
  seats/date, 9 inclusions (domestic flight Pokhara to Kathmandu included) + `extras`, and `CONTACTS`: Hmayed +961 71 661 075 and Farhat +961 79 183 091, each with
  a WhatsApp link and personal greeting. Both buttons look identical; hero "Reserve a seat" scrolls to booking.
