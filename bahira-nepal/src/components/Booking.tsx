import clsx from 'clsx'
import { ArrowUpRight } from 'lucide-react'
import { inclusions, extras, DEPARTURE, PRICE, INSURANCE_PRICE, SEATS, BOOKING_URL } from '../data/booking'

function ReserveButton({ className }: { className?: string }) {
  return (
    <a
      href={BOOKING_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={clsx(
        'btn btn-primary h-12 w-full px-6 text-[15px] sm:w-auto',
        className,
      )}
    >
      Reserve on WhatsApp <ArrowUpRight size={16} aria-hidden />
    </a>
  )
}

const listClass = 'divide-y divide-white/10 border-y border-white/10'
const rowClass = 'flex items-start gap-3 py-2.5 text-sm leading-snug md:py-3 md:text-[15px]'

export default function Booking() {
  return (
    <section id="booking" className="relative z-10 mt-24 bg-panel md:mt-0 md:bg-transparent md:px-12 md:pb-16 md:pt-32">
      {/* Phones: full-bleed solid panel (a card inside a page gutter wastes ~40px a side). Desktop: floating card. */}
      <div className="mx-auto grid max-w-6xl gap-10 border-t border-white/10 bg-panel px-5 pt-10 pb-6 md:rounded-3xl md:border md:bg-panel/85 md:p-12 md:backdrop-blur-xl lg:grid-cols-[1fr_1.1fr] lg:gap-16">
        <div>
          <p className="font-mono text-xs text-sage">{DEPARTURE} · 15 days</p>
          <h2 className="font-display mt-3 text-[2.75rem] leading-[1] text-ink md:text-6xl">
            {SEATS} seats on the April departure.
          </h2>

          <p className="mt-7 flex items-baseline gap-3">
            <span className="font-display tabular text-6xl leading-none text-solar-hi">{PRICE}</span>
            <span className="text-sm text-muted">per person</span>
          </p>
          <p className="mt-2 text-sm text-ink/70">International flights to Kathmandu are not included.</p>

          <ReserveButton className="mt-7" />
          <p className="mt-3 text-center text-xs text-muted sm:text-left">Opens a chat with Bahira on WhatsApp.</p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-ink">What {PRICE} covers</h3>
          <ul className={clsx('mt-3', listClass)}>
            {inclusions.map(({ icon: Icon, text }) => (
              <li key={text} className={clsx(rowClass, 'text-ink/85')}>
                <Icon size={17} className="mt-px shrink-0 text-sage" aria-hidden />
                {text}
              </li>
            ))}
          </ul>

          {/* Phones get the same facts in the summary below, so the list would just repeat it. */}
          <h3 className="mt-8 hidden text-sm font-medium text-ink lg:block">Not included</h3>
          <ul className={clsx('mt-3 hidden lg:block', listClass)}>
            {extras.map(({ icon: Icon, text, price }) => (
              <li key={text} className={clsx(rowClass, 'text-ink/70')}>
                <Icon size={17} className="mt-px shrink-0 text-muted" aria-hidden />
                <span className="flex-1">{text}</span>
                {price && <span className="font-mono text-sm text-solar-hi">{price}</span>}
              </li>
            ))}
          </ul>

          {/* Phones read the list after the first button has scrolled away: total it up and ask again. */}
          <div className="mt-8 lg:hidden">
            <dl className="rounded-2xl bg-white/[0.04] px-4 text-[15px] ring-1 ring-white/10">
              <div className="flex items-baseline justify-between gap-4 border-b border-white/10 py-3.5">
                <dt className="text-ink">Expedition, per person</dt>
                <dd className="font-display tabular text-3xl leading-none text-solar-hi">{PRICE}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-4 border-b border-white/10 py-3">
                <dt className="text-ink/70">International flight</dt>
                <dd className="text-sm text-muted">Book separately</dd>
              </div>
              <div className="flex items-baseline justify-between gap-4 py-3">
                <dt className="text-ink/70">Travel insurance</dt>
                <dd className="text-sm text-muted">Optional, +{INSURANCE_PRICE}</dd>
              </div>
            </dl>
            <ReserveButton className="mt-5" />
            <p className="mt-3 text-center text-xs text-muted">Opens a chat with Bahira on WhatsApp.</p>
          </div>
        </div>
      </div>
      <p className="py-8 pb-[max(2rem,calc(env(safe-area-inset-bottom)+1rem))] text-center text-xs text-muted md:pb-0 md:pt-10">© Bahira Expeditions</p>
    </section>
  )
}
