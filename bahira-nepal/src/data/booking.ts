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
  { icon: PlaneLanding, text: 'Domestic flight, Pokhara to Kathmandu' },
  { icon: Bus, text: 'All ground transport inside Nepal' },
  { icon: Binoculars, text: 'Jeep safari in Chitwan National Park' },
  { icon: PawPrint, text: 'Elephant ride through the Chitwan forest' },
  { icon: Waves, text: 'River canoe in Chitwan, kayak on Phewa Lake' },
  { icon: Bike, text: 'Two bike rentals' },
  { icon: FileCheck2, text: 'TIMS card and Annapurna Conservation Area permit' },
  { icon: Compass, text: 'An expedition guide for the whole trip' },
  { icon: BedDouble, text: 'Hotels and mountain teahouses, breakfast and lunch every day' },
]

/** Not in the package price; shown next to the inclusions so the total is never a surprise. */
export const extras: (Inclusion & { price: string })[] = [
  { icon: Plane, text: 'Return flight Beirut to Kathmandu, booked separately', price: 'Not included' },
  { icon: ShieldCheck, text: 'Travel insurance, optional', price: `+${INSURANCE_PRICE}` },
]
