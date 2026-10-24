/** Phones and tablets: the scene trims its resolution and its shadow detail there. */
export const COARSE = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches
