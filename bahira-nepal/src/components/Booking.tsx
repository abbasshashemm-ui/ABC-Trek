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
        'flex w-full items-center justify-center gap-2 rounded-full bg-solar-hi px-6 py-3.5 text-[15px] font-medium text-obsidian transition hover:bg-white sm:inline-flex sm:w-auto',
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
    <section id="booking" className="relative z-10 pb-12 pt-24 md:px-12 md:pb-16 md:pt-32">
      {/* Phones: full-bleed solid panel (a card inside a page gutter wastes ~40px a side). Desktop: floating card. */}
      <div className="mx-auto grid max-w-6xl gap-10 border-y border-white/10 bg-panel px-5 py-10 md:rounded-3xl md:border md:bg-panel/85 md:p-12 md:backdrop-blur-xl lg:grid-cols-[1fr_1.1fr] lg:gap-16">
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

          <h3 className="mt-8 text-sm font-medium text-ink">Not included</h3>
          <ul className={clsx('mt-3', listClass)}>
            {extras.map(({ icon: Icon, text, price }) => (
              <li key={text} className={clsx(rowClass, 'text-ink/70')}>
                <Icon size={17} className="mt-px shrink-0 text-muted" aria-hidden />
                <span className="flex-1">{text}</span>
                {price && <span className="font-mono text-sm text-solar-hi">{price}</span>}
              </li>
            ))}
          </ul>

          {/* Phones read the list after the first button has scrolled away: recap and ask again. */}
          <div className="mt-8 lg:hidden">
            <p className="flex items-baseline justify-between text-sm text-ink/80">
              <span>Per person, without flights</span>
              <span className="font-display tabular text-3xl text-solar-hi">{PRICE}</span>
            </p>
            <p className="mt-1 text-right text-xs text-muted">Travel insurance optional, +{INSURANCE_PRICE}</p>
            <ReserveButton className="mt-5" />
          </div>
        </div>
      </div>
      <p className="mt-10 text-center text-xs text-muted">© Bahira Expeditions</p>
    </section>
  )
}
