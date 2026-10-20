import { village, type BuildingSpec } from './village'

// sRGB palettes
const BRICK = ['#9a4a32', '#b05a3c', '#8c3f2c', '#c9b79c']
const DARK_ROOF = ['#3b2f2a', '#5a3a2a', '#6b2f22']
const MUD = ['#a58a64', '#8f7553', '#9b7f5a']
const THATCH = ['#c2a35a', '#b08f45', '#a8873f']
const LAKESIDE = ['#e8e2d4', '#6fa3c7', '#e6c25a', '#d98b5f', '#f0ece2']
const LAKESIDE_ROOF = ['#2f5f8a', '#a53c32', '#3d6b4a']
const TEAHOUSE = ['#ece6da', '#d9d2c4', '#b8b2a6']
const TIN_ROOF = ['#2a5d9a', '#2f7a4f', '#b23a2e']
const STONE = ['#9b958b', '#8a8378', '#a39d92']

const teahouses = (seed: number, day: number, count = 6) =>
  village({ seed, day, count, minOff: 3, maxOff: 8, along: 4, size: [1.4, 2], walls: TEAHOUSE, roofs: TIN_ROOF, roofH: 0.35, maxSlope: 0.45, litRatio: 0.8 })

/** Day indices are 0-based (Day 1 = 0). */
export const buildings: BuildingSpec[] = [
  // Act I: Kathmandu
  ...village({ seed: 11, day: 0, count: 22, minOff: 3, maxOff: 13, along: 8, size: [1.1, 1.8], walls: BRICK, roofs: DARK_ROOF }),
  ...village({ seed: 12, day: 1, count: 18, minOff: 3, maxOff: 12, along: 8, size: [1.1, 1.8], walls: BRICK, roofs: DARK_ROOF }),
  // Act II: Chitwan huts, Pokhara lakeside (Phewa Lake occupies |offset| < 9 around Day 5)
  ...village({ seed: 21, day: 2, count: 10, minOff: 3, maxOff: 12, along: 7, size: [0.9, 1.3], walls: MUD, roofs: THATCH, roofH: 0.6, litRatio: 0.3 }),
  ...village({ seed: 22, day: 3, count: 8, minOff: 3, maxOff: 12, along: 7, size: [0.9, 1.3], walls: MUD, roofs: THATCH, roofH: 0.6, litRatio: 0.3 }),
  ...village({ seed: 23, day: 4, count: 14, minOff: 10, maxOff: 16, along: 9, size: [1.1, 1.7], walls: LAKESIDE, roofs: LAKESIDE_ROOF }),
  ...village({ seed: 24, day: 5, count: 10, minOff: 3, maxOff: 12, along: 7, size: [1.1, 1.7], walls: LAKESIDE, roofs: LAKESIDE_ROOF }),
  // Act III: teahouse stops and the base-camp lodges
  ...teahouses(31, 6),
  ...teahouses(32, 7, 5),
  ...village({ seed: 33, day: 8, count: 8, minOff: 2.8, maxOff: 9, along: 5, size: [1.6, 2.4], walls: STONE, roofs: TIN_ROOF, roofH: 0.32, maxSlope: 0.5, litRatio: 0.9 }),
  // The way back down the other bank (Pokhara and Kathmandu already have their towns; Beirut is off the map)
  ...teahouses(34, 9, 5),
  ...teahouses(35, 10),
  ...teahouses(36, 11),
]
