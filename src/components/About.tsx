import { useInView } from '../hooks/useInView'

const skills = [
  'JavaScript', 'TypeScript', 'React', 'Next.js', 'Node.js',
  'Unity', 'C#', 'C++', 'Python',
  'VR/AR', 'ShaderLab', 'GLSL',
  'Blender', 'Three.js',
]

export default function About() {
  const { ref, isVisible } = useInView()

  return (
    <section id="about" className="section">
      <div className="container">
        <div ref={ref} className={`reveal ${isVisible ? 'visible' : ''}`}>
          <p className="section-label">About</p>
          <div className="about-grid">
            <div className="about-bio">
              I&rsquo;m a <strong>creative developer</strong> and co-founder based in India.
              Currently building web experiences at <strong>Simapt</strong> and
              co-running <strong>AllVarity Studio</strong>, a mobile game studio.
              My work spans web development, game development, VR/AR, and creative
              technology &mdash; always focused on crafting immersive digital experiences
              that push boundaries.
            </div>
            <div className="about-details">
              <div className="about-detail-item">
                <h4>Currently</h4>
                <p>Frontend Developer at Simapt</p>
                <p>Co-Founder at AllVarity Studio</p>
              </div>
              <div className="about-detail-item">
                <h4>Expertise</h4>
                <div className="skills-list">
                  {skills.map((s) => (
                    <span key={s} className="skill-tag">{s}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
