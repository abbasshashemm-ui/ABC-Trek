import { photosFor } from '../data/photos'

/**
 * Their public trek logs; tracking params stripped from the links the client sent.
 * Portrait: first photo under manifest key `guide-<id>` (e.g. "guide-farhat"); until one is added the
 * row shows the initial. Only use a photo the client confirms is that person.
 */
const GUIDES = [
  { id: 'hmayed', name: 'Hmayed', handle: 'mhmd_hmayed' },
  { id: 'farhat', name: 'Farhat', handle: '_hsenfarhat_' },
]

/** Instagram's glyph (lucide v1 dropped brand icons). */
function InstagramGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
    </svg>
  )
}

function Portrait({ id, name }: { id: string; name: string }) {
  const [photo] = photosFor(`guide-${id}`)
  const ring = 'size-16 shrink-0 rounded-full ring-1 ring-ink/15'
  if (!photo) {
    return (
      <span className={`${ring} font-display flex items-center justify-center bg-ink/[0.06] text-2xl text-ink`} aria-hidden>
        {name[0]}
      </span>
    )
  }
  return (
    <img
      src={photo.src}
      srcSet={photo.srcSet}
      sizes="64px"
      alt={photo.alt}
      loading="lazy"
      decoding="async"
      className={`${ring} object-cover`}
      style={{ objectPosition: photo.focus }}
    />
  )
}

/** "Meet your guides": who leads the trip, what they've walked, and where to see it. */
export default function Guides() {
  return (
    <section
      id="guides"
      className="relative z-10 bg-[linear-gradient(to_bottom,var(--color-obsidian)_75%,transparent)] pb-32 pt-16 md:pt-24"
    >
      <div className="shell grid items-center gap-10 lg:grid-cols-[1fr_1fr] lg:gap-16">
        <div>
          <p className="eyebrow">Your guides</p>
          <h2 className="heading-2 mt-3 text-ink">
            You’ll walk with Hmayed &amp; Farhat.
          </h2>
          <p className="lead mt-6 max-w-md">
            Both are experienced trekkers. They’ve reached Everest Base Camp, walked this trail to Annapurna Base Camp,
            and done many treks besides. This April they lead a small group along the same route.
          </p>
        </div>

        <ul className="pointer-events-auto divide-y divide-ink/10 border-y border-ink/10">
          {GUIDES.map((g) => (
            <li key={g.id} className="flex items-center gap-4 py-4">
              <Portrait id={g.id} name={g.name} />
              <div className="min-w-0 flex-1">
                <p className="font-display text-2xl text-ink">{g.name}</p>
                <p className="text-sm text-muted">Trek leader</p>
              </div>
              <a
                href={`https://www.instagram.com/${g.handle}/`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${g.name} on Instagram, @${g.handle}`}
                className="btn btn-glass h-11 shrink-0 gap-2 px-4 text-sm"
              >
                <InstagramGlyph />
                <span className="max-sm:hidden">@{g.handle}</span>
                <span className="sm:hidden">Instagram</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
