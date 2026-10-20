import {
  Plane,
  PlaneLanding,
  ShieldCheck,
  Bus,
  Binoculars,
  PawPrint,
  Waves,
  Bike,
  BedDouble,
  type LucideIcon,
} from 'lucide-react'

export const DEPARTURE = '3 April'
export const PRICE = '$1,570'
/** The land package excludes the international round-trip ticket. */
export const PRICE_EXCLUDES = 'international flight ticket'
export const INSURANCE_PRICE = '$120'
export const SEATS = 9
export interface Contact {
  name: string
  /** As shown on the page. */
  phone: string
  /** WhatsApp link with a greeting prefilled for this person. */
  url: string
}

const contact = (name: string, phone: string): Contact => {
  const digits = phone.replace(/\D/g, '') // wa.me wants international digits only: no +, spaces or dashes
  const message = `Hi ${name}, I'd like to reserve a seat on the ${DEPARTURE} Nepal expedition (${PRICE} + ${PRICE_EXCLUDES}).`
  return { name, phone, url: `https://wa.me/${digits}?text=${encodeURIComponent(message)}` }
}

/** Either guide can take a booking. */
export const CONTACTS: Contact[] = [contact('Hmayed', '+961 71 661 075'), contact('Farhat', '+961 79 183 091')]

export interface Inclusion {
  icon: LucideIcon
  text: string
}

export const inclusions: Inclusion[] = [
  { icon: Bus, text: 'Ground transport' },
  { icon: Binoculars, text: 'Jeep safari' },
  { icon: PawPrint, text: 'Elephant ride' },
  { icon: Waves, text: 'Canoe & kayak' },
  { icon: Bike, text: '2 bike rentals' },
  { icon: BedDouble, text: 'Hotels, breakfast & lunch' },
]

/** Not in the package price; shown next to the inclusions so the total is never a surprise. */
export const extras: (Inclusion & { price?: string })[] = [
  { icon: Plane, text: 'Return flight Beirut to Kathmandu (book separately)' },
  { icon: PlaneLanding, text: 'Domestic flight Pokhara to Kathmandu' },
  { icon: ShieldCheck, text: 'Travel insurance, optional', price: `+${INSURANCE_PRICE}` },
]
