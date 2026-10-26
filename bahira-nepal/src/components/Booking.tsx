import { ArrowUpRight } from 'lucide-react'
import { inclusions, DEPARTURE, PRICE, INSURANCE_PRICE, SEATS, CONTACTS } from '../data/booking'

/**
 * The closing call to action: one compact, translucent card over the summit scene.
 * Price, what it covers, and one WhatsApp button per guide, each shown once.
 */
export default function Booking() {
  return (
    <section id="booking" className="relative z-10 px-4 pt-24 md:pt-32">
      <div className="booking-card mx-auto max-w-xl rounded-3xl p-6 ring-1 ring-ink/10 md:p-8">
        <p className="eyebrow">
          {DEPARTURE} · 15 days · {SEATS} seats
        </p>

        <p className="mt-3 flex items-baseline gap-2.5">
          <span className="figure text-5xl text-ember md:text-6xl">{PRICE}</span>
          <span className="text-sm text-muted">per person</span>
        </p>
        <p className="mt-2 text-[13px] leading-snug text-muted">
          International flights to Kathmandu not included. Travel insurance optional, +{INSURANCE_PRICE}.
        </p>

        <h2 className="mt-6 text-[13px] font-semibold text-ink">What {PRICE} covers</h2>
        <ul className="mt-2.5 flex flex-wrap gap-1.5">
          {inclusions.map(({ icon: Icon, text }) => (
            <li
              key={text}
              className="inline-flex items-center gap-1.5 rounded-full bg-ink/[0.06] py-1.5 pl-2.5 pr-3 text-[13px] leading-none text-ink/85 ring-1 ring-ink/10"
            >
              <Icon size={14} className="shrink-0 text-ember" aria-hidden />
              {text}
            </li>
          ))}
        </ul>

        <p className="mt-6 text-[13px] font-semibold text-ink">Reserve on WhatsApp with</p>
        {/* Either guide can take the booking, so both buttons look the same. */}
        <div className="mt-2.5 grid grid-cols-2 gap-2">
          {CONTACTS.map((c) => (
            <a
              key={c.name}
              href={c.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Reserve on WhatsApp with ${c.name}, ${c.phone}`}
              className="btn btn-primary h-auto flex-col gap-0.5 px-3 py-2.5"
            >
              <span className="inline-flex items-center gap-1.5 text-[15px]">
                {c.name} <ArrowUpRight size={15} aria-hidden />
              </span>
              <span className="tabular text-xs font-normal opacity-70">{c.phone}</span>
            </a>
          ))}
        </div>
      </div>

      <footer className="py-8 pb-[max(2rem,calc(env(safe-area-inset-bottom)+1rem))] text-center text-xs text-muted">
        {/* Sits over the bright 3D terrain, so it gets a dark backing (the Quantex wordmark is white). */}
        <div className="inline-block rounded-2xl bg-obsidian/70 px-6 py-3 backdrop-blur-md">
          <p>© Bahira Expeditions</p>
          <p className="mt-3 flex items-center justify-center gap-2">
            Website by
            <a
              href="https://quantexai.solutions"
              target="_blank"
              rel="noopener"
              aria-label="Quantex AI Solutions"
              title="Quantex AI Solutions"
              className="opacity-75 transition-opacity hover:opacity-100 focus-visible:opacity-100"
            >
              <img src="/quantex-logo.png" alt="" width={158} height={38} loading="lazy" className="h-3.5 w-auto" />
            </a>
          </p>
        </div>
      </footer>
    </section>
  )
}
