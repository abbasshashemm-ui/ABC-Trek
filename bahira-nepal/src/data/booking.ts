import {
  Plane,
  PlaneLanding,
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
export const PRICE = '$2,500'
export const SEATS = 9
/** International format, digits only (wa.me requires no +, spaces or dashes). */
export const WHATSAPP_NUMBER = '96171661075'
const WHATSAPP_MESSAGE = `Hi Bahira, I'd like to reserve a seat on the ${DEPARTURE} Nepal expedition (${PRICE}).`
export const BOOKING_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`

export interface Inclusion {
  icon: LucideIcon
  title: string
  detail: string
}

export const inclusions: Inclusion[] = [
  { icon: Plane, title: 'International Flights', detail: 'Round-trip from & to Beirut' },
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
