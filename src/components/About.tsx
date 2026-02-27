import { useInView } from '../hooks/useInView'

const skills = [
  'JavaScript', 'TypeScript', 'React', 'Next.js', 'Node.js',
  'Unity', 'C#', 'Python', 'HTML / CSS', 'HLSL / GLSL',
  'Cloudflare Workers', 'GSAP', 'Blender', 'Vuforia', 'LightshipAR',
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
              Software developer and <strong>creative technologist</strong> with
              a B.Tech in Computer Science (Graphics &amp; Gaming) from <strong>UPES</strong>.
              I turn ideas into fast, polished digital products &mdash; from
              immersive VR worlds to production-ready web interfaces. Currently
              building product-focused software at <strong>Simapt</strong> and
              co-running <strong>AllVarity Studio</strong>, a mobile game studio.
            </div>
            <div className="about-details">
              <div className="about-detail-item">
                <h4>Currently</h4>
                <p>Software Developer at Simapt</p>
                <p>Co-Founder at AllVarity Studio</p>
              </div>
              <div className="about-detail-item">
                <h4>Education</h4>
                <p>B.Tech, Computer Science Engineering</p>
                <p>Graphics &amp; Gaming &mdash; UPES</p>
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
          <div className="about-stats">
            <div className="about-stat">
              <div className="about-stat-num">12</div>
              <div className="about-stat-label">Products Shipped</div>
            </div>
            <div className="about-stat">
              <div className="about-stat-num">4</div>
              <div className="about-stat-label">Companies Worked With</div>
            </div>
            <div className="about-stat">
              <div className="about-stat-num">5</div>
              <div className="about-stat-label">Disciplines</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
