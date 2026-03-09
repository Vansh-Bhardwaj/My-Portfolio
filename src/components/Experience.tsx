import { useInView } from '../hooks/useInView'

interface TimelineItem {
  period: string
  tag?: string
  title: string
  org: string
  desc: string
}

interface EduProject {
  title: string
  label: string
  desc: string
}

const experience: TimelineItem[] = [
  {
    period: 'Current',
    tag: '2025',
    title: 'Software Developer',
    org: 'Simapt',
    desc: 'Engineering product-focused web platforms with fast iteration cycles, component-driven architecture, and systems designed for long-term maintainability.',
  },
  {
    period: '2025',
    title: 'Freelance Developer & Mentor',
    org: 'Independent \u00B7 Remote',
    desc: 'Led VR development for a medical-center walkthrough. Delivered custom shaders, real-time animations, and production 3D assets for a mobile game studio.',
  },
  {
    period: 'Jun \u2013 Jul 2024',
    title: 'Software Developer',
    org: 'Phemsoft Software Pvt. Ltd. \u00B7 Dehradun',
    desc: 'Engineered a physics-based water simulation in Unity, cutting draw calls by 40% through batching optimizations and custom LOD strategies.',
  },
  {
    period: 'May 2024',
    title: 'Gameplay Programmer',
    org: 'GameDept Technologies \u00B7 Rajasthan',
    desc: 'Developed responsive player-movement mechanics for a platformer and designed three levels with progressively complex gameplay challenges.',
  },
]

const education = {
  period: '2021 \u2013 2025',
  title: 'B.Tech, Computer Science \u2014 Graphics & Gaming',
  org: 'UPES \u2014 University of Petroleum & Energy Studies',
  desc: 'Four-year specialization in real-time rendering, game engine architecture, shader programming, and interactive media. Graduated 2025.',
}

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
      className={`timeline-item reveal ${isVisible ? 'visible' : ''}`}
      style={{ transitionDelay: `${index * 0.08}s` }}
    >
      <div className="timeline-period">
        {item.tag && <span className="timeline-tag">{item.tag}</span>}
        <span>{item.period}</span>
      </div>
      <div className="timeline-content">
        <h3 className="timeline-title">{item.title}</h3>
        <p className="timeline-org">{item.org}</p>
        <p className="timeline-desc">{item.desc}</p>
      </div>
    </div>
  )
}

export default function Experience() {
  const { ref, isVisible } = useInView()
  const { ref: eduRef, isVisible: eduVisible } = useInView(0.1)

  return (
    <section id="experience" className="section">
      <div className="container">
        <div ref={ref} className={`reveal ${isVisible ? 'visible' : ''}`}>
          <p className="section-label"><span className="section-num">04</span> Experience &amp; Education</p>
          <p className="experience-intro">
            A timeline of roles, projects, and milestones that shaped how I build software.
          </p>
        </div>

        <div className="timeline">
          {experience.map((item, i) => (
            <TimelineEntry key={i} item={item} index={i} />
          ))}

          <div
            ref={eduRef}
            className={`timeline-item timeline-edu reveal ${eduVisible ? 'visible' : ''}`}
            style={{ transitionDelay: `${experience.length * 0.08}s` }}
          >
            <div className="timeline-period">
              <span className="timeline-tag">Education</span>
              <span>{education.period}</span>
            </div>
            <div className="timeline-content">
              <h3 className="timeline-title">{education.title}</h3>
              <p className="timeline-org">{education.org}</p>
              <p className="timeline-desc">{education.desc}</p>

              <div className="edu-projects">
                {eduProjects.map((p) => (
                  <div key={p.title} className="edu-project">
                    <div className="edu-project-header">
                      <span className="edu-project-title">{p.title}</span>
                      <span className="edu-project-label">{p.label}</span>
                    </div>
                    <p className="edu-project-desc">{p.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
