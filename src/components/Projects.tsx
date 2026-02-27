import { useEffect, useRef, useState } from 'react'
import ArrowIcon from './ArrowIcon'

interface Project {
  num: string
  title: string
  subtitle: string
  desc: string
  year: string
  url: string
  role: string
  tech: string[]
  highlights: string[]
  images: string[]
}

const projects: Project[] = [
  {
    num: '01',
    title: 'AllVarity Studio',
    subtitle: 'Game Studio',
    desc: 'Co-founded a game studio, built the brand site from scratch, and shipped our first title to the Play Store. The site runs on Next.js and doubles as the studio dashboard for managing releases, blog, and team.',
    year: '2024 \u2013 Present',
    url: 'https://allvaritygames.com',
    role: 'Co-Founder & Lead Developer',
    tech: ['Next.js', 'Unity', 'Game Dev'],
    highlights: ['Published on Google Play', 'VR/AR Games', 'Studio Dashboard'],
    images: ['/preview-allvarity.webp', '/preview-allvarity-games.webp'],
  },
  {
    num: '02',
    title: 'DebridUI',
    subtitle: 'Open Source',
    desc: 'A privacy-first debrid client I actively maintain. Built-in player, cross-device sync, subtitle support, and media discovery across Real-Debrid, TorBox, AllDebrid, and Premiumize \u2014 all edge-deployed on Cloudflare Workers.',
    year: '2026 \u2013 Present',
    url: 'https://debridui.viperadnan.com',
    role: 'Creator & Active Maintainer',
    tech: ['Next.js', 'TypeScript', 'Cloudflare Workers'],
    highlights: ['Built-in Player', 'Multi-provider', 'Privacy-first', 'Open Source'],
    images: ['/preview-debrid.webp', '/preview-debrid-landing.webp', '/preview-debrid-media.webp'],
  },
  {
    num: '03',
    title: 'Centuary Sofas',
    subtitle: 'Client Project \u00B7 Simapt',
    desc: 'End-to-end e-commerce platform for India\u2019s leading mattress brand. Built the frontend, backend APIs, 3D product configurator with AR try-on, and managed hosting \u2014 letting customers visualize sofas in their own space before buying.',
    year: '2025',
    url: 'https://sofa.centuaryindia.com',
    role: 'Full-stack Developer at Simapt',
    tech: ['React', 'TypeScript', '3D / AR', 'Node.js', 'E-commerce'],
    highlights: ['3D Configurator', 'AR Try-on', 'Full-stack', 'Product Visualization'],
    images: ['/preview-centuary.webp', '/preview-centuary-configurator.webp', '/preview-centuary-product.webp', '/preview-centuary-velveteen.webp'],
  },
]

function getHostname(url: string): string {
  try {
    return new URL(url).hostname
  } catch {
    return url
  }
}

function ProjectGallery({ project, imageIndex }: { project: Project; imageIndex: number }) {
  const count = project.images.length

  return (
    <div className="project-preview">
      <div className="browser-frame">
        <div className="browser-bar">
          <div className="browser-dots">
            <span /><span /><span />
          </div>
          <div className="browser-url">{getHostname(project.url)}</div>
          {count > 1 && (
            <div className="gallery-dots">
              {project.images.map((_, i) => (
                <span key={i} className={`gallery-dot ${i === imageIndex ? 'active' : ''}`} />
              ))}
            </div>
          )}
        </div>
        <a
          href={project.url}
          target="_blank"
          rel="noopener noreferrer"
          className="browser-viewport"
        >
          {project.images.map((src, i) => (
            <img
              key={src}
              src={src}
              alt={`${project.title} preview ${i + 1}`}
              className={`gallery-image ${i === imageIndex ? 'active' : ''}`}
              loading="lazy"
            />
          ))}
          <div className="browser-overlay">
            <span>Visit Site</span>
            <ArrowIcon size={14} />
          </div>
        </a>
      </div>
    </div>
  )
}

export default function Projects() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [imageIndex, setImageIndex] = useState(0)

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
      const newActive = Math.max(0, Math.min(index, projects.length - 1))
      setActiveIndex(newActive)

      const projectProgress = progress * projects.length
      const subProgress = projectProgress - Math.floor(projectProgress)
      const imgCount = projects[newActive].images.length
      setImageIndex(Math.min(Math.floor(subProgress * imgCount), imgCount - 1))
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
          <p className="section-label">Projects</p>
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
              <ProjectGallery
                project={project}
                imageIndex={i === activeIndex ? imageIndex : 0}
              />
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
                  Visit Live Site <ArrowIcon />
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
