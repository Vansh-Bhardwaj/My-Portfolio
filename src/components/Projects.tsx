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
  accent: string
  video: string
}

const projects: Project[] = [
  {
    num: '01',
    title: 'All Varity Studio',
    subtitle: 'Game Studio \u00B7 Brand Site',
    desc: 'Co-founded a game studio, built the brand site from scratch, and shipped our first title to the Play Store. The site runs on Next.js and doubles as the studio dashboard for managing releases, blog, and team.',
    year: '2024 \u2013 Present',
    url: 'https://allvaritygames.com',
    role: 'Co-Founder & Lead Developer',
    tech: ['Next.js', 'Unity', 'Game Dev'],
    accent: '#2563EB',
    video: '/projects/allvarity-studio.mp4',
  },
  {
    num: '02',
    title: 'DebridUI',
    subtitle: 'TypeScript \u00B7 Cloudflare Workers',
    desc: 'A privacy-first debrid client I actively maintain. Built-in player, cross-device sync, subtitle support, and media discovery across Real-Debrid, TorBox, AllDebrid, and Premiumize \u2014 all edge-deployed on Cloudflare Workers.',
    year: '2026 \u2013 Present',
    url: 'https://debrid.indevs.in',
    role: 'Creator & Active Maintainer',
    tech: ['Next.js', 'TypeScript', 'Cloudflare Workers'],
    accent: '#FFC107',
    video: '/projects/debridui.mp4',
  },
  {
    num: '03',
    title: 'Centuary Sofas',
    subtitle: 'Product Web \u00B7 UI Engineering',
    desc: 'End-to-end e-commerce platform for India\u2019s leading mattress brand. Built the frontend, backend APIs, 3D product configurator with AR try-on, and managed hosting \u2014 letting customers visualize sofas in their own space before buying.',
    year: '2025',
    url: 'https://sofa.centuaryindia.com',
    role: 'Full-stack Developer at Simapt',
    tech: ['React', 'TypeScript', '3D / AR', 'Node.js', 'E-commerce'],
    accent: '#1a8a8a',
    video: '/projects/centuary-sofas.mp4',
  },
]

function BrowserMockup({ project }: { project: Project }) {
  const displayUrl = project.url.replace(/^https?:\/\//, '')

  return (
    <div className="project-browser">
      <div className="browser-chrome">
        <div className="browser-dots">
          <span />
          <span />
          <span />
        </div>
        <div className="browser-address-bar">
          <svg width="10" height="12" viewBox="0 0 10 12" fill="none" aria-hidden>
            <rect x="1" y="5" width="8" height="6" rx="1" stroke="#555" strokeWidth="1.2" />
            <path d="M3 5V3.5a2.5 2.5 0 015 0V5" stroke="#555" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
          <span>{displayUrl}</span>
        </div>
      </div>
      <div className="browser-viewport">
        <video
          src={project.video}
          className="browser-video"
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
        />
      </div>
    </div>
  )
}

function ProjectCard({ project }: { project: Project }) {
  const { ref, isVisible } = useInView<HTMLDivElement>(0.1)

  return (
    <div
      ref={ref}
      className={`project-card${isVisible ? ' in-view' : ''}`}
      style={{ '--project-accent': project.accent } as React.CSSProperties}
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

      <BrowserMockup project={project} />

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
