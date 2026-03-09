import { useEffect, useRef, useState, useCallback } from 'react'
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
  liveUrl?: string
  forceDark?: boolean
}

const MOBILE_BP = 768

const projects: Project[] = [
  {
    num: '01',
    title: 'DebridUI',
    subtitle: 'TypeScript \u00B7 Cloudflare Workers',
    desc: 'A privacy-first debrid client I actively maintain. Built-in player, cross-device sync, subtitle support, and media discovery across Real-Debrid, TorBox, AllDebrid, and Premiumize \u2014 all edge-deployed on Cloudflare Workers.',
    year: '2024 \u2013 Present',
    url: 'https://debridui.viperadnan.com',
    role: 'Creator & Active Maintainer',
    tech: ['Next.js', 'TypeScript', 'Cloudflare Workers'],
    gradient: 'linear-gradient(135deg, #0d0d0a 0%, #1a1810 50%, #252218 100%)',
    accent: '#f5c518',
    liveUrl: 'https://debridui.viperadnan.com',
  },
  {
    num: '02',
    title: 'AllVarity Studio',
    subtitle: 'Game Studio \u00B7 Brand Site',
    desc: 'Co-founded a game studio, built the brand site from scratch, and shipped our first title to the Play Store. The site runs on Next.js and doubles as the studio dashboard for managing releases, blog, and team.',
    year: '2024 \u2013 Present',
    url: 'https://allvaritygames.com',
    role: 'Co-Founder & Lead Developer',
    tech: ['Next.js', 'Unity', 'Game Dev'],
    gradient: 'linear-gradient(135deg, #0a0e1a 0%, #111827 50%, #1e293b 100%)',
    accent: '#4a9eff',
    liveUrl: 'https://allvaritygames.com',
    forceDark: true,
  },
  {
    num: '03',
    title: 'Centuary Sofas',
    subtitle: 'Product Web \u00B7 UI Engineering',
    desc: 'End-to-end e-commerce platform for India\u2019s leading mattress brand. Built the frontend, backend APIs, 3D product configurator with AR try-on \u2014 letting customers visualize sofas in their own space before buying.',
    year: '2025',
    url: 'https://sofa.centuaryindia.com',
    role: 'Full-stack Developer at Simapt',
    tech: ['React', 'TypeScript', '3D / AR', 'Node.js'],
    gradient: 'linear-gradient(135deg, #0a1628 0%, #172554 50%, #1e3a5f 100%)',
    accent: '#3b82f6',
  },
]

/* ── Browser mockup with scroll-driven iframe panning ── */

function BrowserMockup({
  project,
  isVisible,
  iframeRef,
}: {
  project: Project
  isVisible: boolean
  iframeRef: React.RefObject<HTMLIFrameElement>
}) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const [iframeLoaded, setIframeLoaded] = useState(false)
  const [isMobile] = useState(
    () => typeof window !== 'undefined' && window.innerWidth < MOBILE_BP,
  )
  const [showIframe, setShowIframe] = useState(false)

  const canEmbed = !!project.liveUrl && !isMobile

  useEffect(() => {
    if (isVisible && canEmbed && !showIframe) {
      const t = setTimeout(() => setShowIframe(true), 500)
      return () => clearTimeout(t)
    }
  }, [isVisible, canEmbed, showIframe])

  const handleLoad = useCallback(() => {
    setTimeout(() => setIframeLoaded(true), 300)
  }, [])

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
            <path
              d="M3 5V3.5a2.5 2.5 0 015 0V5"
              stroke="#555"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </svg>
          <span>{displayUrl}</span>
        </div>
        {canEmbed && showIframe && iframeLoaded && (
          <span className="browser-live-badge">LIVE</span>
        )}
      </div>

      <div
        ref={viewportRef}
        className="browser-viewport"
        style={
          {
            '--project-gradient': project.gradient,
            '--project-accent': project.accent,
          } as React.CSSProperties
        }
      >
        {/* gradient fallback — always rendered */}
        <div className="browser-fallback">
          <div className="browser-fallback-grid" />
          <div className="browser-fallback-shapes">
            <span className="shape shape-rect-1" />
            <span className="shape shape-rect-2" />
            <span className="shape shape-circle" />
            <span className="shape shape-line-1" />
            <span className="shape shape-line-2" />
            <span className="shape shape-dot-1" />
            <span className="shape shape-dot-2" />
            <span className="shape shape-dot-3" />
          </div>
        </div>

        {canEmbed && showIframe && (
          <iframe
            ref={iframeRef}
            src={project.liveUrl}
            title={`${project.title} \u2014 live preview`}
            className={`browser-iframe${iframeLoaded ? ' loaded' : ''}${project.forceDark ? ' force-dark' : ''}`}
            loading="lazy"
            sandbox="allow-scripts allow-same-origin"
            scrolling="no"
            onLoad={handleLoad}
          />
        )}
      </div>
    </div>
  )
}

/* ── Individual showcase section per project ── */

const SCROLL_VH = 250 // total height of scroll container (in vh) for iframe projects

function ProjectShowcase({ project }: { project: Project }) {
  const { ref, isVisible } = useInView<HTMLDivElement>(0.05)
  const scrollRef = useRef<HTMLDivElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const hasLive = !!project.liveUrl
  const [isMobile] = useState(
    () => typeof window !== 'undefined' && window.innerWidth < MOBILE_BP,
  )

  /* scroll-driven effect: subtle zoom + progress while pinned */
  useEffect(() => {
    const container = scrollRef.current
    if (!container || isMobile) return

    let rafId: number
    const onScroll = () => {
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(() => {
        const rect = container.getBoundingClientRect()
        const vh = window.innerHeight
        const scrolled = -rect.top
        const scrollRange = container.offsetHeight - vh
        if (scrollRange <= 0) return
        const progress = Math.max(0, Math.min(1, scrolled / scrollRange))

        // subtle zoom on iframe
        if (iframeRef.current) {
          const scale = 1 + progress * 0.04
          iframeRef.current.style.transform = `scale(${scale})`
        }

        // update scroll progress bar
        container.style.setProperty('--scroll-progress', `${progress * 100}%`)
      })
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(rafId)
    }
  }, [isMobile])

  const showScrollLock = hasLive && !isMobile

  return (
    <div
      ref={showScrollLock ? scrollRef : undefined}
      className={`project-showcase${showScrollLock ? ' has-scroll-lock' : ''}`}
      style={
        {
          '--project-accent': project.accent,
          ...(showScrollLock ? { height: `${SCROLL_VH}vh` } : {}),
        } as React.CSSProperties
      }
    >
      <div
        ref={ref}
        className={`project-showcase-inner${isVisible ? ' in-view' : ''}${showScrollLock ? ' scroll-sticky' : ''}`}
      >
        <span className="project-num-ghost" aria-hidden>
          {project.num}
        </span>

        {/* scroll progress indicator */}
        {showScrollLock && <div className="scroll-progress" />}

        {/* header */}
        <div className="project-header">
          <div className="project-header-top">
            <span className="project-num">{project.num}</span>
            <span className="project-header-divider" />
            <span className="project-role">{project.role}</span>
          </div>
          <h3 className="project-name">{project.title}</h3>
          <p className="project-type">{project.subtitle}</p>
        </div>

        {/* browser mockup */}
        <BrowserMockup project={project} isVisible={isVisible} iframeRef={iframeRef} />

        {/* footer */}
        <div className="project-footer">
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
    </div>
  )
}

/* ── Section wrapper ── */

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
          <ProjectShowcase key={p.num} project={p} />
        ))}
      </div>
    </section>
  )
}
