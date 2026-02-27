const roles = [
  'Software Developer', 'Creative Technologist', 'Co-Founder',
  'Game Developer', 'VR / AR', '3D Visualization',
  'Product UI', 'Frontend Systems',
]
const tech = [
  'React', 'Next.js', 'TypeScript', 'Unity', 'C#',
  'Cloudflare Workers', 'Blender', 'GSAP', 'Node.js', 'GLSL',
]

function MarqueeRow({ items }: { items: string[] }) {
  return (
    <div className="marquee-content">
      {items.map((item) => (
        <span className="marquee-item" key={item}>
          {item}
          <span className="marquee-dot" />
        </span>
      ))}
    </div>
  )
}

export default function Marquee() {
  return (
    <div className="marquee-wrapper">
      <div className="marquee">
        <div className="marquee-inner">
          <MarqueeRow items={roles} />
          <MarqueeRow items={roles} />
        </div>
      </div>
      <div className="marquee reverse">
        <div className="marquee-inner">
          <MarqueeRow items={tech} />
          <MarqueeRow items={tech} />
        </div>
      </div>
    </div>
  )
}
