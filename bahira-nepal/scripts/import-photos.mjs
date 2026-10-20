#!/usr/bin/env node
/**
 * Turns raw photos in photos-src/<place>/ into web-sized WebP files in public/photos/
 * and writes src/data/photos.generated.json, which the waypoint cards read.
 *
 *   photos-src/kathmandu/IMG_0001.HEIC     <- trek photo (credited to the trek leaders)
 *   photos-src/abc/sunrise.jpg
 *   photos-src/abc/credits.json            <- only for photos that are NOT ours:
 *     { "sunrise.jpg": { "author": "Jane Doe", "license": "CC BY-SA 4.0",
 *                        "source": "https://commons.wikimedia.org/wiki/File:...", "alt": "..." } }
 *
 * Photos of a place are spread across the days spent there (max 3 per day), trek photos first.
 * Videos (.mov/.mp4) contribute one still frame if ffmpeg is on PATH.
 *
 * Usage: npm run photos
 */
import { readdir, readFile, mkdir, writeFile, rm } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join, extname } from 'node:path'
import { execFileSync } from 'node:child_process'
import { tmpdir } from 'node:os'
import sharp from 'sharp'

const ROOT = new URL('..', import.meta.url).pathname
const SRC = process.env.PHOTOS_SRC ?? join(ROOT, 'photos-src')
const OUT = join(ROOT, 'public', 'photos')
const MANIFEST = join(ROOT, 'src', 'data', 'photos.generated.json')

const TREK_CREDIT = 'Hmayed & Farhat · past trek'
const PER_DAY = 3
const WIDTHS = [800, 1600]

/** Folder name -> itinerary days (1-based) spent there. */
const PLACES = {
  kathmandu: { label: 'Kathmandu', days: [1, 2, 14] },
  chitwan: { label: 'Chitwan', days: [3, 4] },
  pokhara: { label: 'Pokhara', days: [5, 6, 13] },
  sinuwa: { label: 'Sinuwa', days: [7, 10] },
  deurali: { label: 'Deurali', days: [8] },
  abc: { label: 'Annapurna Base Camp', days: [9] },
  'jhinu-danda': { label: 'Jhinu Danda', days: [11] },
  landruk: { label: 'Landruk', days: [12] },
  beirut: { label: 'Beirut', days: [15] },
  // Generic Annapurna-trail shots: used to top up trail days that are still short.
  trek: { label: 'The Annapurna trail', days: [7, 8, 10, 11, 12, 9] },
}

const IMAGE = new Set(['.jpg', '.jpeg', '.png', '.webp', '.heic', '.heif', '.avif', '.tif', '.tiff'])
const VIDEO = new Set(['.mov', '.mp4', '.m4v'])

const hasFfmpeg = (() => {
  try {
    execFileSync('ffmpeg', ['-version'], { stdio: 'ignore' })
    return true
  } catch {
    return false
  }
})()

function videoStill(file) {
  const out = join(tmpdir(), `still-${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`)
  // A frame a third of the way in avoids black fade-ins and shaky openings.
  const dur = Number(
    execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file]).toString().trim(),
  )
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-ss', String((dur || 3) / 3), '-i', file, '-frames:v', '1', '-q:v', '2', out])
  return out
}

async function main() {
  if (!existsSync(SRC)) throw new Error(`Missing ${SRC}`)
  await rm(OUT, { recursive: true, force: true })
  await mkdir(OUT, { recursive: true })

  /** @type {Record<number, any[]>} */
  const byDay = {}
  const unknown = []

  // Trek-place folders first so trail top-ups ("trek") only fill remaining slots.
  const folders = (await readdir(SRC, { withFileTypes: true })).filter((d) => d.isDirectory()).map((d) => d.name)
  folders.sort((a, b) => (a === 'trek') - (b === 'trek'))

  for (const folder of folders) {
    const place = PLACES[folder]
    if (!place) {
      unknown.push(folder)
      continue
    }
    const dir = join(SRC, folder)
    const credits = existsSync(join(dir, 'credits.json')) ? JSON.parse(await readFile(join(dir, 'credits.json'), 'utf8')) : {}
    const files = (await readdir(dir)).filter((f) => IMAGE.has(extname(f).toLowerCase()) || VIDEO.has(extname(f).toLowerCase())).sort()

    // Ours before licensed ones, so every stop leads with a real trek photo when we have one.
    files.sort((a, b) => Number(Boolean(credits[a])) - Number(Boolean(credits[b])))

    let n = 0
    for (const file of files) {
      const days = place.days.filter((d) => (byDay[d]?.length ?? 0) < PER_DAY)
      if (!days.length) break
      // Fill the emptiest day first, in itinerary order for ties.
      days.sort((a, b) => (byDay[a]?.length ?? 0) - (byDay[b]?.length ?? 0))
      const day = days[0]

      let input = join(dir, file)
      if (VIDEO.has(extname(file).toLowerCase())) {
        if (!hasFfmpeg) {
          console.warn(`skip ${folder}/${file}: install ffmpeg to use video stills`)
          continue
        }
        input = videoStill(input)
      }

      const slug = `${folder}-${String(++n).padStart(2, '0')}`
      const meta = await sharp(input).metadata()
      // EXIF orientations 5-8 store the image rotated 90deg, so width/height swap once upright.
      const swapped = (meta.orientation ?? 1) >= 5
      const portrait = (swapped ? meta.width : meta.height) > (swapped ? meta.height : meta.width)
      const srcSet = []
      let w = 0
      let h = 0
      for (const width of WIDTHS) {
        const info = await sharp(input)
          .rotate() // honour EXIF orientation
          .resize({ width, height: portrait ? width : undefined, fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 78 })
          .toFile(join(OUT, `${slug}-${width}.webp`))
        srcSet.push(`/photos/${slug}-${width}.webp ${info.width}w`)
        w = info.width
        h = info.height
      }
      const c = credits[file]
      ;(byDay[day] ??= []).push({
        src: `/photos/${slug}-${WIDTHS[0]}.webp`,
        srcSet: srcSet.join(', '),
        width: w,
        height: h,
        alt: c?.alt ?? `${place.label}, from a past Bahira trek`,
        credit: c ? c.author : TREK_CREDIT,
        license: c?.license,
        source: c?.source,
        ours: !c,
      })
      console.log(`day ${String(day).padStart(2)} <- ${folder}/${file}${c ? `  (${c.license}, ${c.author})` : ''}`)
    }
  }

  await writeFile(MANIFEST, JSON.stringify(byDay, null, 2) + '\n')
  const empty = Array.from({ length: 15 }, (_, i) => i + 1).filter((d) => !byDay[d]?.length)
  console.log(`\nWrote ${Object.values(byDay).flat().length} photos.`)
  if (empty.length) console.log(`Days with no photos yet: ${empty.join(', ')}`)
  if (unknown.length) console.log(`Ignored unknown folders: ${unknown.join(', ')} (expected: ${Object.keys(PLACES).join(', ')})`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
