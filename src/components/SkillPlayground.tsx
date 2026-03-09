import { useEffect, useRef, useCallback, useState } from 'react'
import { haptic } from '../hooks/useHaptics'

const SKILLS = [
  { label: 'React', cat: 0 },
  { label: 'Next.js', cat: 0 },
  { label: 'TypeScript', cat: 0 },
  { label: 'Node.js', cat: 0 },
  { label: 'GSAP', cat: 0 },
  { label: 'Cloudflare', cat: 0 },
  { label: 'Three.js', cat: 0 },
  { label: 'Unity', cat: 1 },
  { label: 'C#', cat: 1 },
  { label: 'GLSL', cat: 1 },
  { label: 'Blender', cat: 1 },
  { label: 'WebGL', cat: 1 },
  { label: 'Python', cat: 2 },
  { label: 'Vuforia', cat: 2 },
]

const CAT_COLORS = ['#FF4D00', '#6366F1', '#14B8A6']

interface Brick {
  x: number; y: number; w: number; h: number
  label: string; color: string; alive: boolean
}

interface Spark {
  x: number; y: number; vx: number; vy: number
  life: number; color: string; r: number
}

const BALL_R = 5
const PADDLE_H = 10
const BRICK_H = 26
const BRICK_PAD = 4

export default function SkillPlayground() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [started, setStarted] = useState(false)
  const [won, setWon] = useState(false)
  const [paused, setPaused] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const dims = useRef({ w: 0, h: 0 })
  const bricks = useRef<Brick[]>([])
  const sparks = useRef<Spark[]>([])
  const visible = useRef(true)
  const pointerInside = useRef(false)
  const accentCache = useRef('#FF4D00')
  const state = useRef({
    ballX: 0, ballY: 0, bvx: 0, bvy: 0,
    paddleX: 0, paddleW: 100,
    running: false, launched: false,
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
      if (cx + bw + margin > w && row.length > 0) {
        rows.push(row)
        row = []
        cx = margin
      }
      row.push({
        x: cx, y: 0, w: bw, h: BRICK_H,
        label: s.label, color: CAT_COLORS[s.cat], alive: true,
      })
      cx += bw + BRICK_PAD
    })
    if (row.length) rows.push(row)

    const topPad = 12
    rows.forEach((r, ri) => {
      const totalW = r.reduce((a, b) => a + b.w, 0) + (r.length - 1) * BRICK_PAD
      let sx = (w - totalW) / 2
      r.forEach((b) => {
        b.x = sx
        b.y = topPad + ri * (BRICK_H + BRICK_PAD)
        sx += b.w + BRICK_PAD
      })
    })

    bricks.current = rows.flat()
  }, [])

  const startGame = useCallback(() => {
    setStarted(true)
    setScore(0)
    setLives(3)
    setWon(false)
    setGameOver(false)
    setPaused(false)
    state.current.running = true
    sparks.current = []
    haptic('medium')
  }, [])

  const launch = useCallback(() => {
    if (state.current.launched) return
    state.current.launched = true
    const speed = 4
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.6
    state.current.bvx = Math.cos(angle) * speed
    state.current.bvy = Math.sin(angle) * speed
    haptic('light')
  }, [])

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
      buildBricks(ctx)
      resetBall()
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(wrap)

    const io = new IntersectionObserver(([e]) => {
      visible.current = e.isIntersecting
      if (!e.isIntersecting && state.current.running && state.current.launched) {
        setPaused(true)
      }
    }, { threshold: 0.1 })
    io.observe(canvas)

    const onPointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      state.current.paddleX = e.clientX - rect.left
    }
    const onPointerEnter = () => {
      pointerInside.current = true
      setPaused(false)
    }
    const onPointerLeave = () => {
      pointerInside.current = false
      if (state.current.running && state.current.launched) {
        setPaused(true)
      }
    }
    const onTouch = (e: TouchEvent) => {
      e.preventDefault()
      const rect = canvas.getBoundingClientRect()
      state.current.paddleX = e.touches[0].clientX - rect.left
    }
    const onTouchStart = () => {
      pointerInside.current = true
      setPaused(false)
    }
    const onTouchEnd = () => { pointerInside.current = false }
    const onClick = () => {
      if (state.current.running && !state.current.launched) launch()
    }

    canvas.addEventListener('pointermove', onPointerMove)
    canvas.addEventListener('pointerenter', onPointerEnter)
    canvas.addEventListener('pointerleave', onPointerLeave)
    canvas.addEventListener('touchmove', onTouch, { passive: false })
    canvas.addEventListener('touchstart', onTouchStart, { passive: true })
    canvas.addEventListener('touchend', onTouchEnd)
    canvas.addEventListener('click', onClick)

    let rafId: number

    const loop = () => {
      const { w, h } = dims.current
      const s = state.current
      const sp = sparks.current
      const bs = bricks.current
      const accent = accentCache.current
      const isPaused = !visible.current || !pointerInside.current

      ctx.clearRect(0, 0, w, h)

      ctx.strokeStyle = '#1a1a1a'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(0, h - 1)
      ctx.lineTo(w, h - 1)
      ctx.stroke()

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

      const pw = s.paddleW
      const ph = PADDLE_H
      const px = Math.max(pw / 2, Math.min(w - pw / 2, s.paddleX))
      const py = h - 18
      ctx.fillStyle = accent
      ctx.beginPath()
      ctx.roundRect(px - pw / 2, py - ph / 2, pw, ph, 5)
      ctx.fill()

      if (s.running && !isPaused) {
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
            s.bvy > 0 &&
            s.ballY + BALL_R >= py - ph / 2 &&
            s.ballY - BALL_R <= py + ph / 2 &&
            s.ballX >= px - pw / 2 - BALL_R &&
            s.ballX <= px + pw / 2 + BALL_R
          ) {
            const rel = (s.ballX - px) / (pw / 2)
            const speed = Math.sqrt(s.bvx * s.bvx + s.bvy * s.bvy)
            const angle = -Math.PI / 2 + rel * 0.7
            s.bvx = Math.cos(angle) * (speed + 0.05)
            s.bvy = Math.sin(angle) * (speed + 0.05)
            s.ballY = py - ph / 2 - BALL_R
            haptic('light')
          }

          for (const b of bs) {
            if (!b.alive) continue
            if (
              s.ballX + BALL_R > b.x && s.ballX - BALL_R < b.x + b.w &&
              s.ballY + BALL_R > b.y && s.ballY - BALL_R < b.y + b.h
            ) {
              b.alive = false
              setScore((p) => p + 10)
              haptic('medium')
              for (let k = 0; k < 8; k++) {
                const a = Math.random() * Math.PI * 2
                const spd = 1 + Math.random() * 3
                sp.push({
                  x: b.x + b.w / 2, y: b.y + b.h / 2,
                  vx: Math.cos(a) * spd, vy: Math.sin(a) * spd,
                  life: 1, color: b.color, r: 2 + Math.random() * 2,
                })
              }
              const fromSide = s.ballX < b.x || s.ballX > b.x + b.w
              if (fromSide) s.bvx *= -1; else s.bvy *= -1
              break
            }
          }

          if (s.ballY > h + BALL_R) {
            setLives((p) => {
              const next = p - 1
              if (next <= 0) {
                s.running = false
                setGameOver(true)
                haptic('heavy')
              } else {
                resetBall()
                haptic('heavy')
              }
              return next
            })
          }

          if (bs.length > 0 && bs.every((b) => !b.alive)) {
            s.running = false
            setWon(true)
            haptic('heavy')
          }

          const maxV = 8
          s.bvx = Math.max(-maxV, Math.min(maxV, s.bvx))
          s.bvy = Math.max(-maxV, Math.min(maxV, s.bvy))
        }
      }

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

      if (isPaused && s.running && s.launched) {
        ctx.fillStyle = 'rgba(10,10,10,0.5)'
        ctx.fillRect(0, 0, w, h)
        ctx.fillStyle = '#fff'
        ctx.font = '600 14px "Space Grotesk", sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText('PAUSED', w / 2, h / 2 - 8)
        ctx.font = '500 11px "Space Grotesk", sans-serif'
        ctx.fillStyle = '#666'
        ctx.fillText('Move cursor back to resume', w / 2, h / 2 + 12)
      }

      rafId = requestAnimationFrame(loop)
    }

    rafId = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(rafId)
      io.disconnect()
      ro.disconnect()
      canvas.removeEventListener('pointermove', onPointerMove)
      canvas.removeEventListener('pointerenter', onPointerEnter)
      canvas.removeEventListener('pointerleave', onPointerLeave)
      canvas.removeEventListener('touchmove', onTouch)
      canvas.removeEventListener('touchstart', onTouchStart)
      canvas.removeEventListener('touchend', onTouchEnd)
      canvas.removeEventListener('click', onClick)
    }
  }, [buildBricks, resetBall, launch])

  const restart = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    buildBricks(ctx)
    resetBall()
    setScore(0)
    setLives(3)
    setWon(false)
    setGameOver(false)
    setPaused(false)
    state.current.running = true
    sparks.current = []
    haptic('medium')
  }

  const showOverlay = (!started) || (started && (won || gameOver))

  return (
    <div className="playground-wrapper">
      <div className="playground-header">
        {started && (
          <>
            <span className="playground-score">Score: {score}</span>
            <span className="playground-lives">
              {Array.from({ length: Math.max(0, lives) }, (_, i) => (
                <span key={i} className="playground-heart" />
              ))}
            </span>
          </>
        )}
      </div>
      <div className="playground-canvas-wrap" ref={wrapRef}>
        <canvas ref={canvasRef} className="playground-canvas" />
        {showOverlay && (
          <button className="playground-start" onClick={!started ? startGame : restart}>
            <span className="playground-start-title">
              {!started ? 'Skill Breaker' : won ? `Cleared! ${score} pts` : `Game Over — ${score} pts`}
            </span>
            <span className="playground-start-sub">
              {!started ? 'Smash through the tech stack' : 'Tap to play again'}
            </span>
          </button>
        )}
      </div>
      {started && state.current.running && !state.current.launched && !paused && (
        <p className="playground-hint">Click or tap to launch</p>
      )}
    </div>
  )
}
