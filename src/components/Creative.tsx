import { useInView } from '../hooks/useInView'
import ArrowIcon from './ArrowIcon'

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
    title: 'AR Applications Suite',
    category: 'Augmented Reality',
    desc: 'Collection of AR experiences \u2014 bowling sim, spatial calculator, and gesture-driven controls on Vuforia and LightshipAR.',
    tech: ['Vuforia', 'LightshipAR', 'Unity'],
    link: {
      url: 'https://www.linkedin.com/feed/update/urn:li:activity:7193489930717667328/',
      label: 'Watch Showreel',
    },
    accent: '#F59E0B',
  },
  {
    title: 'Pirate Cannon',
    category: 'Mobile Game',
    desc: 'Hyper-casual cannon shooter published on Google Play under AllVarity Studio. 100+ downloads.',
    tech: ['Unity', 'C#', 'Android'],
    link: {
      url: 'https://play.google.com/store/apps/details?id=com.allvarity.piratecannon',
      label: 'Google Play',
    },
    accent: '#10B981',
  },
  {
    title: 'Nimbus: Citadel of Clouds',
    category: 'VR Game',
    desc: 'VR puzzle-exploration with floating islands, weapon mechanics, and enemy AI. Rebuilt the rendering pipeline for a 4\u00D7 framerate gain (30 \u2192 120 fps).',
    tech: ['Unity', 'C#', 'VR', 'Rendering'],
    accent: '#6366F1',
  },
  {
    title: 'Chronicles of Eldoria',
    category: 'Top-Down RPG',
    desc: 'Team-built RPG featuring a full inventory system, A*-driven enemy AI, and a branching dialogue engine.',
    tech: ['Unity', 'AI Systems', 'Game Design'],
    accent: '#F43F5E',
  },
  {
    title: '3D Assets & Models',
    category: '3D Modeling',
    desc: 'High-fidelity product renders, detailed castle environments, campus visualizations, and weapon models delivered for games, marketing, and client presentations.',
    tech: ['Blender', 'Texturing', 'Rendering'],
    accent: '#8B5CF6',
  },
  {
    title: 'Custom Shader Systems',
    category: 'Real-time Shaders',
    desc: 'Procedural water simulation, stylized toon shading, and GPU\u2011driven visual effects engineered for real-time performance in Unity.',
    tech: ['HLSL', 'Shader Graph', 'Unity'],
    accent: '#14B8A6',
  },
  {
    title: 'VR Temple Experience',
    category: 'Virtual Reality',
    desc: 'Immersive sacred temple with volumetric lighting, interactive elements, and hand-modeled architectural detail.',
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
          <p className="section-label">Game Dev &amp; VR / AR</p>
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
                    {project.link.label} <ArrowIcon size={10} />
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
