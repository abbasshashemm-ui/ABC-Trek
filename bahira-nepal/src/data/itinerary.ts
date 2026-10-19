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
  I: 'ACT I: SACRED VALLEY',
  II: 'ACT II: JUNGLE & LAKE',
  III: 'ACT III: THE SANCTUARY',
  IV: 'ACT IV: FULL CIRCLE',
}

export const ABC_ALTITUDE = 4130

const A1 = 'I — The Sacred Valley'
const A2 = 'II — Jungle & Lake'
const A3 = 'III — The Sanctuary Ascent'
const A4 = 'IV — Full Circle'

export const itinerary: ItineraryDay[] = [
  {
    day: 1,
    title: 'A first taste of Kathmandu',
    region: 'Kathmandu',
    altitude: 1400,
    act: A1,
    bullets: [
      'Arrive and feel the energy of Nepal as you wander through Thamel’s lively streets.',
      'Step into the sacred atmosphere of Pashupatinath Temple.',
    ],
  },
  {
    day: 2,
    title: 'Discover Kathmandu’s spiritual soul',
    region: 'Kathmandu',
    altitude: 1420,
    act: A1,
    bullets: [
      'Explore the Monkey Temple (Swayambhunath), where spirituality meets sweeping city views.',
      'Feel the peaceful rhythm of Boudhanath Stupa.',
    ],
  },
  {
    day: 3,
    title: 'Into the heart of Chitwan',
    region: 'Chitwan',
    altitude: 150,
    act: A2,
    bullets: [
      'Travel to Chitwan and slow down as you discover village life.',
      'Glide along the water on a canoeing adventure, taking in the sounds of nature.',
      'End the day with a traditional musical show celebrating local culture.',
    ],
  },
  {
    day: 4,
    title: 'Adventure in the forest',
    region: 'Chitwan',
    altitude: 150,
    act: A2,
    bullets: [
      'Ride an elephant through Chitwan’s forest, surrounded by greenery.',
      'Set off on a jeep safari and experience the excitement of searching for wildlife.',
    ],
  },
  {
    day: 5,
    title: 'Fall in love with Pokhara',
    region: 'Pokhara',
    altitude: 822,
    act: A2,
    bullets: [
      'Travel to Pokhara and explore its inviting streets and relaxed lakeside atmosphere.',
      'Paddle across Phewa Lake in a kayak, soaking in the beauty around you.',
    ],
  },
  {
    day: 6,
    title: 'From sunrise serenity to sunset wonder',
    region: 'Pokhara',
    altitude: 1100,
    act: A2,
    bullets: [
      'Welcome the day with sunrise at the World Peace Pagoda.',
      'Venture into the mysterious depths of Gupteshwor Mahadev Cave.',
      'Watch the fading light at the Pumdikot Shiva Statue as the sun sets.',
    ],
  },
  {
    day: 7,
    title: 'The Himalayan adventure begins',
    region: 'Sinuwa',
    altitude: 2260,
    act: A3,
    bullets: [
      'Enjoy the drive to Samrung, where your trekking journey begins.',
      'Trek to Sinuwa (2,260 m), embracing the mountain air and the thrill of the trail ahead.',
    ],
  },
  {
    day: 8,
    title: 'Deeper into the mountains',
    region: 'Deurali',
    altitude: 3200,
    act: A3,
    bullets: [
      'Trek from Sinuwa to Deurali (3,200 m), watching the Himalayan landscape unfold with every step.',
    ],
  },
  {
    day: 9,
    title: 'A dream within reach',
    region: 'Annapurna Base Camp',
    altitude: 4130,
    act: A3,
    bullets: [
      'Trek from Deurali to Annapurna Base Camp (ABC, 4,130 m).',
      'Take in the towering peaks and savour the emotion of reaching this unforgettable destination.',
    ],
  },
  {
    day: 10,
    title: 'A new view of a familiar trail',
    region: 'Sinuwa',
    altitude: 2260,
    act: A3,
    bullets: [
      'Trek from ABC to Sinuwa, carrying the memories of base camp as you descend through the mountains.',
    ],
  },
  {
    day: 11,
    title: 'A moment to unwind',
    region: 'Jhinu Danda',
    altitude: 1780,
    act: A3,
    bullets: [
      'Trek from Sinuwa to Jhinu Danda.',
      'Ease your tired muscles in the natural hot springs and enjoy a well-earned moment of relaxation.',
    ],
  },
  {
    day: 12,
    title: 'One more day on the trail',
    region: 'Landruk',
    altitude: 1565,
    act: A3,
    bullets: [
      'Trek from Jhinu Danda to Landruk, savouring the scenery and the simple pleasure of travelling on foot.',
    ],
  },
  {
    day: 13,
    title: 'Back to lakeside life',
    region: 'Pokhara',
    altitude: 822,
    act: A4,
    bullets: [
      'Drive to Pokhara, returning from the mountains with stories and memories to treasure.',
    ],
  },
  {
    day: 14,
    title: 'A return to Kathmandu',
    region: 'Kathmandu',
    altitude: 1400,
    act: A4,
    bullets: ['Fly to Kathmandu, bringing your Himalayan adventure full circle.'],
  },
  {
    day: 15,
    title: 'Home with a heart full of Nepal',
    region: 'Beirut',
    altitude: 0,
    act: A4,
    bullets: [
      'Fly to Beirut, taking home the memories of sacred places, forest adventures and days among the Himalayan peaks.',
    ],
  },
]

export const actOf = (d: ItineraryDay): ActId => d.act.split(' ')[0] as ActId
