import { ChevronDown } from 'lucide-react'

export default function Hero() {
  return (
    <section className="pointer-events-none relative z-10 flex h-screen flex-col items-center justify-center px-6 text-center">
      <p className="font-mono text-xs tracking-[0.35em] text-lotus">BEIRUT → ANNAPURNA BASE CAMP</p>
      <h1 className="font-display mt-5 text-5xl font-bold leading-[1.05] text-ink md:text-8xl">
        The <span className="bg-gradient-to-r from-solar to-solar-hi bg-clip-text text-transparent">Golden</span>
        <br />
        Thread
      </h1>
      <p className="mt-6 max-w-xl text-base text-muted md:text-lg">
        Fifteen days. One thread from the Kathmandu valley to 4,130 metres — and home again.
      </p>
      <div className="absolute bottom-10 flex flex-col items-center gap-2 font-mono text-[10px] tracking-[0.3em] text-muted">
        SCROLL
        <ChevronDown size={18} className="animate-bounce" aria-hidden />
      </div>
    </section>
  )
}
