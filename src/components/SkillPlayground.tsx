import { useEffect, useRef, useCallback, useState } from 'react'
import { haptic } from '../hooks/useHaptics'

const SKILLS = [
  { label: 'React', cat: 0 }, { label: 'Next.js', cat: 0 },
  { label: 'TypeScript', cat: 0 }, { label: 'Node.js', cat: 0 },
  { label: 'GSAP', cat: 0 }, { label: 'Cloudflare', cat: 0 },
  { label: 'Three.js', cat: 0 }, { label: 'Unity', cat: 1 },
  { label: 'C#', cat: 1 }, { label: 'GLSL', cat: 1 },
  { label: 'Blender', cat: 1 }, { label: 'WebGL', cat: 1 },
  { label: 'Python', cat: 2 }, { label: 'Vuforia', cat: 2 },
]

const CAT_COLORS = ['#FF4D00', '#6366F1', '#14B8A6']

interface Brick { x: number; y: number; w: number; h: number; label: string; color: string; alive: boolean }
interface Spark { x: number; y: number; vx: number; vy: number; life: number; color: string; r: number }

const BALL_R = 5
const PADDLE_H = 10
const BRICK_H = 26
const BRICK_PAD = 4
const AI_LERP = 0.08

export default function SkillPlayground() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [isHuman, setIsHuman] = useState(false)
  const dims = useRef({ w: 0, h: 0 })
  const bricks = useRef<Brick[]>([])
  const sparks = useRef<Spark[]>([])
  const humanInside = useRef(false)
  const accentCache = useRef('#FF4D00')
  const state = useRef({
    ballX: 0, ballY: 0, bvx: 0, bvy: 0,
    paddleX: 0, paddleW: 100,
    running: true, launched: false,
  })

  const resetBall = useCallback(() => {
    const { w, h } = dims.current
    const s = state.current
    s.ballX = w / 2
    s.ballY = h - 30 - BALL_R
    s.bvx = 0
    s.bvy = 0
    s.paddleX = w / 2
    s.launched = false
  }, [])

  const launchBall = useCallback(() => {
    if (state.current.launched) return
    state.current.launched = true
    const speed = 4
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.6
    state.current.bvx = Math.cos(angle) * speed
    state.current.bvy = Math.sin(angle) * speed
  }, [])

  const buildBricks = useCallback((ctx: CanvasRenderingContext2D) => {
    const { w } = dims.current
    ctx.font = '600 11px "Space Grotesk", sans-serif'
    const margin = 8
    const rows: Brick[][] = []
    let row: Brick[] = []
    let cx = margin
    SKILLS.forEach((s) => {
      const tw = ctx.measureText(s.label).width
      const bw = tw + 20
      if (cx + bw + margin > w && row.length > 0) { rows.push(row); row = []; cx = margin }
      row.push({ x: cx, y: 0, w: bw, h: BRICK_H, label: s.label, color: CAT_COLORS[s.cat], alive: true })
      cx += bw + BRICK_PAD
    })
    if (row.length) rows.push(row)
    const topPad = 12
    rows.forEach((r, ri) => {
      const totalW = r.reduce((a, b) => a + b.w, 0) + (r.length - 1) * BRICK_PAD
      let sx = (w - totalW) / 2
      r.forEach((b) => { b.x = sx; b.y = topPad + ri * (BRICK_H + BRICK_PAD); sx += b.w + BRICK_PAD })
    })
    bricks.current = rows.flat()
  }, [])

  const fullReset = useCallback((ctx: CanvasRenderingContext2D) => {
    buildBricks(ctx)
    resetBall()
    setScore(0)
    setLives(3)
    state.current.running = true
    sparks.current = []
  }, [buildBricks, resetBall])

  useEffect(() => {
    const wrap = wrapRef.current
    const canvas = canvasRef.current
    if (!wrap || !canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    accentCache.current = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#FF4D00'

    const resize = () => {
      const rect = wrap.getBoundingClientRect()
      const w = Math.round(rect.width)
      const h = Math.min(320, Math.max(220, Math.round(w / 3.2)))
      dims.current = { w, h }
      const dpr = Math.min(devicePixelRatio, 2)
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = w + 'px'
      canvas.style.height = h + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      state.current.paddleW = Math.max(60, w * 0.1)
      fullReset(ctx)
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(wrap)

    const onPointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      state.current.paddleX = e.clientX - rect.left
      if (!humanInside.current) {
        humanInside.current = true
        setIsHuman(true)
        fullReset(ctx)
        haptic('medium')
      }
    }
    const onPointerEnter = () => {
      if (!humanInside.current) {
        humanInside.current = true
        setIsHuman(true)
        fullReset(ctx)
        haptic('medium')
      }
    }
    const onPointerLeave = () => {
      humanInside.current = false
      setIsHuman(false)
    }
    const onTouch = (e: TouchEvent) => {
      e.preventDefault()
      const rect = canvas.getBoundingClientRect()
      state.current.paddleX = e.touches[0].clientX - rect.left
      if (!humanInside.current) {
        humanInside.current = true
        setIsHuman(true)
        fullReset(ctx)
        haptic('medium')
      }
    }
    const onClick = () => {
      if (state.current.running && !state.current.launched) {
        launchBall()
        haptic('light')
      }
    }

    wrap.addEventListener('pointermove', onPointerMove)
    wrap.addEventListener('pointerenter', onPointerEnter)
    wrap.addEventListener('pointerleave', onPointerLeave)
    wrap.addEventListener('touchmove', onTouch, { passive: false })
    wrap.addEventListener('click', onClick)

    let autoLaunchTimer = 0
    let rafId: number

    const loop = () => {
      const { w, h } = dims.current
      const s = state.current
      const sp = sparks.current
      const bs = bricks.current
      const accent = accentCache.current
      const aiMode = !humanInside.current

      ctx.clearRect(0, 0, w, h)

      ctx.strokeStyle = '#1a1a1a'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(0, h - 1)
      ctx.lineTo(w, h - 1)
      ctx.stroke()

      // auto-restart when all bricks gone
      if (bs.length > 0 && bs.every((b) => !b.alive)) {
        fullReset(ctx)
      }

      // AI paddle tracking
      if (aiMode && s.running) {
        const targetX = s.launched ? s.ballX + s.bvx * 8 : w / 2
        s.paddleX += (targetX - s.paddleX) * AI_LERP

        if (!s.launched) {
          autoLaunchTimer++
          if (autoLaunchTimer > 90) {
            launchBall()
            autoLaunchTimer = 0
          }
        }
      }

      // auto-restart on death in AI mode
      if (aiMode && !s.running) {
        fullReset(ctx)
      }

      // bricks
      ctx.font = '600 11px "Space Grotesk", sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      bs.forEach((b) => {
        if (!b.alive) return
        ctx.fillStyle = b.color
        ctx.globalAlpha = 0.85
        ctx.beginPath()
        ctx.roundRect(b.x, b.y, b.w, b.h, 4)
        ctx.fill()
        ctx.globalAlpha = 1
        ctx.fillStyle = '#fff'
        ctx.fillText(b.label, b.x + b.w / 2, b.y + b.h / 2 + 1)
      })

      // paddle
      const pw = s.paddleW
      const ph = PADDLE_H
      const px = Math.max(pw / 2, Math.min(w - pw / 2, s.paddleX))
      const py = h - 18
      ctx.fillStyle = aiMode ? '#444' : accent
      ctx.beginPath()
      ctx.roundRect(px - pw / 2, py - ph / 2, pw, ph, 5)
      ctx.fill()

      if (s.running) {
        if (!s.launched) {
          s.ballX = px
          s.ballY = py - ph / 2 - BALL_R - 2
        } else {
          s.ballX += s.bvx
          s.ballY += s.bvy

          if (s.ballX - BALL_R < 0) { s.ballX = BALL_R; s.bvx = Math.abs(s.bvx) }
          if (s.ballX + BALL_R > w) { s.ballX = w - BALL_R; s.bvx = -Math.abs(s.bvx) }
          if (s.ballY - BALL_R < 0) { s.ballY = BALL_R; s.bvy = Math.abs(s.bvy) }

          if (
            s.bvy > 0 && s.ballY + BALL_R >= py - ph / 2 && s.ballY - BALL_R <= py + ph / 2 &&
            s.ballX >= px - pw / 2 - BALL_R && s.ballX <= px + pw / 2 + BALL_R
          ) {
            const rel = (s.ballX - px) / (pw / 2)
            const speed = Math.sqrt(s.bvx * s.bvx + s.bvy * s.bvy)
            const angle = -Math.PI / 2 + rel * 0.7
            s.bvx = Math.cos(angle) * (speed + 0.05)
            s.bvy = Math.sin(angle) * (speed + 0.05)
            s.ballY = py - ph / 2 - BALL_R
            if (!aiMode) haptic('light')
          }

          for (const b of bs) {
            if (!b.alive) continue
            if (s.ballX + BALL_R > b.x && s.ballX - BALL_R < b.x + b.w &&
                s.ballY + BALL_R > b.y && s.ballY - BALL_R < b.y + b.h) {
              b.alive = false
              if (!aiMode) setScore((p) => p + 10)
              if (!aiMode) haptic('medium')
              for (let k = 0; k < 8; k++) {
                const a = Math.random() * Math.PI * 2
                const spd = 1 + Math.random() * 3
                sp.push({ x: b.x + b.w / 2, y: b.y + b.h / 2, vx: Math.cos(a) * spd, vy: Math.sin(a) * spd, life: 1, color: b.color, r: 2 + Math.random() * 2 })
              }
              const fromSide = s.ballX < b.x || s.ballX > b.x + b.w
              if (fromSide) s.bvx *= -1; else s.bvy *= -1
              break
            }
          }

          if (s.ballY > h + BALL_R) {
            if (aiMode) {
              resetBall()
              autoLaunchTimer = 0
            } else {
              setLives((p) => {
                const next = p - 1
                if (next <= 0) { s.running = false; haptic('heavy') }
                else { resetBall(); haptic('heavy') }
                return next
              })
            }
          }

          const maxV = 8
          s.bvx = Math.max(-maxV, Math.min(maxV, s.bvx))
          s.bvy = Math.max(-maxV, Math.min(maxV, s.bvy))
        }
      }

      // ball
      ctx.beginPath()
      ctx.arc(s.ballX, s.ballY, BALL_R, 0, Math.PI * 2)
      ctx.fillStyle = '#fff'
      ctx.fill()

      if (s.launched) {
        ctx.beginPath()
        ctx.arc(s.ballX, s.ballY, BALL_R * 3, 0, Math.PI * 2)
        const g = ctx.createRadialGradient(s.ballX, s.ballY, 0, s.ballX, s.ballY, BALL_R * 3)
        g.addColorStop(0, 'rgba(255,255,255,0.1)')
        g.addColorStop(1, 'rgba(255,255,255,0)')
        ctx.fillStyle = g
        ctx.fill()
      }

      // sparks
      for (let i = sp.length - 1; i >= 0; i--) {
        const p = sp[i]
        p.x += p.vx; p.y += p.vy; p.vy += 0.08; p.life -= 0.03
        if (p.life <= 0) { sp.splice(i, 1); continue }
        ctx.globalAlpha = p.life
        ctx.fillStyle = p.color
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r * p.life, 0, Math.PI * 2)
        ctx.fill()
        ctx.globalAlpha = 1
      }

      // AI mode label
      if (aiMode) {
        ctx.fillStyle = '#333'
        ctx.font = '500 10px "Space Grotesk", sans-serif'
        ctx.textAlign = 'right'
        ctx.fillText('AI playing', w - 12, h - 6)
      }

      // game over overlay (human only)
      if (!s.running && !aiMode) {
        ctx.fillStyle = 'rgba(10,10,10,0.6)'
        ctx.fillRect(0, 0, w, h)
        ctx.fillStyle = accent
        ctx.font = '700 16px "Space Grotesk", sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText('Game Over', w / 2, h / 2 - 8)
        ctx.fillStyle = '#666'
        ctx.font = '500 11px "Space Grotesk", sans-serif'
        ctx.fillText('Move cursor away and back to restart', w / 2, h / 2 + 14)
      }

      rafId = requestAnimationFrame(loop)
    }

    rafId = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(rafId)
      ro.disconnect()
      wrap.removeEventListener('pointermove', onPointerMove)
      wrap.removeEventListener('pointerenter', onPointerEnter)
      wrap.removeEventListener('pointerleave', onPointerLeave)
      wrap.removeEventListener('touchmove', onTouch)
      wrap.removeEventListener('click', onClick)
    }
  }, [buildBricks, resetBall, launchBall, fullReset])

  return (
    <div className="playground-wrapper">
      <div className="playground-header">
        <span className="playground-label">Skill Breaker</span>
        {isHuman && (
          <span className="playground-score">
            Score: {score}
            <span className="playground-lives">
              {Array.from({ length: Math.max(0, lives) }, (_, i) => (
                <span key={i} className="playground-heart" />
              ))}
            </span>
          </span>
        )}
      </div>
      <div className="playground-canvas-wrap" ref={wrapRef}>
        <canvas ref={canvasRef} className="playground-canvas" />
      </div>
      <p className="playground-hint">{isHuman ? 'Click to launch \u00B7 You\u2019re playing' : 'Hover to take control from the AI'}</p>
    </div>
  )
}
