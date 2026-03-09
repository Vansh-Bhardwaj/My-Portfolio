import { useEffect, useRef } from 'react'
import { haptic } from '../hooks/useHaptics'

function SplitLine({ text, baseDelay, className = '' }: { text: string; baseDelay: number; className?: string }) {
  return (
    <span className={`split-line ${className}`}>
      {text.split('').map((char, i) => (
        <span
          key={i}
          className="char"
          style={{ animationDelay: `${baseDelay + i * 0.04}s` }}
        >
          {char}
        </span>
      ))}
    </span>
  )
}

export default function Hero() {
  const nameRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    const SCROLL_RANGE = 0.6
    const LERP_FACTOR = 0.08
    let current = 0
    let target = 0
    let rafId = 0

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t

    const updateTarget = () => {
      const vh = window.innerHeight
      target = Math.min(Math.max(window.scrollY / (vh * SCROLL_RANGE), 0), 1)
    }

    const animate = () => {
      current = lerp(current, target, LERP_FACTOR)

      if (Math.abs(current - target) < 0.0001) current = target

      const el = nameRef.current
      if (el) {
        el.style.letterSpacing = `${-0.04 + current * 0.15}em`
        el.style.opacity = `${1 - current * 0.7}`
        el.style.transform = `translateY(${current * -30}px) scale(${1 + current * 0.05})`
      }

      rafId = requestAnimationFrame(animate)
    }

    window.addEventListener('scroll', updateTarget, { passive: true })
    updateTarget()
    rafId = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('scroll', updateTarget)
      cancelAnimationFrame(rafId)
    }
  }, [])

  const go = (e: React.MouseEvent<HTMLAnchorElement>, target: string) => {
    e.preventDefault()
    haptic('light')
    const el = document.querySelector(target)
    if (el) {
      window.scrollTo({ top: (el as HTMLElement).offsetTop })
    }
  }

  return (
    <section className="hero">
      <p className="hero-label animate-in" style={{ animationDelay: '0.8s' }}>
        Software Developer &amp; Creative Technologist
      </p>
      <h1 className="hero-name" ref={nameRef}>
        <SplitLine text="Vansh" baseDelay={1.0} />
        <SplitLine text="Bhardwaj" baseDelay={1.3} className="stroke" />
      </h1>
      <p className="hero-desc animate-in" style={{ animationDelay: '1.8s' }}>
        I build products people actually use &mdash; from production web apps
        and open-source tools to VR experiences and published games.
      </p>
      <div className="hero-cta animate-in" style={{ animationDelay: '2.0s' }}>
        <a href="#work" className="hero-cta-primary" onClick={(e) => go(e, '#work')}>
          View Projects
        </a>
        <a href="#contact" className="hero-cta-secondary" onClick={(e) => go(e, '#contact')}>
          Get in Touch
        </a>
      </div>
      <span className="hero-scroll animate-in" style={{ animationDelay: '2.2s' }}>Scroll</span>
    </section>
  )
}
