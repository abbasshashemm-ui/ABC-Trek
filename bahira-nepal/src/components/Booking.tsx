import { CalendarDays, ArrowRight } from 'lucide-react'
import { inclusions, extras, DEPARTURE, PRICE, PRICE_EXCLUDES, SEATS, BOOKING_URL } from '../data/booking'

export default function Booking() {
  return (
    <section id="booking" className="relative z-10 px-4 pb-24 pt-32 md:px-16">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-3xl border border-white/10 bg-panel/80 p-8 backdrop-blur-xl md:p-14">
          <p className="font-mono text-xs tracking-[0.3em] text-sage">THE EXPEDITION</p>
          <h2 className="font-display mt-3 max-w-3xl text-4xl font-bold leading-tight md:text-6xl">
            The Himalayas Call. Only {SEATS} Seats Available.
          </h2>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm">
              <CalendarDays size={16} className="text-solar" aria-hidden />
              Departure: <strong>{DEPARTURE}</strong>
            </span>
            <span className="font-mono text-3xl font-bold text-solar-hi">{PRICE}</span>
            <span className="text-sm text-muted">per person + {PRICE_EXCLUDES}</span>
          </div>

          <h3 className="mt-10 font-mono text-xs tracking-[0.25em] text-sage">INCLUDED IN {PRICE}</h3>
          <ul className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-3">
            {inclusions.map(({ icon: Icon, title, detail }) => (
              <li
                key={title}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition sm:p-5 hover:border-solar/50 hover:bg-white/[0.06]"
              >
                <Icon size={22} className="text-sage" aria-hidden />
                <h3 className="mt-4 text-sm font-semibold text-ink">{title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-muted">{detail}</p>
              </li>
            ))}
          </ul>

          <h3 className="mt-10 font-mono text-xs tracking-[0.25em] text-muted">NOT INCLUDED</h3>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {extras.map(({ icon: Icon, title, detail, price }) => (
              <li key={title} className="flex items-start gap-4 rounded-2xl border border-dashed border-white/15 p-5">
                <Icon size={22} className="mt-0.5 shrink-0 text-muted" aria-hidden />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h4 className="text-sm font-semibold text-ink">{title}</h4>
                    <span className="font-mono text-sm text-solar-hi">{price}</span>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-muted">{detail}</p>
                </div>
              </li>
            ))}
          </ul>

          <a
            href={BOOKING_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-10 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-solar to-solar-hi px-8 py-4 text-sm font-semibold text-obsidian shadow-[0_0_40px_rgba(255,138,0,0.4)] transition hover:brightness-110"
          >
            Reserve your seat on WhatsApp <ArrowRight size={16} aria-hidden />
          </a>
        </div>
        <p className="mt-10 text-center font-mono text-[10px] tracking-[0.25em] text-muted">
          © BAHIRA EXPEDITIONS
        </p>
      </div>
    </section>
  )
}
