import { useInView } from '../hooks/useInView'

interface StackCategory {
  label: string
  items: string[]
}

const stack: StackCategory[] = [
  {
    label: 'Languages',
    items: ['JavaScript', 'TypeScript', 'C#', 'Python', 'HTML / CSS', 'HLSL / GLSL'],
  },
  {
    label: 'Game & 3D',
    items: ['Unity', 'Blender', 'Vuforia', 'LightshipAR', 'Shader Graph'],
  },
  {
    label: 'Web',
    items: ['React', 'Next.js', 'Node.js', 'Cloudflare Workers', 'GSAP'],
  },
  {
    label: 'Tools',
    items: ['Git', 'Figma', 'VS Code', 'Unity Editor', 'Vercel'],
  },
]

export default function Stack() {
  const { ref, isVisible } = useInView()

  return (
    <section id="stack" className="section">
      <div className="container">
        <div ref={ref} className={`reveal ${isVisible ? 'visible' : ''}`}>
          <p className="section-label">Tech Stack</p>
          <div className="stack-grid">
            {stack.map((cat) => (
              <div key={cat.label} className="stack-category">
                <h4 className="stack-category-label">{cat.label}</h4>
                <div className="stack-items">
                  {cat.items.map((item) => (
                    <span key={item} className="stack-item">{item}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
