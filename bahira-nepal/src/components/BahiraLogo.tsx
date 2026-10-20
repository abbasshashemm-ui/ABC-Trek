import { useEffect, useRef } from 'react'

interface Props {
  size?: number
  className?: string
}

/** Knock the (near-)white JPEG background out to transparency. */
function knockOutWhite(data: Uint8ClampedArray) {
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    const max = Math.max(r, g, b) / 255
    const min = Math.min(r, g, b) / 255
    const lum = (max + min) / 2
    const denom = 1 - Math.abs(2 * lum - 1)
    const sat = max === min || denom === 0 ? 0 : (max - min) / denom
    // Smoothly fade out bright, low-saturation (white / near-white) pixels
    const whiteness = Math.max(0, (lum - 0.72) / 0.28) * Math.max(0, 1 - sat * 2.2)
    // Scale existing alpha so a PNG's own transparency survives.
    data[i + 3] = Math.round(data[i + 3] * (1 - Math.min(1, whiteness)))
  }
}

/** Used only until the client's `/bahira-logo.jpeg` is present in /public. */
function drawFallback(ctx: CanvasRenderingContext2D, s: number) {
  ctx.clearRect(0, 0, s, s)
  const c = s / 2
  const ring = ctx.createLinearGradient(0, 0, s, s)
  ring.addColorStop(0, '#FFC700')
  ring.addColorStop(1, '#FF8A00')
  ctx.strokeStyle = ring
  ctx.lineWidth = s * 0.05
  ctx.beginPath()
  ctx.arc(c, c, s * 0.42, 0, Math.PI * 2)
  ctx.stroke()
  ctx.strokeStyle = '#00E5FF'
  ctx.lineWidth = s * 0.028
  for (let i = -2; i <= 2; i++) {
    ctx.save()
    ctx.translate(c, s * 0.68)
    ctx.rotate(i * 0.42)
    ctx.beginPath()
    ctx.ellipse(0, -s * 0.2, s * 0.085, s * 0.2, 0, 0, Math.PI * 2)
    ctx.stroke()
    ctx.restore()
  }
}

export default function BahiraLogo({ size = 40, className }: Props) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas?.getContext('2d', { willReadFrequently: true })
    if (!canvas || !ctx) return
    let cancelled = false

    const img = new Image()
    img.onload = () => {
      if (cancelled) return
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      ctx.drawImage(img, 0, 0)
      const frame = ctx.getImageData(0, 0, canvas.width, canvas.height)
      knockOutWhite(frame.data)
      ctx.putImageData(frame, 0, 0)
    }
    const sources = ['/bahira-logo.png', '/bahira-logo.jpeg', '/bahira-logo.jpg']
    img.onerror = () => {
      if (cancelled) return
      const next = sources.shift()
      if (next) {
        img.src = next
        return
      }
      canvas.width = canvas.height = 256
      drawFallback(ctx, 256)
    }
    img.src = sources.shift()!

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <canvas
      ref={ref}
      role="img"
      aria-label="Bahira logo"
      className={className}
      style={{
        height: size,
        width: 'auto',
        maxWidth: size * 2,
        objectFit: 'contain',
        filter: 'drop-shadow(0 0 24px rgba(0, 229, 255, 0.35))',
      }}
    />
  )
}
