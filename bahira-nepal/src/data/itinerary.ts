export type ActId = 'I' | 'II' | 'III' | 'IV'

export interface ItineraryDay {
  day: number
  title: string
  region: string
  /** metres above sea level */
  altitude: number
  act: string
  bullets: string[]
}

export const ACT_LABELS: Record<ActId, string> = {
  I: 'Kathmandu',
  II: 'Chitwan & Pokhara',
  III: 'The trek',
  IV: 'The way home',
}

export const ABC_ALTITUDE = 4130

const A1 = 'I — The Sacred Valley'
const A2 = 'II — Jungle & Lake'
const A3 = 'III — The Sanctuary Ascent'
const A4 = 'IV — Full Circle'

export const itinerary: ItineraryDay[] = [
  {
    day: 1,
    title: 'First evening in Nepal',
    region: 'Kathmandu',
    altitude: 1400,
    act: A1,
    bullets: [
      'Land in Kathmandu and walk the lanes of Thamel.',
      'Evening at Pashupatinath, Nepal’s most important Hindu temple, on the banks of the Bagmati.',
    ],
  },
  {
    day: 2,
    title: 'Two stupas, one valley',
    region: 'Kathmandu',
    altitude: 1420,
    act: A1,
    bullets: [
      'Climb the steps to Swayambhunath, the Monkey Temple, for the view across Kathmandu.',
      'Walk the clockwise circuit of Boudhanath Stupa with the pilgrims at dusk.',
    ],
  },
  {
    day: 3,
    title: 'South to Chitwan',
    region: 'Chitwan',
    altitude: 150,
    act: A2,
    bullets: [
      'Drive down to the lowlands and spend the afternoon in a Tharu village.',
      'Paddle a dugout canoe on the river and listen to the jungle.',
      'Evening performance of traditional Tharu music and dance.',
    ],
  },
  {
    day: 4,
    title: 'A day in the jungle',
    region: 'Chitwan',
    altitude: 150,
    act: A2,
    bullets: [
      'Morning elephant ride through the forest of Chitwan.',
      'Afternoon jeep safari looking for rhino and deer.',
    ],
  },
  {
    day: 5,
    title: 'Down to the lake',
    region: 'Pokhara',
    altitude: 822,
    act: A2,
    bullets: [
      'Drive to Pokhara and spend the evening on the lakeside.',
      'Kayak across Phewa Lake.',
    ],
  },
  {
    day: 6,
    title: 'Sunrise to sunset over the lake',
    region: 'Pokhara',
    altitude: 1100,
    act: A2,
    bullets: [
      'Sunrise from the World Peace Pagoda, above Phewa Lake.',
      'Down into Gupteshwor Mahadev Cave.',
      'Sunset at the Pumdikot Shiva statue.',
    ],
  },
  {
    day: 7,
    title: 'On foot from Samrung',
    region: 'Sinuwa',
    altitude: 2260,
    act: A3,
    bullets: [
      'Drive to Samrung, where the walking starts.',
      'Trek to Sinuwa, 2,260 m.',
    ],
  },
  {
    day: 8,
    title: 'Up the Modi Khola gorge',
    region: 'Deurali',
    altitude: 3200,
    act: A3,
    bullets: [
      'Sinuwa to Deurali, 3,200 m, through bamboo and rhododendron forest as the valley narrows.',
    ],
  },
  {
    day: 9,
    title: 'Inside the Annapurna Sanctuary',
    region: 'Annapurna Base Camp',
    altitude: 4130,
    act: A3,
    bullets: [
      'Deurali to Annapurna Base Camp.',
      'A ring of peaks on every side, with Annapurna I straight ahead.',
    ],
  },
  {
    day: 10,
    title: 'The same trail, the other way',
    region: 'Sinuwa',
    altitude: 2260,
    act: A3,
    bullets: [
      'Walk down from base camp to Sinuwa, past everything you climbed through.',
    ],
  },
  {
    day: 11,
    title: 'Hot springs at Jhinu Danda',
    region: 'Jhinu Danda',
    altitude: 1780,
    act: A3,
    bullets: [
      'Sinuwa to Jhinu Danda.',
      'An afternoon in the natural hot springs by the river.',
    ],
  },
  {
    day: 12,
    title: 'Last day on foot',
    region: 'Landruk',
    altitude: 1565,
    act: A3,
    bullets: [
      'Jhinu Danda to Landruk.',
    ],
  },
  {
    day: 13,
    title: 'Back to Pokhara',
    region: 'Pokhara',
    altitude: 822,
    act: A4,
    bullets: [
      'Drive back down to Pokhara and the lakeside.',
    ],
  },
  {
    day: 14,
    title: 'Kathmandu again',
    region: 'Kathmandu',
    altitude: 1400,
    act: A4,
    bullets: [
      'Short flight from Pokhara to Kathmandu.',
    ],
  },
  {
    day: 15,
    title: 'Home to Beirut',
    region: 'Beirut',
    altitude: 0,
    act: A4,
    bullets: [
      'Fly home to Beirut.',
    ],
  },
]

export const DAY_COUNT = itinerary.length

export const actOf = (d: ItineraryDay): ActId => d.act.split(' ')[0] as ActId
