import { useEffect, useRef } from 'react'
import { haptic } from '../hooks/useHaptics'

const SKILLS = [
  'React', 'Next.js', 'TypeScript', 'Node.js', 'Unity',
  'C#', 'GLSL', 'Blender', 'GSAP', 'Python',
  'Cloudflare', 'Vuforia', 'Three.js', 'WebGL',
]

interface Particle {
  x: number
  y: number
  ox: number
  oy: number
  vx: number
  vy: number
  r: number
  label: string | null
  alpha: number
}

const LINK_DIST = 120
const MOUSE_RADIUS = 140
const MOUSE_FORCE = 0.08
const RETURN_FORCE = 0.02
const FRICTION = 0.92
const DOT_COUNT = 60

export default function SkillConstellation() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particles = useRef<Particle[]>([])
  const mouse = useRef({ x: -9999, y: -9999, active: false })
  const dims = useRef({ w: 0, h: 0 })
  const inited = useRef(false)

  useEffect(() => {
    const wrap = wrapRef.current
    const canvas = canvasRef.current
    if (!wrap || !canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const initParticles = () => {
      const { w, h } = dims.current
      if (w === 0) return
      const arr: Particle[] = []

      SKILLS.forEach((label) => {
        arr.push({
          x: Math.random() * w,
          y: Math.random() * h,
          ox: 0, oy: 0,
          vx: 0, vy: 0,
          r: 3,
          label,
          alpha: 1,
        })
      })

      for (let i = 0; i < DOT_COUNT; i++) {
        arr.push({
          x: Math.random() * w,
          y: Math.random() * h,
          ox: 0, oy: 0,
          vx: 0, vy: 0,
          r: 1.5 + Math.random() * 1.5,
          label: null,
          alpha: 0.3 + Math.random() * 0.3,
        })
      }

      arr.forEach((p) => { p.ox = p.x; p.oy = p.y })
      particles.current = arr
      inited.current = true
    }

    const resize = () => {
      const rect = wrap.getBoundingClientRect()
      const w = Math.round(rect.width)
      const h = Math.min(400, Math.round(w / 2.8))
      dims.current = { w, h }
      const dpr = Math.min(devicePixelRatio, 2)
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = w + 'px'
      canvas.style.height = h + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      if (!inited.current) {
        initParticles()
      } else {
        particles.current.forEach((p) => {
          p.ox = Math.min(p.ox, w)
          p.oy = Math.min(p.oy, h)
          p.x = Math.min(p.x, w)
          p.y = Math.min(p.y, h)
        })
      }
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(wrap)

    let hapticked = false

    const onPointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouse.current.x = e.clientX - rect.left
      mouse.current.y = e.clientY - rect.top
      mouse.current.active = true
      if (!hapticked) { haptic('light'); hapticked = true }
    }
    const onPointerLeave = () => {
      mouse.current.active = false
      hapticked = false
    }
    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault()
      const rect = canvas.getBoundingClientRect()
      mouse.current.x = e.touches[0].clientX - rect.left
      mouse.current.y = e.touches[0].clientY - rect.top
      mouse.current.active = true
    }
    const onTouchEnd = () => { mouse.current.active = false }

    canvas.addEventListener('pointermove', onPointerMove)
    canvas.addEventListener('pointerleave', onPointerLeave)
    canvas.addEventListener('touchmove', onTouchMove, { passive: false })
    canvas.addEventListener('touchend', onTouchEnd)

    let rafId: number

    const draw = () => {
      const { w, h } = dims.current
      const pts = particles.current
      const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#FF4D00'

      ctx.clearRect(0, 0, w, h)

      // connection lines
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x
          const dy = pts[i].y - pts[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < LINK_DIST) {
            const alpha = (1 - dist / LINK_DIST) * 0.08
            ctx.strokeStyle = `rgba(255,255,255,${alpha})`
            ctx.lineWidth = 0.5
            ctx.beginPath()
            ctx.moveTo(pts[i].x, pts[i].y)
            ctx.lineTo(pts[j].x, pts[j].y)
            ctx.stroke()
          }
        }
      }

      // mouse glow
      if (mouse.current.active) {
        const g = ctx.createRadialGradient(
          mouse.current.x, mouse.current.y, 0,
          mouse.current.x, mouse.current.y, MOUSE_RADIUS,
        )
        g.addColorStop(0, accent + '0a')
        g.addColorStop(1, accent + '00')
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(mouse.current.x, mouse.current.y, MOUSE_RADIUS, 0, Math.PI * 2)
        ctx.fill()
      }

      // update & draw particles
      pts.forEach((p) => {
        if (mouse.current.active) {
          const dx = p.x - mouse.current.x
          const dy = p.y - mouse.current.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < MOUSE_RADIUS && dist > 0) {
            const force = (1 - dist / MOUSE_RADIUS) * MOUSE_FORCE
            p.vx += (dx / dist) * force * 20
            p.vy += (dy / dist) * force * 20
          }
        }

        p.vx += (p.ox - p.x) * RETURN_FORCE
        p.vy += (p.oy - p.y) * RETURN_FORCE
        p.vx *= FRICTION
        p.vy *= FRICTION
        p.x += p.vx
        p.y += p.vy

        // dot
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        if (p.label) {
          ctx.fillStyle = accent
        } else {
          ctx.fillStyle = `rgba(255,255,255,${p.alpha})`
        }
        ctx.fill()

        // label
        if (p.label) {
          ctx.font = '500 11px "Space Grotesk", sans-serif'
          ctx.fillStyle = `rgba(235,235,235,0.7)`
          ctx.textAlign = 'center'
          ctx.fillText(p.label, p.x, p.y - 10)
        }
      })

      rafId = requestAnimationFrame(draw)
    }

    rafId = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(rafId)
      ro.disconnect()
      canvas.removeEventListener('pointermove', onPointerMove)
      canvas.removeEventListener('pointerleave', onPointerLeave)
      canvas.removeEventListener('touchmove', onTouchMove)
      canvas.removeEventListener('touchend', onTouchEnd)
    }
  }, [])

  return (
    <div className="constellation-wrapper">
      <div className="constellation-canvas-wrap" ref={wrapRef}>
        <canvas ref={canvasRef} className="constellation-canvas" />
      </div>
      <p className="constellation-hint">Move your cursor to interact</p>
    </div>
  )
}
