import { useInView } from '../hooks/useInView'
import { haptic } from '../hooks/useHaptics'

interface TimelineItem {
  period: string
  current?: boolean
  title: string
  org: string
  desc: string
  type: 'work' | 'edu'
}

interface EduProject {
  title: string
  label: string
  desc: string
}

const timeline: TimelineItem[] = [
  {
    period: 'Current',
    current: true,
    title: 'Software Developer',
    org: 'Simapt',
    desc: 'Engineering product-focused web platforms with fast iteration cycles, component-driven architecture, and systems designed for long-term maintainability.',
    type: 'work',
  },
  {
    period: '2025',
    title: 'Freelance Developer & Mentor',
    org: 'Independent \u00B7 Remote',
    desc: 'Led VR development for a medical-center walkthrough. Delivered custom shaders, real-time animations, and production 3D assets for a mobile game studio.',
    type: 'work',
  },
  {
    period: 'Jun \u2013 Jul 2024',
    title: 'Software Developer',
    org: 'Phemsoft Software Pvt. Ltd. \u00B7 Dehradun',
    desc: 'Engineered a physics-based water simulation in Unity, cutting draw calls by 40% through batching optimizations and custom LOD strategies.',
    type: 'work',
  },
  {
    period: 'May 2024',
    title: 'Gameplay Programmer',
    org: 'GameDept Technologies \u00B7 Rajasthan',
    desc: 'Developed responsive player-movement mechanics for a platformer and designed three levels with progressively complex gameplay challenges.',
    type: 'work',
  },
  {
    period: '2021 \u2013 2025',
    title: 'B.Tech, Computer Science \u2014 Graphics & Gaming',
    org: 'UPES \u2014 University of Petroleum & Energy Studies',
    desc: 'Four-year specialization in real-time rendering, game engine architecture, shader programming, and interactive media. Graduated 2025.',
    type: 'edu',
  },
]

const eduProjects: EduProject[] = [
  {
    title: 'Nimbus: Citadel of Clouds',
    label: 'Project Lead \u00B7 Aug\u2013Dec 2024',
    desc: 'Directed a VR puzzle-exploration title from concept to completion. Rebuilt the rendering pipeline to achieve a 4\u00D7 framerate improvement while shipping weapon mechanics and spatial enemy AI.',
  },
  {
    title: 'Chronicles of Eldoria',
    label: 'Team Project \u00B7 Jan\u2013May 2024',
    desc: 'Built a top-down RPG featuring a full inventory system, A*-driven enemy AI, and a branching dialogue engine powering non-linear storytelling.',
  },
]

function TimelineEntry({ item, index }: { item: TimelineItem; index: number }) {
  const { ref, isVisible } = useInView(0.15)
  return (
    <div
      ref={ref}
      className={`tl-entry reveal ${isVisible ? 'visible' : ''}${item.current ? ' tl-current' : ''}${item.type === 'edu' ? ' tl-edu' : ''}`}
      style={{ transitionDelay: `${index * 0.1}s` }}
      onPointerEnter={() => haptic('light')}
    >
      <div className="tl-rail">
        <span className={`tl-dot${item.current ? ' tl-dot-active' : ''}${item.type === 'edu' ? ' tl-dot-edu' : ''}`} />
      </div>
      <div className="tl-body">
        <div className="tl-meta">
          <span className="tl-period">{item.period}</span>
          {item.current && <span className="tl-badge">Current</span>}
          {item.type === 'edu' && <span className="tl-badge tl-badge-edu">Education</span>}
        </div>
        <h3 className="tl-title">{item.title}</h3>
        <p className="tl-org">{item.org}</p>
        <p className="tl-desc">{item.desc}</p>

        {item.type === 'edu' && (
          <div className="tl-projects">
            {eduProjects.map((p) => (
              <div key={p.title} className="tl-project">
                <div className="tl-project-head">
                  <span className="tl-project-title">{p.title}</span>
                  <span className="tl-project-label">{p.label}</span>
                </div>
                <p className="tl-project-desc">{p.desc}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function Experience() {
  const { ref, isVisible } = useInView()

  return (
    <section id="experience" className="section">
      <div className="container">
        <div ref={ref} className={`reveal ${isVisible ? 'visible' : ''}`}>
          <p className="section-label"><span className="section-num">04</span> Experience &amp; Education</p>
          <p className="experience-intro">
            A timeline of roles, projects, and milestones that shaped how I build software.
          </p>
        </div>

        <div className="tl-wrap">
          {timeline.map((item, i) => (
            <TimelineEntry key={i} item={item} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
