import { besideTrail, upValley } from './placement'

/** Landmark sites, shared by the landmark meshes and the scatterers that must keep clear of them. */
export const SPOTS = {
  pashupati: { day: 0, offset: 6.5, along: -2, clear: 3 },
  boudhanath: { day: 1, offset: -7, along: 0, clear: 4.5 },
  peacePagoda: { day: 5, offset: 14, along: 0, clear: 4.5 },
  abcChorten: { day: 8, offset: -3.5, along: -2, clear: 6 },
} as const

export const spotPos = (s: { day: number; offset: number; along: number }) => besideTrail(s.day, s.offset, s.along)

/** Summits on the west side of the sanctuary; the east-ridge camera looks back across ABC at them. */
export const ANNAPURNA = { ...upValley(8.9, -40), sink: 28, height: 95 }
export const FISHTAIL = { ...upValley(7, -34), sink: 22, height: 100 }

export function clearOfLandmarks(x: number, z: number, margin = 0) {
  return Object.values(SPOTS).every((s) => {
    const p = spotPos(s)
    return Math.hypot(p.x - x, p.z - z) > s.clear + margin
  })
}
