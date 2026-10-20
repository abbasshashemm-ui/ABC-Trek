import { forwardRef, useLayoutEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { itinerary } from '../data/itinerary'
import DayStop from './DayStop'

gsap.registerPlugin(ScrollTrigger)

const Journey = forwardRef<HTMLElement>(function Journey(_, ref) {
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
      {itinerary.map((item, i) => (
        <DayStop key={item.day} item={item} side={i % 2 === 0 ? 'left' : 'right'} />
      ))}
    </section>
  )
})

export default Journey
