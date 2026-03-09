import { useInView } from '../hooks/useInView'

const skills = [
  'JavaScript', 'TypeScript', 'React', 'Next.js', 'Node.js',
  'Unity', 'C#', 'Python', 'HLSL / GLSL',
  'Cloudflare Workers', 'GSAP', 'Blender', 'Vuforia',
]

const stats = [
  { value: '12', label: 'Products Shipped' },
  { value: '4', label: 'Companies Worked With' },
  { value: '5', label: 'Disciplines' },
]

const manifesto = 'I care about craft, speed, and shipping things that actually work.'

export default function About() {
  const { ref, isVisible } = useInView()
  const { ref: manifestoRef, isVisible: manifestoVisible } = useInView(0.3)

  return (
    <section id="about" className="section">
      <div className="container">
        <div ref={ref} className={`reveal ${isVisible ? 'visible' : ''}`}>
          <p className="section-label">About</p>

          <div className="about-stats">
            {stats.map((s) => (
              <div key={s.label} className="about-stat">
                <span className="about-stat-value">{s.value}</span>
                <span className="about-stat-label">{s.label}</span>
              </div>
            ))}
          </div>

          <div className="about-grid">
            <div className="about-bio">
              I design and engineer software at the intersection of
              performance, interactivity, and visual craft &mdash; from
              scalable web platforms to real&#8209;time 3D environments
              and shipped VR products. With a B.Tech in Computer Science
              specializing in Graphics &amp; Gaming from <strong>UPES</strong>,
              I bring a systems&#8209;level understanding of rendering pipelines,
              interaction design, and frontend architecture. Every project I
              take on ships with intention &mdash; optimized, accessible,
              and built to last.
            </div>
            <div className="about-details">
              <div className="about-detail-item">
                <h4>Currently</h4>
                <p>Software Developer at Simapt</p>
                <p>Co-Founder, AllVarity Studio</p>
              </div>
              <div className="about-detail-item">
                <h4>Education</h4>
                <p>B.Tech, CSE &mdash; Graphics &amp; Gaming</p>
                <p>UPES, Dehradun</p>
              </div>
              <div className="about-detail-item">
                <h4>Stack</h4>
                <div className="skills-list">
                  {skills.map((s) => (
                    <span key={s} className="skill-tag">{s}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div
            ref={manifestoRef}
            className={`about-manifesto ${manifestoVisible ? 'visible' : ''}`}
          >
            {manifesto.split(' ').map((word, i) => (
              <span
                key={i}
                className="manifesto-word"
                style={{ transitionDelay: `${i * 0.06}s` }}
              >
                {word}{' '}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
