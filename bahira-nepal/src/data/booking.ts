import {
  Plane,
  PlaneLanding,
  ShieldCheck,
  Bus,
  Binoculars,
  PawPrint,
  Waves,
  Bike,
  FileCheck2,
  Compass,
  BedDouble,
  type LucideIcon,
} from 'lucide-react'

export const DEPARTURE = '3 April'
export const PRICE = '$1,570'
/** The land package excludes the international round-trip ticket. */
export const PRICE_EXCLUDES = 'international flight ticket'
export const INSURANCE_PRICE = '$120'
export const SEATS = 9
/** International format, digits only (wa.me requires no +, spaces or dashes). */
export const WHATSAPP_NUMBER = '96171661075'
const WHATSAPP_MESSAGE = `Hi Bahira, I'd like to reserve a seat on the ${DEPARTURE} Nepal expedition (${PRICE} + ${PRICE_EXCLUDES}).`
export const BOOKING_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`

export interface Inclusion {
  icon: LucideIcon
  text: string
}

export const inclusions: Inclusion[] = [
  { icon: PlaneLanding, text: 'Domestic flight' },
  { icon: Bus, text: 'Ground transport' },
  { icon: Binoculars, text: 'Jeep safari' },
  { icon: PawPrint, text: 'Elephant ride' },
  { icon: Waves, text: 'Canoe & kayak' },
  { icon: Bike, text: '2 bike rentals' },
  { icon: FileCheck2, text: 'Trek permits' },
  { icon: Compass, text: 'Expedition guide' },
  { icon: BedDouble, text: 'Hotels, breakfast & lunch' },
]

/** Not in the package price; shown next to the inclusions so the total is never a surprise. */
export const extras: (Inclusion & { price?: string })[] = [
  { icon: Plane, text: 'Return flight Beirut to Kathmandu (book separately)' },
  { icon: ShieldCheck, text: 'Travel insurance, optional', price: `+${INSURANCE_PRICE}` },
]
