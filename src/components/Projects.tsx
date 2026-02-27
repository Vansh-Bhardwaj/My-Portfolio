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
  highlights: string[]
  icon: string
  gradient: string
  decoColor: string
}

const projects: Project[] = [
  {
    num: '01',
    title: 'AllVarity Studio',
    subtitle: 'Game Studio \u00B7 Brand Site',
    desc: 'Co-founded a mobile game studio building immersive gaming experiences. Built the web presence from scratch, published games on Google Play, and lead development across Unity, web, and VR/AR platforms.',
    year: '2024 \u2013 Present',
    url: 'https://allvaritygames.com',
    role: 'Co-Founder & Lead Developer',
    tech: ['Next.js', 'Unity', 'Game Dev', 'VR/AR'],
    highlights: ['Published on Google Play', 'VR/AR Games', 'Pirate Cannon', 'Studio Dashboard'],
    icon: '\uD83C\uDFAE',
    gradient: 'linear-gradient(135deg, #6366F1, #8B5CF6, #A78BFA)',
    decoColor: '#6366F1',
  },
  {
    num: '02',
    title: 'DebridUI',
    subtitle: 'Open Source \u00B7 TypeScript \u00B7 Cloudflare Workers',
    desc: 'Fast, modern debrid client with built-in playback, continue watching, subtitle support, and media discovery. Supports Real-Debrid, TorBox, AllDebrid & Premiumize. Privacy-first \u2014 user data never leaves the browser.',
    year: '2025 \u2013 Present',
    url: 'https://debridui.vercel.app',
    role: 'Creator & Active Maintainer',
    tech: ['Next.js', 'TypeScript', 'Cloudflare Workers'],
    highlights: ['Built-in Player', 'Multi-provider', 'Cross-device Sync', 'Open Source'],
    icon: '\u26A1',
    gradient: 'linear-gradient(135deg, #10B981, #059669, #34D399)',
    decoColor: '#10B981',
  },
  {
    num: '03',
    title: 'Centuary Sofas',
    subtitle: 'Simapt \u00D7 Centuary India',
    desc: 'Full-featured e-commerce platform for India\u2019s leading mattress brand. Features interactive 3D product visualization with AR try-on, real-time configurator for size, color, and seating options across the Velveteen collection.',
    year: '2025',
    url: 'https://sofa.centuaryindia.com',
    role: 'Frontend Developer at Simapt',
    tech: ['React', 'TypeScript', '3D / AR', 'E-commerce'],
    highlights: ['3D Visualization', 'Augmented Reality', 'Product Configurator', 'Velveteen Collection'],
    icon: '\uD83D\uDECB\uFE0F',
    gradient: 'linear-gradient(135deg, #F59E0B, #D97706, #FBBF24)',
    decoColor: '#F59E0B',
  },
]

function getHostname(url: string): string {
  try {
    return new URL(url).hostname
  } catch {
    return url
  }
}

function ProjectVisual({ project }: { project: Project }) {
  return (
    <div className="project-visual">
      <div className="project-visual-bg" style={{ background: project.gradient }} />
      <div className="project-visual-deco" style={{ background: project.decoColor, opacity: 0.15 }} />
      <div className="project-visual-deco" style={{ background: project.decoColor, opacity: 0.1 }} />
      <span className="project-visual-num">{project.num}</span>
      <div className="project-visual-content">
        <span className="project-visual-icon">{project.icon}</span>
        <div className="project-visual-name">{project.title}</div>
        <div className="project-visual-type">{project.subtitle}</div>
        <a
          href={project.url}
          target="_blank"
          rel="noopener noreferrer"
          className="project-visual-url"
        >
          <span className="project-visual-url-dot" />
          {getHostname(project.url)}
        </a>
      </div>
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
              <ProjectVisual project={project} />
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
