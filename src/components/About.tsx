import { useInView } from '../hooks/useInView'

const skills = [
  'JavaScript', 'TypeScript', 'React', 'Next.js', 'Node.js',
  'Unity', 'C#', 'Python', 'HLSL / GLSL',
  'Cloudflare Workers', 'GSAP', 'Blender', 'Vuforia',
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
          <div className="about-grid">
            <div className="about-bio">
              I&rsquo;m a software developer with a background in
              Computer Science (Graphics &amp; Gaming) from <strong>UPES</strong>.
              I ship fast &mdash; whether it&rsquo;s a product interface
              at <strong>Simapt</strong>, a game on the Play Store through
              {' '}<strong>AllVarity Studio</strong>, or an open-source tool
              used by hundreds. My work sits at the intersection of
              engineering, design, and interactive media.
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
