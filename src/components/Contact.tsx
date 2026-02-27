import { useInView } from '../hooks/useInView'

export default function Contact() {
  const { ref, isVisible } = useInView()

  return (
    <section id="contact" className="contact section">
      <div className="container">
        <div ref={ref} className={`reveal ${isVisible ? 'visible' : ''}`}>
          <p className="section-label">Contact</p>
          <h2 className="contact-heading">
            Let&rsquo;s<br />
            <span className="accent">Work</span><br />
            Together
          </h2>
          <div className="contact-links">
            <a
              href="https://github.com/Vansh-Bhardwaj"
              target="_blank"
              rel="noopener noreferrer"
              className="contact-link"
            >
              GitHub
            </a>
            <a
              href="https://www.linkedin.com/in/vansh-bhardwaj-780271221/"
              target="_blank"
              rel="noopener noreferrer"
              className="contact-link"
            >
              LinkedIn
            </a>
            <a
              href="mailto:hello@vanshbhardwaj.dev"
              className="contact-link"
            >
              Email
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
