import type Lenis from 'lenis'

/** Set by App once Lenis is up; lets any component scroll programmatically. */
export const scrollApi: { lenis: Lenis | null } = { lenis: null }

export function scrollToId(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  if (scrollApi.lenis) scrollApi.lenis.scrollTo(el, { duration: 2.4 })
  else el.scrollIntoView({ behavior: 'smooth' })
}
