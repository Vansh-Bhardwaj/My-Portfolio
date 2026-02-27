import { useEffect, useState } from 'react'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 100)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const go = (e: React.MouseEvent<HTMLAnchorElement>, target: string) => {
    e.preventDefault()
    setMenuOpen(false)
    const el = document.querySelector(target)
    if (el) {
      window.scrollTo({ top: (el as HTMLElement).offsetTop })
    } else {
      window.scrollTo({ top: 0 })
    }
  }

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <a href="#" className="nav-logo" onClick={(e) => go(e, 'body')}>VB</a>
      <button
        className={`nav-toggle ${menuOpen ? 'open' : ''}`}
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle menu"
      >
        <span /><span /><span />
      </button>
      <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
        <a href="#about" onClick={(e) => go(e, '#about')}>About</a>
        <a href="#work" onClick={(e) => go(e, '#work')}>Work</a>
        <a href="#creative" onClick={(e) => go(e, '#creative')}>Creative</a>
        <a href="#contact" onClick={(e) => go(e, '#contact')}>Contact</a>
      </div>
    </nav>
  )
}
