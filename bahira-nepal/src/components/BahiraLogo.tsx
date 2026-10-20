interface Props {
  size?: number
  className?: string
}

/**
 * The header logo: a small WebP cut from public/bahira-logo.png by scripts/make-logo.mjs
 * (the 640px master is ~0.5 MB, too heavy for a 34px mark on first paint).
 */
export default function BahiraLogo({ size = 40, className }: Props) {
  return (
    <img
      src="/bahira-logo-nav.webp"
      alt="Bahira Expeditions"
      width={Math.round(size * (640 / 539))}
      height={size}
      decoding="async"
      fetchPriority="high"
      className={className}
      style={{ height: size, width: 'auto', filter: 'drop-shadow(0 0 24px rgba(0, 229, 255, 0.35))' }}
    />
  )
}
