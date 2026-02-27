import { useInView } from '../hooks/useInView'

interface CreativeProject {
  title: string
  category: string
  desc: string
  tech: string[]
  link?: { url: string; label: string }
  accent: string
}

const creativeProjects: CreativeProject[] = [
  {
    title: 'Nimbus: Citadel of Clouds',
    category: 'VR Game',
    desc: 'VR puzzle-exploration game featuring floating islands, weapon mechanics, and advanced enemy AI. Optimized rendering pipeline achieving a 300% framerate boost \u2014 from 30fps to 120fps.',
    tech: ['Unity', 'C#', 'VR', 'ShaderLab'],
    accent: '#6366F1',
  },
  {
    title: 'Pirate Cannon',
    category: 'Mobile Game',
    desc: 'Hyper-casual cannon shooting game with a pirate theme. Published on Google Play Store under AllVarity Studio.',
    tech: ['Unity', 'C#', 'Android'],
    link: {
      url: 'https://play.google.com/store/apps/details?id=com.allvarity.piratecannon',
      label: 'Google Play',
    },
    accent: '#10B981',
  },
  {
    title: 'AR & VR Showreel',
    category: 'Mixed Reality',
    desc: 'Collection of AR and VR projects including bowling alley simulation, 3D interactive calculators, and animal AR experiences built with Vuforia and LightshipAR.',
    tech: ['Unity', 'Vuforia', 'LightshipAR', 'ARCore'],
    link: {
      url: 'https://www.linkedin.com/feed/update/urn:li:activity:7193489930717667328/',
      label: 'Watch Showreel',
    },
    accent: '#F59E0B',
  },
]

export default function Creative() {
  const { ref, isVisible } = useInView()

  return (
    <section id="creative" className="section">
      <div className="container">
        <div ref={ref} className={`reveal ${isVisible ? 'visible' : ''}`}>
          <p className="section-label">Creative Work</p>
          <div className="creative-grid">
            {creativeProjects.map((project) => (
              <div
                key={project.title}
                className="creative-card"
                style={{ '--card-accent': project.accent } as React.CSSProperties}
              >
                <div className="creative-card-header">
                  <span className="creative-category">{project.category}</span>
                </div>
                <h3 className="creative-card-title">{project.title}</h3>
                <p className="creative-card-desc">{project.desc}</p>
                <div className="creative-card-tech">
                  {project.tech.map((t) => (
                    <span key={t} className="creative-tech-tag">{t}</span>
                  ))}
                </div>
                {project.link && (
                  <a
                    href={project.link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="creative-card-link"
                  >
                    {project.link.label} <span>&#8599;</span>
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
