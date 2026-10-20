import clsx from 'clsx'
import { ArrowUpRight } from 'lucide-react'
import { inclusions, extras, DEPARTURE, PRICE, INSURANCE_PRICE, SEATS, CONTACTS } from '../data/booking'

/** One WhatsApp button per guide; either can take the booking. */
function ReserveButtons({ className }: { className?: string }) {
  return (
    <div className={clsx('grid grid-cols-2 gap-2 sm:max-w-sm', className)}>
      {CONTACTS.map((c) => (
        <a
          key={c.name}
          href={c.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Reserve on WhatsApp with ${c.name}, ${c.phone}`}
          // Same style for both: neither guide is the "main" contact.
          className="btn btn-primary h-auto flex-col gap-0.5 px-4 py-3"
        >
          <span className="inline-flex items-center gap-1.5 text-[15px]">
            {c.name} <ArrowUpRight size={15} aria-hidden />
          </span>
          <span className="tabular text-xs font-normal opacity-70">{c.phone}</span>
        </a>
      ))}
    </div>
  )
}

const listClass = 'divide-y divide-ink/10 border-y border-ink/10'
const rowClass = 'flex items-start gap-3 py-2.5 text-sm leading-snug md:py-3 md:text-[15px]'

export default function Booking() {
  return (
    <section id="booking" className="relative z-10 mt-24 bg-panel md:mt-0 md:bg-transparent md:pb-16 md:pt-32">
      {/* Phones: full-bleed solid panel (a card inside a page gutter wastes ~40px a side). Desktop: floating card. */}
      <div className="md:shell">
      <div className="grid gap-10 border-t border-ink/10 bg-panel px-5 pt-10 pb-6 md:rounded-3xl md:border md:bg-panel/85 md:p-12 md:backdrop-blur-xl lg:grid-cols-[1fr_1.1fr] lg:gap-16">
        <div>
          <p className="eyebrow">{DEPARTURE} · 15 days</p>
          <h2 className="heading-2 mt-3 text-ink">
            {SEATS} seats on the April departure.
          </h2>

          <p className="mt-7 flex items-baseline gap-3">
            <span className="figure text-6xl text-ember">{PRICE}</span>
            <span className="text-sm text-muted">per person</span>
          </p>
          <p className="mt-2 text-sm text-muted">International flights to Kathmandu are not included.</p>

          <p className="mt-7 text-sm text-ink">Reserve on WhatsApp with</p>
          <ReserveButtons className="mt-3" />
        </div>

        <div>
          <h3 className="text-sm font-semibold text-ink">What {PRICE} covers</h3>
          {/* 9 perks = an even 3×3 at every width, so no orphan tile */}
          <ul className="mt-3 grid grid-cols-3 gap-2">
            {inclusions.map(({ icon: Icon, text }) => (
              <li
                key={text}
                className="flex flex-col gap-2 rounded-xl bg-ink/[0.04] p-3 text-[13px] leading-tight text-ink/85 ring-1 ring-ink/10 md:text-sm"
              >
                <Icon size={18} className="text-ember" aria-hidden />
                {text}
              </li>
            ))}
          </ul>

          {/* Phones get the same facts in the summary below, so the list would just repeat it. */}
          <h3 className="mt-8 hidden text-sm font-semibold text-ink lg:block">Not included</h3>
          <ul className={clsx('mt-3 hidden lg:block', listClass)}>
            {extras.map(({ icon: Icon, text, price }) => (
              <li key={text} className={clsx(rowClass, 'text-ink/70')}>
                <Icon size={17} className="mt-px shrink-0 text-muted" aria-hidden />
                <span className="flex-1">{text}</span>
                {price && <span className="tabular text-sm font-semibold text-ember">{price}</span>}
              </li>
            ))}
          </ul>

          {/* Phones read the list after the first button has scrolled away: total it up and ask again. */}
          <div className="mt-8 lg:hidden">
            <dl className="rounded-2xl bg-ink/[0.04] px-4 text-[15px] ring-1 ring-ink/10">
              <div className="flex items-baseline justify-between gap-4 border-b border-ink/10 py-3.5">
                <dt className="text-ink">Expedition, per person</dt>
                <dd className="figure text-3xl text-ember">{PRICE}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-4 border-b border-ink/10 py-3">
                <dt className="text-ink/70">International flight</dt>
                <dd className="text-sm text-muted">Book separately</dd>
              </div>
              <div className="flex items-baseline justify-between gap-4 py-3">
                <dt className="text-ink/70">Travel insurance</dt>
                <dd className="text-sm text-muted">Optional, +{INSURANCE_PRICE}</dd>
              </div>
            </dl>
            <p className="mt-5 text-center text-sm text-ink">Reserve on WhatsApp with</p>
            <ReserveButtons className="mt-3" />
          </div>
        </div>
      </div>
      </div>
      <p className="py-8 pb-[max(2rem,calc(env(safe-area-inset-bottom)+1rem))] text-center text-xs text-muted md:pb-0 md:pt-10">© Bahira Expeditions</p>
    </section>
  )
}
