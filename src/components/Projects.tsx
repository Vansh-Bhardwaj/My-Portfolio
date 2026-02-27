import { useEffect, useRef, useState } from 'react'

interface Project {
  num: string
  title: string
  subtitle: string
  desc: string
  year: string
  url: string
  role: string
  tech: string[]
  preview: 'iframe' | 'image'
  image?: string
}

const projects: Project[] = [
  {
    num: '01',
    title: 'Centuary Sofas',
    subtitle: 'Simapt \u00D7 Centuary India',
    desc: 'Responsive product configurator with 3D visualization, enabling customers to customize and explore sofa designs interactively. Built for India\u2019s leading mattress brand.',
    year: '2025',
    url: 'https://sofa.centuaryindia.com',
    role: 'Frontend Developer at Simapt',
    tech: ['React', 'TypeScript', '3D Web'],
    preview: 'image',
    image: '/preview-centuary.webp',
  },
  {
    num: '02',
    title: 'DebridUI',
    subtitle: 'Open Source Project',
    desc: 'Modern debrid client with built-in playback, continue watching, subtitle support, and media discovery. Edge-deployed on Cloudflare Workers.',
    year: '2025',
    url: 'https://debrid.indevs.in',
    role: 'Creator',
    tech: ['Next.js', 'TypeScript', 'Cloudflare'],
    preview: 'image',
    image: '/preview-debrid.webp',
  },
  {
    num: '03',
    title: 'AllVarity Studio',
    subtitle: 'Game Studio',
    desc: 'Co-founded a mobile game studio and built its web presence from the ground up. Creating engaging gaming experiences for players worldwide.',
    year: '2025',
    url: 'https://allvaritygames.com',
    role: 'Co-Founder & Lead Developer',
    tech: ['Next.js', 'Unity', 'Game Dev'],
    preview: 'iframe',
  },
]

function getHostname(url: string): string {
  try {
    return new URL(url).hostname
  } catch {
    return url
  }
}

function BrowserMockup({ project }: { project: Project }) {
  const [iframeLoaded, setIframeLoaded] = useState(false)

  return (
    <div className="browser-frame">
      <div className="browser-bar">
        <div className="browser-dots">
          <span /><span /><span />
        </div>
        <div className="browser-url">{getHostname(project.url)}</div>
      </div>
      <a
        href={project.url}
        target="_blank"
        rel="noopener noreferrer"
        className="browser-viewport"
      >
        {project.preview === 'iframe' ? (
          <>
            <iframe
              src={project.url}
              title={`${project.title} preview`}
              className={`browser-iframe ${iframeLoaded ? 'loaded' : ''}`}
              loading="lazy"
              sandbox="allow-scripts allow-same-origin"
              onLoad={() => setIframeLoaded(true)}
            />
            {!iframeLoaded && <div className="browser-loading">Loading&hellip;</div>}
          </>
        ) : (
          <img
            src={project.image}
            alt={`${project.title} preview`}
            className="browser-screenshot"
          />
        )}
        <div className="browser-overlay">
          <span>Visit Live Site</span>
          <span className="browser-overlay-arrow">&#8599;</span>
        </div>
      </a>
    </div>
  )
}

export default function Projects() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const el = containerRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const totalScroll = rect.height - window.innerHeight
      if (totalScroll <= 0) return

      const scrolled = -rect.top
      const progress = Math.max(0, Math.min(0.999, scrolled / totalScroll))
      const index = Math.floor(progress * projects.length)
      setActiveIndex(Math.max(0, Math.min(index, projects.length - 1)))
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <section
      id="work"
      ref={containerRef}
      className="projects-section"
      style={{ height: `${projects.length * 100}vh` }}
    >
      <div className="projects-sticky">
        <div className="projects-header">
          <p className="section-label">Selected Work</p>
          <span className="projects-counter">
            {String(activeIndex + 1).padStart(2, '0')} / {String(projects.length).padStart(2, '0')}
          </span>
        </div>

        <div className="projects-content">
          {projects.map((project, i) => (
            <div
              key={project.num}
              className={`project-slide ${i === activeIndex ? 'active' : ''}`}
            >
              <div className="project-preview">
                <BrowserMockup project={project} />
              </div>
              <div className="project-details">
                <span className="project-slide-num">{project.num}</span>
                <h3 className="project-slide-title">{project.title}</h3>
                <p className="project-slide-subtitle">{project.subtitle}</p>
                <p className="project-slide-desc">{project.desc}</p>
                <div className="project-slide-info">
                  <div>
                    <span className="info-label">Role</span>
                    <span className="info-value">{project.role}</span>
                  </div>
                  <div>
                    <span className="info-label">Stack</span>
                    <span className="info-value">{project.tech.join(' \u00B7 ')}</span>
                  </div>
                  <div>
                    <span className="info-label">Year</span>
                    <span className="info-value">{project.year}</span>
                  </div>
                </div>
                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="project-visit-btn"
                >
                  Visit Live Site <span>&#8599;</span>
                </a>
              </div>
            </div>
          ))}
        </div>

        <div className="projects-progress-track">
          <div
            className="projects-progress-fill"
            style={{ transform: `scaleX(${(activeIndex + 1) / projects.length})` }}
          />
        </div>
      </div>
    </section>
  )
}
