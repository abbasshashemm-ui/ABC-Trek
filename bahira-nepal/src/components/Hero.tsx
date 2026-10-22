import { ArrowDown } from 'lucide-react'
import { DEPARTURE, PRICE, SEATS } from '../data/booking'
import { ABC_ALTITUDE } from '../data/itinerary'
import { scrollToId } from '../state/scrollApi'

const FACTS = [
  { value: '15', label: 'days' },
  { value: `${ABC_ALTITUDE.toLocaleString('en-US')} m`, label: 'highest point' },
  { value: String(SEATS), label: 'seats' },
  { value: PRICE, label: 'plus flights' },
]

export default function Hero() {
  // Phones: copy starts under the header and the facts end above Safari's floating toolbar (iOS 26 draws it over
  // the page), so nothing on the first screen is half-covered. Desktop keeps the copy on the valley floor.
  return (
    <section className="pointer-events-none relative z-10 flex min-h-svh items-start md:items-end">
      {/* Dark floor under the copy so it reads over the 3D valley without hiding it */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(to_top,var(--color-obsidian)_0%,rgb(13_15_14/0.85)_30%,rgb(13_15_14/0.45)_62%,transparent_88%)]"
      />

      <div className="shell relative [text-shadow:0_1px_3px_rgb(13_15_14/0.6),0_2px_24px_rgb(13_15_14/0.85)] pb-[calc(env(safe-area-inset-bottom)+6rem)] pt-[calc(env(safe-area-inset-top)+5.5rem)] md:pb-20 md:pt-32">
        <p className="eyebrow">Nepal · departs {DEPARTURE}</p>

        <h1 className="heading-1 mt-4 max-w-4xl text-ink">
          From Beirut to the foot of <span className="text-gold">Annapurna</span>.
        </h1>

        <p className="lead mt-6 max-w-xl">
          Kathmandu’s temples, the Chitwan jungle and two days on Phewa Lake, then six days on foot up the Modi
          Khola to Annapurna Base Camp and back. A small group, with a guide the whole way.
        </p>

        <div className="pointer-events-auto mt-8 flex flex-wrap items-center gap-2.5 md:gap-3">
          {/* Goes to booking, where both guides' WhatsApp numbers sit next to the price */}
          <button type="button" onClick={() => scrollToId('booking')} className="btn btn-primary h-12 px-5 text-[15px] md:px-6">
            Reserve a seat <ArrowDown size={16} aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => scrollToId('journey')}
            className="btn btn-glass h-12 px-5 text-[15px] md:px-6"
          >
            See the 15 days <ArrowDown size={16} aria-hidden />
          </button>
        </div>

        <dl className="mt-8 grid max-w-4xl grid-cols-2 gap-x-8 gap-y-4 border-t border-ink/15 pt-5 sm:grid-cols-4 md:mt-12 md:gap-y-6 md:pt-6">
          {FACTS.map((f) => (
            <div key={f.label} className="flex flex-col-reverse">
              <dt className="mt-1 text-sm text-muted md:mt-2">{f.label}</dt>
              <dd className="figure text-3xl text-ink md:text-5xl">{f.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
