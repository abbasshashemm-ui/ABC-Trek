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
/** Wire this to the real checkout / WhatsApp / form URL. */
export const BOOKING_URL = '#booking'

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
