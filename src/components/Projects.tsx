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
  highlights: string[]
  secondaryImages?: { src: string; label: string }[]
}

const projects: Project[] = [
  {
    num: '01',
    title: 'AllVarity Studio',
    subtitle: 'Game Studio',
    desc: 'Co-founded a mobile game studio building immersive gaming experiences. Built the web presence, published games on Google Play, and lead development across Unity, web, and VR/AR platforms.',
    year: '2025',
    url: 'https://allvaritygames.com',
    role: 'Co-Founder & Lead Developer',
    tech: ['Next.js', 'Unity', 'Game Dev'],
    preview: 'image',
    image: '/preview-allvarity.webp',
    highlights: ['Published on Google Play', 'VR/AR Games', 'Pirate Cannon', 'Studio Dashboard'],
    secondaryImages: [
      { src: '/preview-allvarity-games.webp', label: 'Games Catalog' },
    ],
  },
  {
    num: '02',
    title: 'DebridUI',
    subtitle: 'Open Source Project',
    desc: 'Performance-focused debrid client with built-in playback, continue watching, subtitle support, and media discovery. Supports Real-Debrid, TorBox, AllDebrid & Premiumize. Edge-deployed on Cloudflare Workers.',
    year: '2025',
    url: 'https://debrid.indevs.in',
    role: 'Creator',
    tech: ['Next.js', 'TypeScript', 'Cloudflare'],
    preview: 'image',
    image: '/preview-debrid.webp',
    highlights: ['Built-in Player', 'Media Discovery', 'Cross-device Sync', 'Subtitle Support'],
    secondaryImages: [
      { src: '/preview-debrid-landing.webp', label: 'Landing Page' },
      { src: '/preview-debrid-media.webp', label: 'Media Details' },
    ],
  },
  {
    num: '03',
    title: 'Centuary Sofas',
    subtitle: 'Simapt \u00D7 Centuary India',
    desc: 'Full-featured e-commerce platform with 3D product visualization and interactive configurator. Showcases the Velveteen collection with customizable size, color, and seating options for India\u2019s leading mattress brand.',
    year: '2025',
    url: 'https://sofa.centuaryindia.com',
    role: 'Frontend Developer at Simapt',
    tech: ['React', 'TypeScript', '3D Web'],
    preview: 'image',
    image: '/preview-centuary.webp',
    highlights: ['3D Visualization', 'Velveteen Collection', 'Product Configurator', 'E-commerce'],
    secondaryImages: [
      { src: '/preview-centuary-velveteen.webp', label: 'Velveteen Product' },
      { src: '/preview-centuary-configurator.webp', label: '3D Configurator' },
    ],
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

function SecondaryPreviews({ images }: { images: { src: string; label: string }[] }) {
  return (
    <div className="secondary-previews">
      {images.map((img) => (
        <div key={img.label} className="secondary-preview-item">
          <img src={img.src} alt={img.label} className="secondary-preview-img" />
          <span className="secondary-preview-label">{img.label}</span>
        </div>
      ))}
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
                {project.secondaryImages && project.secondaryImages.length > 0 && (
                  <SecondaryPreviews images={project.secondaryImages} />
                )}
              </div>
              <div className="project-details">
                <span className="project-slide-num">{project.num}</span>
                <h3 className="project-slide-title">{project.title}</h3>
                <p className="project-slide-subtitle">{project.subtitle}</p>
                <p className="project-slide-desc">{project.desc}</p>
                <div className="project-highlights">
                  {project.highlights.map((h) => (
                    <span key={h} className="highlight-tag">{h}</span>
                  ))}
                </div>
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
