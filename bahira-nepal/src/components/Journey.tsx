import { forwardRef, useLayoutEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { itinerary } from '../data/itinerary'
import WaypointCard from './WaypointCard'

gsap.registerPlugin(ScrollTrigger)

const Journey = forwardRef<HTMLElement>(function Journey(_, ref) {
  useLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('[data-card]').forEach((card) => {
        gsap.from(card, {
          opacity: 0,
          y: 48,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: { trigger: card, start: 'top 85%', toggleActions: 'play none none reverse' },
        })
      })
    })
    return () => ctx.revert()
  }, [])

  return (
    <section ref={ref} id="journey" className="pointer-events-none relative z-10">
      {itinerary.map((item, i) => (
        <div
          key={item.day}
          className="flex min-h-[110vh] items-center px-4 pb-10 pt-24 md:px-16 md:pr-40"
        >
          <WaypointCard item={item} side={i % 2 === 0 ? 'left' : 'right'} />
        </div>
      ))}
    </section>
  )
})

export default Journey
