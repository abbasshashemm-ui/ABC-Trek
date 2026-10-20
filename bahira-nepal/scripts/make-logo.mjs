#!/usr/bin/env node
/**
 * Builds public/bahira-logo.png (transparent, trimmed) from the flat logo export.
 * "Colour to alpha": sample the background from the corners, then for each pixel take the
 * smallest alpha that explains it as (logo colour) over (background) and un-blend the colour,
 * so the soft glow keeps its hue instead of leaving a grey halo.
 *
 *   node scripts/make-logo.mjs <input> [output=public/bahira-logo.png]
 */
import sharp from 'sharp'

const [input, output = 'public/bahira-logo.png'] = process.argv.slice(2)
if (!input) throw new Error('usage: make-logo.mjs <input> [output]')

const { data, info } = await sharp(input).removeAlpha().raw().toBuffer({ resolveWithObject: true })
const { width: W, height: H } = info

// Median of four corner patches = background colour.
const samples = [[], [], []]
for (const [cx, cy] of [[0, 0], [W - 24, 0], [0, H - 24], [W - 24, H - 24]])
  for (let y = cy; y < cy + 24; y++)
    for (let x = cx; x < cx + 24; x++) for (let c = 0; c < 3; c++) samples[c].push(data[(y * W + x) * 3 + c])
const bg = samples.map((s) => s.sort((a, b) => a - b)[s.length >> 1] / 255)

const out = Buffer.alloc(W * H * 4)
const NOISE = 0.025 // JPEG noise around the background stays fully transparent
for (let i = 0, j = 0; i < data.length; i += 3, j += 4) {
  let a = 0
  for (let c = 0; c < 3; c++) {
    const v = data[i + c] / 255
    const d = v > bg[c] ? (v - bg[c]) / (1 - bg[c]) : (bg[c] - v) / bg[c]
    a = Math.max(a, d)
  }
  a = Math.min(1, Math.max(0, (a - NOISE) / (1 - NOISE)))
  for (let c = 0; c < 3; c++) {
    const v = data[i + c] / 255
    const fg = a > 0 ? (v - (1 - a) * bg[c]) / a : 0
    out[j + c] = Math.round(255 * Math.min(1, Math.max(0, fg)))
  }
  out[j + 3] = Math.round(255 * a)
}

const trimmed = await sharp(out, { raw: { width: W, height: H, channels: 4 } }).png().trim({ threshold: 4 }).toBuffer({ resolveWithObject: true })
const pad = Math.round(Math.max(trimmed.info.width, trimmed.info.height) * 0.03)
const padded = await sharp(trimmed.data)
  .extend({ top: pad, bottom: pad, left: pad, right: pad, background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .toBuffer()
await sharp(padded).resize({ width: 640, height: 640, fit: 'inside', withoutEnlargement: true }).png({ compressionLevel: 9 }).toFile(output)
const m = await sharp(output).metadata()
console.log(`${output}: ${m.width}x${m.height}, background sampled as rgb(${bg.map((v) => Math.round(v * 255)).join(', ')})`)

// Small derivatives so the page never downloads the 640px master: header (34px tall, 4x for
// sharp phones) and the home-screen/favicon icons on the dark brand background.
const dir = output.replace(/[^/]+$/, '')
await sharp(output).resize({ height: 136 }).webp({ quality: 90, alphaQuality: 90 }).toFile(`${dir}bahira-logo-nav.webp`)
for (const [name, px] of [['icon-180.png', 180], ['icon-64.png', 64]]) {
  await sharp(output)
    .resize({ width: Math.round(px * 0.8), height: Math.round(px * 0.8), fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .extend({ top: Math.round(px * 0.1), bottom: px - Math.round(px * 0.8) - Math.round(px * 0.1), left: Math.round(px * 0.1), right: px - Math.round(px * 0.8) - Math.round(px * 0.1), background: '#0a110e' })
    .flatten({ background: '#0a110e' })
    .png({ compressionLevel: 9, palette: true })
    .toFile(`${dir}${name}`)
}
console.log('wrote bahira-logo-nav.webp, icon-180.png, icon-64.png')
