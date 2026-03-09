import { useEffect, useRef, useCallback } from 'react'
import { haptic } from '../hooks/useHaptics'

const SKILLS = [
  { label: 'React', cat: 0 },
  { label: 'Next.js', cat: 0 },
  { label: 'TypeScript', cat: 0 },
  { label: 'Node.js', cat: 0 },
  { label: 'Unity', cat: 1 },
  { label: 'C#', cat: 1 },
  { label: 'GLSL', cat: 1 },
  { label: 'Blender', cat: 1 },
  { label: 'Python', cat: 2 },
  { label: 'GSAP', cat: 0 },
  { label: 'Cloudflare', cat: 0 },
  { label: 'Three.js', cat: 0 },
  { label: 'WebGL', cat: 1 },
  { label: 'Vuforia', cat: 1 },
]

const CAT_COLORS = ['#FF4D00', '#6366F1', '#14B8A6']
const GRAVITY = 0.35
const BOUNCE = 0.55
const FRICTION = 0.985
const THROW_SCALE = 0.8

interface Body {
  x: number; y: number
  vx: number; vy: number
  w: number; h: number
  label: string; color: string
  angle: number; va: number
}

export default function SkillPlayground() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const bodies = useRef<Body[]>([])
  const dims = useRef({ w: 0, h: 0 })
  const drag = useRef<{
    idx: number; offX: number; offY: number
    lastX: number; lastY: number; lastT: number
  } | null>(null)
  const inited = useRef(false)

  const measure = useCallback((ctx: CanvasRenderingContext2D) => {
    const font = '600 12px "Space Grotesk", sans-serif'
    ctx.font = font
    return SKILLS.map(s => {
      const m = ctx.measureText(s.label)
      return { ...s, tw: m.width }
    })
  }, [])

  useEffect(() => {
    const wrap = wrapRef.current
    const canvas = canvasRef.current
    if (!wrap || !canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const init = () => {
      const { w } = dims.current
      if (w === 0 || inited.current) return
      const measured = measure(ctx)
      const arr: Body[] = measured.map((s, i) => {
        const bw = s.tw + 24
        const bh = 30
        const cols = 5
        const gapX = w / (cols + 1)
        const row = Math.floor(i / cols)
        const col = i % cols
        return {
          x: gapX * (col + 1) + (Math.random() - 0.5) * 20,
          y: -40 - row * 50 - Math.random() * 60,
          vx: (Math.random() - 0.5) * 2,
          vy: 0,
          w: bw, h: bh,
          label: s.label,
          color: CAT_COLORS[s.cat],
          angle: 0, va: (Math.random() - 0.5) * 0.02,
        }
      })
      bodies.current = arr
      inited.current = true
    }

    const resize = () => {
      const rect = wrap.getBoundingClientRect()
      const w = Math.round(rect.width)
      const h = Math.min(340, Math.max(200, Math.round(w / 3.5)))
      dims.current = { w, h }
      const dpr = Math.min(devicePixelRatio, 2)
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = w + 'px'
      canvas.style.height = h + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      init()
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(wrap)

    const getPointer = (e: PointerEvent | Touch): [number, number] => {
      const rect = canvas.getBoundingClientRect()
      return [e.clientX - rect.left, e.clientY - rect.top]
    }

    const hitTest = (px: number, py: number): number => {
      for (let i = bodies.current.length - 1; i >= 0; i--) {
        const b = bodies.current[i]
        if (px >= b.x - b.w / 2 && px <= b.x + b.w / 2 &&
            py >= b.y - b.h / 2 && py <= b.y + b.h / 2) return i
      }
      return -1
    }

    const onDown = (e: PointerEvent) => {
      const [px, py] = getPointer(e)
      const idx = hitTest(px, py)
      if (idx >= 0) {
        canvas.setPointerCapture(e.pointerId)
        const b = bodies.current[idx]
        drag.current = {
          idx, offX: px - b.x, offY: py - b.y,
          lastX: px, lastY: py, lastT: performance.now(),
        }
        b.vx = 0; b.vy = 0; b.va = 0
        haptic('light')
      }
    }

    const onMove = (e: PointerEvent) => {
      if (!drag.current) return
      const [px, py] = getPointer(e)
      const b = bodies.current[drag.current.idx]
      b.x = px - drag.current.offX
      b.y = py - drag.current.offY
      drag.current.lastX = px
      drag.current.lastY = py
      drag.current.lastT = performance.now()
    }

    const onUp = (e: PointerEvent) => {
      if (!drag.current) return
      const [px, py] = getPointer(e)
      const dt = Math.max(1, performance.now() - drag.current.lastT)
      const b = bodies.current[drag.current.idx]
      b.vx = ((px - drag.current.lastX) / dt) * 16 * THROW_SCALE
      b.vy = ((py - drag.current.lastY) / dt) * 16 * THROW_SCALE
      b.va = b.vx * 0.01
      drag.current = null
      haptic('medium')
    }

    canvas.addEventListener('pointerdown', onDown)
    canvas.addEventListener('pointermove', onMove)
    canvas.addEventListener('pointerup', onUp)
    canvas.addEventListener('pointercancel', () => { drag.current = null })

    let rafId: number

    const loop = () => {
      const { w, h } = dims.current
      const bs = bodies.current

      ctx.clearRect(0, 0, w, h)

      // floor line
      ctx.strokeStyle = '#1e1e1e'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(0, h - 1)
      ctx.lineTo(w, h - 1)
      ctx.stroke()

      for (let i = 0; i < bs.length; i++) {
        const b = bs[i]
        const isDragged = drag.current?.idx === i

        if (!isDragged) {
          b.vy += GRAVITY
          b.vx *= FRICTION
          b.vy *= FRICTION
          b.x += b.vx
          b.y += b.vy
          b.angle += b.va
          b.va *= 0.98

          // walls
          const hw = b.w / 2, hh = b.h / 2
          if (b.y + hh > h) { b.y = h - hh; b.vy *= -BOUNCE; b.va *= 0.8; b.vx *= 0.95 }
          if (b.x - hw < 0) { b.x = hw; b.vx *= -BOUNCE }
          if (b.x + hw > w) { b.x = w - hw; b.vx *= -BOUNCE }
          if (b.y - hh < 0) { b.y = hh; b.vy *= -BOUNCE }

          // body-body collisions (simple push)
          for (let j = i + 1; j < bs.length; j++) {
            const o = bs[j]
            const dx = o.x - b.x
            const dy = o.y - b.y
            const minDist = (b.w + o.w) / 2 * 0.7
            const dist = Math.sqrt(dx * dx + dy * dy)
            if (dist < minDist && dist > 0) {
              const nx = dx / dist, ny = dy / dist
              const overlap = (minDist - dist) / 2
              b.x -= nx * overlap
              b.y -= ny * overlap
              o.x += nx * overlap
              o.y += ny * overlap
              const dvx = b.vx - o.vx
              const dvy = b.vy - o.vy
              const dot = dvx * nx + dvy * ny
              if (dot > 0) {
                b.vx -= dot * nx * 0.5
                b.vy -= dot * ny * 0.5
                o.vx += dot * nx * 0.5
                o.vy += dot * ny * 0.5
              }
            }
          }
        }

        // draw
        ctx.save()
        ctx.translate(b.x, b.y)
        ctx.rotate(b.angle)

        const alpha = isDragged ? 1 : 0.85
        ctx.fillStyle = b.color + (isDragged ? '' : 'dd')
        ctx.globalAlpha = alpha
        ctx.beginPath()
        ctx.roundRect(-b.w / 2, -b.h / 2, b.w, b.h, 6)
        ctx.fill()

        if (isDragged) {
          ctx.shadowColor = b.color
          ctx.shadowBlur = 20
          ctx.fill()
          ctx.shadowBlur = 0
        }

        ctx.fillStyle = '#fff'
        ctx.globalAlpha = isDragged ? 1 : 0.9
        ctx.font = '600 12px "Space Grotesk", sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(b.label, 0, 1)

        ctx.restore()
        ctx.globalAlpha = 1
      }

      rafId = requestAnimationFrame(loop)
    }

    rafId = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(rafId)
      ro.disconnect()
      canvas.removeEventListener('pointerdown', onDown)
      canvas.removeEventListener('pointermove', onMove)
      canvas.removeEventListener('pointerup', onUp)
    }
  }, [measure])

  return (
    <div className="playground-wrapper">
      <div className="playground-canvas-wrap" ref={wrapRef}>
        <canvas ref={canvasRef} className="playground-canvas" />
      </div>
      <p className="playground-hint">Grab &amp; throw the skills around</p>
    </div>
  )
}
