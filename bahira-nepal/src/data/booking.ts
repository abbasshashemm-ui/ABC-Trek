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

export const DEPARTURE = 'April 3'
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
  title: string
  detail: string
}

export const inclusions: Inclusion[] = [
  { icon: PlaneLanding, title: 'Domestic Flight', detail: 'Pokhara to Kathmandu' },
  { icon: Bus, title: 'Ground Transportation', detail: 'Full transfers across Nepal' },
  { icon: Binoculars, title: 'Chitwan Jeep Safari', detail: 'Wildlife expedition' },
  { icon: PawPrint, title: 'Forest Elephant Experience', detail: 'Guided ride through Chitwan' },
  { icon: Waves, title: 'Canoeing & Kayaking', detail: 'Traditional river canoe + Phewa Lake kayak' },
  { icon: Bike, title: '2 Bike Rentals', detail: 'Included in the package' },
  { icon: FileCheck2, title: 'All Permits', detail: 'TIMS & Annapurna Conservation Area' },
  { icon: Compass, title: 'Expert Expedition Guide', detail: 'Full guidance, start to finish' },
  { icon: BedDouble, title: 'Hotels & Teahouses', detail: 'Daily breakfast & lunch included' },
]

/** Not in the package price; shown next to the inclusions so the total is never a surprise. */
export const extras: (Inclusion & { price: string })[] = [
  { icon: Plane, title: 'International flight', detail: 'Round-trip ticket Beirut ⇄ Kathmandu, booked separately', price: 'Not included' },
  { icon: ShieldCheck, title: 'Travel insurance', detail: 'Optional, recommended for high-altitude trekking', price: `+${INSURANCE_PRICE}` },
]
