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
  return (
    <section className="pointer-events-none relative z-10 flex min-h-svh items-end">
      {/* Dark floor under the copy so it reads over the 3D valley without hiding it */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(to_top,var(--color-obsidian)_0%,rgb(10_17_14/0.85)_30%,rgb(10_17_14/0.45)_62%,transparent_88%)]"
      />

      <div className="relative mx-auto w-full max-w-[1400px] [text-shadow:0_1px_3px_rgb(10_17_14/0.6),0_2px_24px_rgb(10_17_14/0.85)] px-5 pb-[max(3.5rem,calc(env(safe-area-inset-bottom)+2rem))] pt-32 md:px-12 md:pb-20">
        <p className="font-mono text-xs text-sage">Nepal · departs {DEPARTURE}</p>

        <h1 className="font-display mt-4 max-w-4xl text-[clamp(2.75rem,8vw,6.5rem)] leading-[0.95] text-ink">
          From Beirut to the foot of <em className="text-solar-hi">Annapurna</em>.
        </h1>

        <p className="mt-6 max-w-xl text-base leading-relaxed text-ink/75 md:text-lg">
          Kathmandu’s temples, the Chitwan jungle and two days on Phewa Lake, then six days on foot up the Modi
          Khola to Annapurna Base Camp and back. A small group, with a guide the whole way.
        </p>

        <div className="pointer-events-auto mt-8 flex flex-wrap items-center gap-3">
          {/* Goes to booking, where both guides' WhatsApp numbers sit next to the price */}
          <button type="button" onClick={() => scrollToId('booking')} className="btn btn-primary h-12 px-6 text-[15px]">
            Reserve a seat <ArrowDown size={16} aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => scrollToId('journey')}
            className="btn btn-glass h-12 px-6 text-[15px]"
          >
            See the 15 days <ArrowDown size={16} aria-hidden />
          </button>
        </div>

        <dl className="mt-12 grid max-w-3xl grid-cols-2 gap-x-8 gap-y-6 border-t border-white/15 pt-6 sm:grid-cols-4">
          {FACTS.map((f) => (
            <div key={f.label} className="flex flex-col-reverse">
              <dt className="mt-2 text-xs text-muted">{f.label}</dt>
              <dd className="font-display tabular text-4xl leading-none text-ink md:text-5xl">{f.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
