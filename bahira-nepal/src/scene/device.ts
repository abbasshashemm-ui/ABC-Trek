/** Phones and tablets: the scene trims its resolution and its shadow detail there. */
export const COARSE = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches

/** iPhone/iPad Safari (iPadOS reports itself as a Mac with touch). */
export const IOS =
  typeof navigator !== 'undefined' &&
  (/iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1))
