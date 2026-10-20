import { ArrowUpRight } from 'lucide-react'
import { inclusions, extras, DEPARTURE, PRICE, SEATS, BOOKING_URL } from '../data/booking'

export default function Booking() {
  return (
    <section id="booking" className="relative z-10 px-4 pb-16 pt-32 md:px-12">
      <div className="mx-auto grid max-w-6xl gap-10 rounded-3xl border border-white/10 bg-panel/85 p-6 backdrop-blur-xl md:p-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
        <div>
          <p className="font-mono text-xs text-sage">{DEPARTURE} · 15 days</p>
          <h2 className="font-display mt-3 text-5xl leading-[1] text-ink md:text-6xl">
            {SEATS} seats on the April departure.
          </h2>

          <p className="mt-8 flex items-baseline gap-3">
            <span className="font-display tabular text-6xl leading-none text-solar-hi">{PRICE}</span>
            <span className="text-sm text-muted">per person</span>
          </p>
          <p className="mt-2 text-sm text-ink/70">International flights to Kathmandu are not included.</p>

          <a
            href={BOOKING_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-solar-hi px-6 py-3 text-sm font-medium text-obsidian transition hover:bg-white"
          >
            Reserve on WhatsApp <ArrowUpRight size={16} aria-hidden />
          </a>
          <p className="mt-3 text-xs text-muted">Opens a chat with Bahira on WhatsApp.</p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-ink">What {PRICE} covers</h3>
          <ul className="mt-4 divide-y divide-white/10 border-y border-white/10">
            {inclusions.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-3 py-3 text-[15px] text-ink/85">
                <Icon size={18} className="mt-0.5 shrink-0 text-sage" aria-hidden />
                {text}
              </li>
            ))}
          </ul>

          <h3 className="mt-8 text-sm font-medium text-ink">Not included</h3>
          <ul className="mt-4 divide-y divide-white/10 border-y border-white/10">
            {extras.map(({ icon: Icon, text, price }) => (
              <li key={text} className="flex items-start gap-3 py-3 text-[15px] text-ink/70">
                <Icon size={18} className="mt-0.5 shrink-0 text-muted" aria-hidden />
                <span className="flex-1">{text}</span>
                <span className="font-mono text-sm text-solar-hi">{price}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <p className="mt-10 text-center text-xs text-muted">© Bahira Expeditions</p>
    </section>
  )
}
