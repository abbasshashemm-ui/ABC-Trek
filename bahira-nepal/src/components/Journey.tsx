import { forwardRef, useEffect, useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { itinerary } from '../data/itinerary'
import DayStop from './DayStop'

gsap.registerPlugin(ScrollTrigger)

/** 0 → 1 over the first/last 60% of a screen as the journey enters and leaves. */
const fade = (px: number, vh: number) => Math.min(1, Math.max(0, px / (vh * 0.6)))

const Journey = forwardRef<HTMLElement>(function Journey(_, ref) {
  const tint = useRef<HTMLDivElement>(null)

  // One tint for the whole journey (not one scrim per day), so the valley looks the same
  // from Day 1 to Day 15: it only fades in as the journey starts and out as booking arrives.
  useEffect(() => {
    let raf = 0
    const tick = () => {
      const section = tint.current?.parentElement
      if (section && tint.current) {
        const vh = window.innerHeight
        const r = section.getBoundingClientRect()
        tint.current.style.opacity = String(Math.min(fade(vh - r.top, vh), fade(r.bottom, vh)))
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  // Quiet entrance: text settles in once, no bounce.
  useLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
        gsap.from(el, {
          opacity: 0,
          y: 24,
          duration: 1.1,
          ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 80%', toggleActions: 'play none none reverse' },
        })
      })
    })
    return () => ctx.revert()
  }, [])

  return (
    <section ref={ref} id="journey" className="pointer-events-none relative z-10">
      <div
        ref={tint}
        aria-hidden
        // Tint as a gradient image, not a background-color: Safari 26 paints the colour of a fixed element at the
        // top edge into the status bar, which turned it into a black band above the 3D scene.
        className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-lvh bg-[linear-gradient(rgb(13_15_14/0.2),rgb(13_15_14/0.2))] opacity-0"
      />
      {itinerary.map((item, i) => (
        <DayStop key={item.day} item={item} side={i % 2 === 0 ? 'left' : 'right'} />
      ))}
    </section>
  )
})

export default Journey
