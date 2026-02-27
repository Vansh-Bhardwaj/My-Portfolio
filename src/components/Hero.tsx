import { useEffect, useRef } from 'react'

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
    const handleScroll = () => {
      const el = nameRef.current
      if (!el) return
      const scrollY = window.scrollY
      const vh = window.innerHeight
      const progress = Math.min(scrollY / (vh * 0.6), 1)
      
      el.style.letterSpacing = `${-0.04 + progress * 0.15}em`
      el.style.opacity = `${1 - progress * 0.7}`
      el.style.transform = `translateY(${progress * -30}px) scale(${1 + progress * 0.05})`
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const go = (e: React.MouseEvent<HTMLAnchorElement>, target: string) => {
    e.preventDefault()
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
