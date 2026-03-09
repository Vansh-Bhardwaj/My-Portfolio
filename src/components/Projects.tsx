import { useInView } from '../hooks/useInView'
import ArrowIcon from './ArrowIcon'
import { haptic } from '../hooks/useHaptics'

interface Project {
  num: string
  title: string
  subtitle: string
  desc: string
  year: string
  url: string
  role: string
  tech: string[]
  gradient: string
  accent: string
}

const projects: Project[] = [
  {
    num: '01',
    title: 'Centuary Sofas',
    subtitle: 'Product Web \u00B7 UI Engineering',
    desc: 'End-to-end e-commerce platform for India\u2019s leading mattress brand. Built the frontend, backend APIs, 3D product configurator with AR try-on, and managed hosting \u2014 letting customers visualize sofas in their own space before buying.',
    year: '2025',
    url: 'https://sofa.centuaryindia.com',
    role: 'Full-stack Developer at Simapt',
    tech: ['React', 'TypeScript', '3D / AR', 'Node.js', 'E-commerce'],
    gradient: 'linear-gradient(135deg, #0a1628 0%, #172554 50%, #1e3a5f 100%)',
    accent: '#3b82f6',
  },
  {
    num: '02',
    title: 'DebridUI',
    subtitle: 'TypeScript \u00B7 Cloudflare Workers',
    desc: 'A privacy-first debrid client I actively maintain. Built-in player, cross-device sync, subtitle support, and media discovery across Real-Debrid, TorBox, AllDebrid, and Premiumize \u2014 all edge-deployed on Cloudflare Workers.',
    year: '2026 \u2013 Present',
    url: 'https://debridui.viperadnan.com',
    role: 'Creator & Active Maintainer',
    tech: ['Next.js', 'TypeScript', 'Cloudflare Workers'],
    gradient: 'linear-gradient(135deg, #0d0d0a 0%, #1a1810 50%, #252218 100%)',
    accent: '#f5c518',
  },
  {
    num: '03',
    title: 'All Varity Studio',
    subtitle: 'Game Studio \u00B7 Brand Site',
    desc: 'Co-founded a game studio, built the brand site from scratch, and shipped our first title to the Play Store. The site runs on Next.js and doubles as the studio dashboard for managing releases, blog, and team.',
    year: '2024 \u2013 Present',
    url: 'https://allvaritygames.com',
    role: 'Co-Founder & Lead Developer',
    tech: ['Next.js', 'Unity', 'Game Dev'],
    gradient: 'linear-gradient(135deg, #0a0e1a 0%, #111827 50%, #1e293b 100%)',
    accent: '#4a9eff',
  },
]

function ProjectCard({ project }: { project: Project }) {
  const { ref, isVisible } = useInView<HTMLDivElement>(0.1)

  return (
    <div
      ref={ref}
      className={`project-card${isVisible ? ' in-view' : ''}`}
      style={
        {
          '--project-accent': project.accent,
          '--project-gradient': project.gradient,
        } as React.CSSProperties
      }
    >
      <span className="project-num-ghost" aria-hidden>
        {project.num}
      </span>

      <div className="project-card-header">
        <div className="project-header-top">
          <span className="project-num">{project.num}</span>
          <span className="project-header-divider" />
          <span className="project-role">{project.role}</span>
        </div>
        <h3 className="project-name">{project.title}</h3>
        <p className="project-type">{project.subtitle}</p>
      </div>

      <div className="project-visual">
        <div className="project-visual-gradient">
          <div className="project-visual-grid" />
          <div className="project-visual-shapes">
            <span className="pv-shape pv-ring" />
            <span className="pv-shape pv-bar-1" />
            <span className="pv-shape pv-bar-2" />
            <span className="pv-shape pv-dot-1" />
            <span className="pv-shape pv-dot-2" />
            <span className="pv-shape pv-dot-3" />
            <span className="pv-shape pv-line" />
            <span className="pv-shape pv-block" />
          </div>
          <div className="project-visual-title" aria-hidden>
            {project.title}
          </div>
        </div>
      </div>

      <div className="project-card-footer">
        <p className="project-desc">{project.desc}</p>
        <div className="project-tags">
          {project.tech.map((t) => (
            <span key={t} className="project-tag">
              {t}
            </span>
          ))}
        </div>
        <div className="project-footer-row">
          <span className="project-year">{project.year}</span>
          <a
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            className="project-visit"
            onClick={(e) => {
              e.stopPropagation()
              haptic('medium')
            }}
          >
            Visit Site <ArrowIcon size={14} />
          </a>
        </div>
      </div>
    </div>
  )
}

export default function Projects() {
  const { ref, isVisible } = useInView()

  return (
    <section id="work" className="section">
      <div className="container">
        <div ref={ref} className={`reveal ${isVisible ? 'visible' : ''}`}>
          <p className="section-label">Selected Work</p>
        </div>
      </div>
      <div className="project-list">
        {projects.map((p) => (
          <ProjectCard key={p.num} project={p} />
        ))}
      </div>
    </section>
  )
}
