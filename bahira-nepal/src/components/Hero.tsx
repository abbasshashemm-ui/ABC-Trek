import { ArrowDown } from 'lucide-react'
import { DEPARTURE, SEATS } from '../data/booking'
import { ABC_ALTITUDE } from '../data/itinerary'
import { scrollToId } from '../state/scrollApi'

const FACTS = [
  { value: '15', label: 'days' },
  { value: `${ABC_ALTITUDE.toLocaleString('en-US')} m`, label: 'highest point' },
  { value: String(SEATS), label: 'seats' },
]

export default function Hero() {
  // Same translucent card as the booking section, so the page opens and closes with one look; the price lives
  // only in booking. Phones: the card starts under the header and ends above Safari's floating toolbar (iOS 26
  // draws it over the page), so nothing on the first screen is half-covered. Desktop keeps it on the valley floor.
  return (
    <section className="pointer-events-none relative z-10 flex min-h-svh items-start md:items-end">
      <div className="shell relative pb-[calc(env(safe-area-inset-bottom)+6rem)] pt-[calc(env(safe-area-inset-top)+5.5rem)] md:pb-20 md:pt-32">
        <div className="booking-card max-w-2xl rounded-3xl p-5 ring-1 ring-ink/10 md:p-8">
          <p className="eyebrow">Nepal · departs {DEPARTURE}</p>

          <h1 className="mt-3 font-display text-[2.25rem] font-[420] leading-none tracking-[-0.025em] text-ink md:text-6xl">
            From Beirut to the foot of <span className="text-gold">Annapurna</span>.
          </h1>

          <p className="mt-3 text-sm leading-relaxed text-ink/78 md:mt-5 md:text-base">
            Kathmandu’s temples, the Chitwan jungle and two days on Phewa Lake, then six days on foot up the Modi
            Khola to Annapurna Base Camp and back. A small group, with a guide the whole way.
          </p>

          <dl className="mt-4 flex gap-8 border-t border-ink/10 pt-4 md:mt-6 md:gap-14 md:pt-5">
            {FACTS.map((f) => (
              <div key={f.label} className="flex flex-col-reverse">
                <dt className="mt-1 text-[13px] text-muted">{f.label}</dt>
                <dd className="figure whitespace-nowrap text-[1.75rem] text-ink md:text-4xl">{f.value}</dd>
              </div>
            ))}
          </dl>

          <div className="pointer-events-auto mt-5 grid grid-cols-2 gap-2 md:mt-6">
            {/* Goes to booking, where the price and both guides' WhatsApp numbers sit */}
            <button type="button" onClick={() => scrollToId('booking')} className="btn btn-primary h-12 whitespace-nowrap px-2 text-sm md:text-[15px]">
              Reserve a seat <ArrowDown size={16} aria-hidden />
            </button>
            <button type="button" onClick={() => scrollToId('journey')} className="btn btn-glass h-12 whitespace-nowrap px-2 text-sm md:text-[15px]">
              See the 15 days <ArrowDown size={16} aria-hidden />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
