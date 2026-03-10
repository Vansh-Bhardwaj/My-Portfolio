import { useRef } from 'react'
import { useInView } from '../hooks/useInView'
import { haptic } from '../hooks/useHaptics'
import CoffeeMug from './CoffeeMug'

function MagneticLink({ href, children, className = '', ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  const linkRef = useRef<HTMLAnchorElement>(null)

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const el = linkRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    el.style.setProperty('--mx', `${x * 0.3}px`)
    el.style.setProperty('--my', `${y * 0.3}px`)
  }

  const handleMouseLeave = () => {
    const el = linkRef.current
    if (!el) return
    el.style.setProperty('--mx', '0px')
    el.style.setProperty('--my', '0px')
  }

  return (
    <a
      {...props}
      ref={linkRef}
      href={href}
      className={`magnetic ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={() => haptic('light')}
    >
      {children}
    </a>
  )
}

export default function Contact() {
  const { ref, isVisible } = useInView()

  return (
    <section id="contact" className="contact section">
      <div className="container">
        <div ref={ref} className={`reveal ${isVisible ? 'visible' : ''}`}>
          <p className="section-label"><span className="section-num">06</span> Contact</p>
          <h2 className="contact-heading">
            Let&rsquo;s<br />
            <span className="accent">Work</span><br />
            Together
          </h2>
          <p className="contact-desc">
            Open to product roles, creative collaborations, and challenging
            technical problems. If it ships and it matters, I&rsquo;m interested.
            <CoffeeMug size={15} style={{ marginLeft: 6, opacity: 0.25 }} />
          </p>
          <div className="contact-links">
            <MagneticLink
              href="mailto:work.vanshbhardwaj@gmail.com"
              className="contact-link"
            >
              work.vanshbhardwaj@gmail.com
            </MagneticLink>
            <MagneticLink
              href="https://www.linkedin.com/in/vansh-bhardwaj-780271221/"
              target="_blank"
              rel="noopener noreferrer"
              className="contact-link"
            >
              LinkedIn
            </MagneticLink>
            <MagneticLink
              href="https://github.com/Vansh-Bhardwaj"
              target="_blank"
              rel="noopener noreferrer"
              className="contact-link"
            >
              GitHub
            </MagneticLink>
            <MagneticLink
              href="https://twitter.com/I_Am_VanshBh"
              target="_blank"
              rel="noopener noreferrer"
              className="contact-link"
            >
              Twitter
            </MagneticLink>
          </div>
        </div>
      </div>
    </section>
  )
}
