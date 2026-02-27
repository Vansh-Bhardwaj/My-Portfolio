import { useInView } from '../hooks/useInView'

interface Project {
  num: string
  title: string
  desc: string
  category: string
  year: string
  url: string | null
}

const projects: Project[] = [
  {
    num: '01',
    title: 'Centuary Sofas',
    desc: 'Product configurator for India\u2019s leading mattress brand',
    category: 'Web Dev',
    year: '2025',
    url: 'https://sofa.centuaryindia.com',
  },
  {
    num: '02',
    title: 'DebridUI',
    desc: 'Modern debrid client with media streaming & discovery',
    category: 'Web App',
    year: '2025',
    url: 'https://debrid.indevs.in',
  },
  {
    num: '03',
    title: 'AllVarity Studio',
    desc: 'Mobile game studio \u2014 building engaging experiences',
    category: 'Game Dev',
    year: '2025',
    url: 'https://allvaritygames.com',
  },
  {
    num: '04',
    title: 'Nimbus',
    desc: 'VR puzzle-exploration game with 300% framerate optimization',
    category: 'VR / Unity',
    year: '2024',
    url: null,
  },
  {
    num: '05',
    title: 'Fluid Simulation',
    desc: 'Real-time physics-based fluid dynamics in C++',
    category: 'Graphics',
    year: '2024',
    url: 'https://github.com/Vansh-Bhardwaj/FluidSimulation',
  },
  {
    num: '06',
    title: 'Multiplayer Tetris',
    desc: 'Real-time online multiplayer Tetris',
    category: 'Game Dev',
    year: '2024',
    url: 'https://github.com/Vansh-Bhardwaj/MultiplayerTetris',
  },
]

function ProjectRow({ project, index }: { project: Project; index: number }) {
  const content = (
    <>
      <span className="project-num">{project.num}</span>
      <div className="project-info">
        <div className="project-title">{project.title}</div>
        <p className="project-desc">{project.desc}</p>
      </div>
      <span className="project-meta">{project.category}</span>
      <span className="project-meta">
        {project.year}
        {project.url && <span className="project-arrow"> &#8599;</span>}
      </span>
    </>
  )

  const style = { transitionDelay: `${index * 0.05}s` }

  if (project.url) {
    return (
      <a
        href={project.url}
        target="_blank"
        rel="noopener noreferrer"
        className="project-item"
        style={style}
      >
        {content}
      </a>
    )
  }

  return (
    <div className="project-item" style={style}>
      {content}
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
          <div className="projects-list">
            {projects.map((p, i) => (
              <ProjectRow key={p.num} project={p} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
