import { useEffect, useRef } from 'react'

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
    <div className="marquee-content" aria-hidden="true">
      {items.map((item, i) => (
        <span className="marquee-item" key={`${item}-${i}`}>
          {item}
          <span className="marquee-dot" />
        </span>
      ))}
    </div>
  )
}

export default function Marquee() {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const speedRef = useRef(1)
  const lastScrollY = useRef(0)
  const lastTime = useRef(Date.now())

  useEffect(() => {
    const handleScroll = () => {
      const now = Date.now()
      const dt = Math.max(now - lastTime.current, 1)
      const dy = Math.abs(window.scrollY - lastScrollY.current)
      const velocity = dy / dt
      
      speedRef.current = 1 + Math.min(velocity * 3, 4)
      
      lastScrollY.current = window.scrollY
      lastTime.current = now

      if (wrapperRef.current) {
        wrapperRef.current.style.setProperty('--marquee-speed', String(speedRef.current))
      }
    }

    const decay = () => {
      speedRef.current += (1 - speedRef.current) * 0.05
      if (wrapperRef.current) {
        wrapperRef.current.style.setProperty('--marquee-speed', String(speedRef.current))
      }
      requestAnimationFrame(decay)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    const raf = requestAnimationFrame(decay)
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div className="marquee-wrapper" ref={wrapperRef} style={{ '--marquee-speed': '1' } as React.CSSProperties}>
      <div className="marquee">
        <div className="marquee-inner">
          <MarqueeRow items={roles} />
          <MarqueeRow items={roles} />
          <MarqueeRow items={roles} />
        </div>
      </div>
      <div className="marquee reverse">
        <div className="marquee-inner">
          <MarqueeRow items={tech} />
          <MarqueeRow items={tech} />
          <MarqueeRow items={tech} />
        </div>
      </div>
    </div>
  )
}
