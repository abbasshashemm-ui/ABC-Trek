import type Lenis from 'lenis'

/**
 * Set by App once Lenis is up; lets any component scroll programmatically.
 * `auto` is true while a button-driven scroll is in flight, so scroll-triggered
 * moments (the base-camp celebration) don't fire as the page flies past them.
 */
export const scrollApi: { lenis: Lenis | null; auto: boolean } = { lenis: null, auto: false }

const DURATION = 2.4

export function scrollToId(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  scrollApi.auto = true
  if (scrollApi.lenis) {
    // A button press always wins over a temporary scroll hold (e.g. the base-camp pause).
    scrollApi.lenis.start()
    scrollApi.lenis.scrollTo(el, { duration: DURATION, force: true, onComplete: () => (scrollApi.auto = false) })
  } else {
    el.scrollIntoView({ behavior: 'smooth' })
    window.setTimeout(() => (scrollApi.auto = false), DURATION * 1000 + 300)
  }
}
