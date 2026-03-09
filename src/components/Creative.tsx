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
    title: 'Nimbus: Citadel of Clouds',
    category: 'VR Game',
    desc: 'Puzzle-exploration VR title set across floating islands. Rebuilt the rendering pipeline from scratch, boosting framerate from 30 fps to 120 fps while adding weapon mechanics and spatial enemy AI.',
    tech: ['Unity', 'VR', 'Rendering'],
    link: {
      url: 'https://www.linkedin.com/feed/update/urn:li:activity:7193489930717667328/',
      label: 'View Media',
    },
    accent: '#6366F1',
  },
  {
    title: 'Chronicles of Eldoria',
    category: 'Top-Down RPG',
    desc: 'Solo-built RPG featuring a full inventory system, A*-driven enemy AI, and a branching dialogue engine powering non-linear narrative paths.',
    tech: ['Unity', 'AI Systems', 'Game Design'],
    accent: '#F43F5E',
  },
  {
    title: 'AR Applications Suite',
    category: 'Augmented Reality',
    desc: 'Production AR experiences including a bowling simulator, a spatial 3D calculator, and gesture-driven interaction layers built on Vuforia and LightshipAR.',
    tech: ['Vuforia', 'LightshipAR', 'Mobile'],
    link: {
      url: 'https://www.linkedin.com/feed/update/urn:li:activity:7193489930717667328/',
      label: 'View Media',
    },
    accent: '#F59E0B',
  },
  {
    title: '3D Assets & Environments',
    category: '3D Modeling',
    desc: 'High-fidelity product renders, detailed castle environments, campus visualizations, and weapon models delivered for games, marketing, and client presentations.',
    tech: ['Blender', 'Texturing', 'Rendering'],
    link: {
      url: 'https://www.linkedin.com/feed/update/urn:li:activity:7193489930717667328/',
      label: 'View Media',
    },
    accent: '#8B5CF6',
  },
  {
    title: 'Custom Shader Systems',
    category: 'Real-Time Shaders',
    desc: 'Procedural water simulation, stylized toon shading, and GPU\u2011driven visual effects engineered for real-time performance in Unity.',
    tech: ['HLSL', 'Shader Graph', 'Unity'],
    link: {
      url: 'https://www.linkedin.com/feed/update/urn:li:activity:7193489930717667328/',
      label: 'View Media',
    },
    accent: '#14B8A6',
  },
  {
    title: 'VR Temple Experience',
    category: 'Virtual Reality',
    desc: 'Fully immersive sacred architecture with interactive elements, volumetric lighting, and hand-modeled detail \u2014 optimized for standalone VR headsets.',
    tech: ['Unity', 'VR', 'Lighting'],
    link: {
      url: 'https://www.linkedin.com/feed/update/urn:li:activity:7193489930717667328/',
      label: 'View Media',
    },
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
