/**
 * Reduced motion: the scene still follows the scroll (the visitor drives that), but nothing moves
 * on its own. Idle animations read their clock through `idleTime`, which stays at 0.
 */
export const REDUCED_MOTION = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

export const idleTime = (elapsed: number) => (REDUCED_MOTION ? 0 : elapsed)
