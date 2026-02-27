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
    desc: 'VR puzzle-exploration across floating islands with weapon mechanics and enemy AI. Rebuilt the rendering pipeline for a 4\u00D7 framerate boost \u2014 from 30 fps to 120 fps.',
    tech: ['Unity', 'C#', 'VR', 'Rendering'],
    accent: '#6366F1',
  },
  {
    title: 'Chronicles of Eldoria',
    category: 'Top-Down RPG',
    desc: 'Solo-built RPG with full inventory system, enemy AI using A* pathfinding, and a branching dialogue engine for non-linear storytelling.',
    tech: ['Unity', 'AI Systems', 'Game Design'],
    accent: '#F43F5E',
  },
  {
    title: 'AR Applications Suite',
    category: 'Augmented Reality',
    desc: 'AR bowling sim, spatial 3D calculator, and gesture-driven controls built on Vuforia and LightshipAR for mobile platforms.',
    tech: ['Vuforia', 'LightshipAR', 'Mobile', 'Unity'],
    link: {
      url: 'https://www.linkedin.com/feed/update/urn:li:activity:7193489930717667328/',
      label: 'Watch Showreel',
    },
    accent: '#F59E0B',
  },
  {
    title: 'Pirate Cannon',
    category: 'Mobile Game',
    desc: 'Hyper-casual cannon shooting game with a pirate theme. Published on Google Play Store under AllVarity Studio with 100+ downloads.',
    tech: ['Unity', 'C#', 'Android'],
    link: {
      url: 'https://play.google.com/store/apps/details?id=com.allvarity.piratecannon',
      label: 'Google Play',
    },
    accent: '#10B981',
  },
  {
    title: '3D Assets & Models',
    category: '3D Modeling',
    desc: 'Product furniture renders, detailed castle environments, campus scenes, and weapon models for games and marketing materials.',
    tech: ['Blender', 'Texturing', 'Rendering'],
    accent: '#8B5CF6',
  },
  {
    title: 'VR Temple Experience',
    category: 'Virtual Reality',
    desc: 'Fully immersive sacred temple with interactive elements, volumetric lighting, and hand-modeled architectural detail in VR.',
    tech: ['Unity', 'VR', 'Lighting'],
    accent: '#EC4899',
  },
]

export default function Creative() {
  const { ref, isVisible } = useInView()

  return (
    <section id="creative" className="section">
      <div className="container">
        <div ref={ref} className={`reveal ${isVisible ? 'visible' : ''}`}>
          <p className="section-label">Game Development &amp; VR / AR</p>
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
