import { useEffect, useRef, useState } from 'react'
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

interface Brick {
  x: number; y: number; w: number; h: number
  label: string; color: string; alive: boolean
}

interface Particle {
  x: number; y: number; vx: number; vy: number
  life: number; color: string; size: number
}

const BALL_R = 5
const PADDLE_H = 10
const BRICK_H = 26
const BRICK_GAP = 4
const SPEED_INIT = 3.5
const SPEED_MAX = 8
const AI_SPEED = 8
const AI_DRIFT_SPEED = 3
const AI_DEAD_ZONE = 3
const DESCEND_BASE = 0.04
const DESCEND_MAX = 0.14
const DESCEND_BRICK_CAP = 15 // alive-brick count that counts as "full"
const SPAWN_INTERVAL = 120

export default function SkillPlayground() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [mode, setMode] = useState<'ai' | 'human'>('ai')
  const [isTouch] = useState(
    () => 'ontouchstart' in window || navigator.maxTouchPoints > 0
  )

  const dims = useRef({ w: 0, h: 0 })
  const bricksRef = useRef<Brick[]>([])
  const particlesRef = useRef<Particle[]>([])
  const accentRef = useRef('#FF4D00')
  const game = useRef({
    bx: 0, by: 0, vx: 0, vy: 0,
    px: 0, pw: 100,
    launched: false, over: false,
    human: false, aiTimer: 0,
    score: 0, lives: 3,
    spawnTimer: 0, waveIdx: 0,
    // AI prediction cache — only re-predict when ball direction changes
    aiPredX: 0, aiLastDxSign: 0, aiLastDySign: 0,
  })
  const tapRef = useRef({ x: 0, y: 0, t: 0, moved: false, blocked: false })
  const lastPtrType = useRef('mouse')

  useEffect(() => {
    const wrap = wrapRef.current
    const canvas = canvasRef.current
    if (!wrap || !canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const touchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
    accentRef.current =
      getComputedStyle(document.documentElement)
        .getPropertyValue('--accent').trim() || '#FF4D00'

    const buildBricks = () => {
      const { w } = dims.current
      ctx.font = '600 11px "Space Grotesk", sans-serif'
      const rows: Brick[][] = []
      let row: Brick[] = []
      let cx = 8
      for (const s of SKILLS) {
        const bw = ctx.measureText(s.label).width + 20
        if (cx + bw + 8 > w && row.length) { rows.push(row); row = []; cx = 8 }
        row.push({ x: cx, y: 0, w: bw, h: BRICK_H, label: s.label, color: CAT_COLORS[s.cat], alive: true })
        cx += bw + BRICK_GAP
      }
      if (row.length) rows.push(row)
      const top = -(rows.length * (BRICK_H + BRICK_GAP))
      rows.forEach((r, ri) => {
        const tw = r.reduce((a, b) => a + b.w, 0) + (r.length - 1) * BRICK_GAP
        let sx = (w - tw) / 2
        r.forEach(b => { b.x = sx; b.y = top + ri * (BRICK_H + BRICK_GAP); sx += b.w + BRICK_GAP })
      })
      bricksRef.current = rows.flat()
    }

    const spawnRow = () => {
      const { w } = dims.current
      ctx.font = '600 11px "Space Grotesk", sans-serif'
      const g = game.current
      g.waveIdx++
      const start = (g.waveIdx * 5) % SKILLS.length
      const baseCount = 4 + (g.waveIdx % 3)
      // AI gets extra bricks, scaling with wave progression
      const count = !g.human ? Math.min(baseCount + 1 + Math.floor(g.waveIdx / 5), SKILLS.length) : baseCount
      const selected: typeof SKILLS[number][] = []
      for (let i = 0; i < count; i++) {
        selected.push(SKILLS[(start + i) % SKILLS.length])
      }
      const newBricks: Brick[] = selected.map(s => ({
        x: 0, y: -(BRICK_H + BRICK_GAP), w: ctx.measureText(s.label).width + 20,
        h: BRICK_H, label: s.label, color: CAT_COLORS[s.cat], alive: true,
      }))
      const tw = newBricks.reduce((a, b) => a + b.w, 0) + (newBricks.length - 1) * BRICK_GAP
      // Vary horizontal position: alternate left/center/right across waves
      const positions = [0.5, 0.3, 0.7, 0.4, 0.6]
      const anchor = positions[g.waveIdx % positions.length]
      let sx = Math.max(4, Math.min(w - tw - 4, w * anchor - tw / 2))
      for (const b of newBricks) { b.x = sx; sx += b.w + BRICK_GAP }
      bricksRef.current.push(...newBricks)
    }

    const resetBall = () => {
      const g = game.current
      const { w, h } = dims.current
      g.bx = g.human ? Math.max(g.pw / 2, Math.min(w - g.pw / 2, g.px)) : w / 2
      g.by = h - 30 - BALL_R
      g.vx = 0; g.vy = 0; g.launched = false
      if (!g.human) g.px = w / 2
    }

    const launch = () => {
      const g = game.current
      if (g.launched || g.over) return
      g.launched = true
      const a = -Math.PI / 2 + (Math.random() - 0.5) * 0.6
      g.vx = Math.cos(a) * SPEED_INIT
      g.vy = Math.sin(a) * SPEED_INIT
    }

    const fullReset = () => {
      const g = game.current
      buildBricks()
      g.lives = 3; g.score = 0; g.over = false; g.aiTimer = 0
      g.spawnTimer = 0; g.waveIdx = 0
      g.aiPredX = dims.current.w / 2; g.aiLastDxSign = 0; g.aiLastDySign = 0
      particlesRef.current = []
      setScore(0); setLives(3)
      resetBall()
    }

    const goHuman = () => {
      const g = game.current
      if (g.human) return
      g.human = true; setMode('human')
      // No full reset — just switch control; keep game state
      if (g.over) {
        fullReset()
      }
      haptic('medium')
    }

    const goAI = () => {
      const g = game.current
      if (!g.human) return
      g.human = false; setMode('ai')
      // No full reset — AI takes over where player left off
      if (g.over) {
        fullReset()
      }
    }

    const resize = () => {
      const r = wrap.getBoundingClientRect()
      const w = Math.round(r.width)
      const h = Math.min(320, Math.max(220, Math.round(w / 3.2)))
      dims.current = { w, h }
      const dpr = Math.min(devicePixelRatio, 2)
      canvas.width = w * dpr; canvas.height = h * dpr
      canvas.style.width = w + 'px'; canvas.style.height = h + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      game.current.pw = Math.max(60, w * 0.12)
      fullReset()
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(wrap)

    const predictLanding = (w: number, py: number): number => {
      const g = game.current
      let x = g.bx, y = g.by, dx = g.vx, dy = g.vy
      for (let i = 0; i < 600; i++) {
        x += dx; y += dy
        if (x < BALL_R) { x = BALL_R; dx = -dx }
        if (x > w - BALL_R) { x = w - BALL_R; dx = -dx }
        if (y < BALL_R) { y = BALL_R; dy = -dy }
        if (y >= py) return x
      }
      return x
    }

    /* ── Input handlers ── */

    const onPointerDown = (e: PointerEvent) => {
      lastPtrType.current = e.pointerType
      if (e.pointerType !== 'touch') return

      const g = game.current
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left

      tapRef.current = { x: e.clientX, y: e.clientY, t: Date.now(), moved: false, blocked: false }

      if (!g.human) {
        goHuman(); g.px = x
        tapRef.current.blocked = true
        return
      }
      if (g.over) {
        fullReset()
        tapRef.current.blocked = true
        return
      }
      g.px = x
    }

    const onPointerMove = (e: PointerEvent) => {
      const g = game.current
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left

      if (e.pointerType === 'mouse') {
        g.px = x
        if (!g.human) goHuman()
      } else if (e.pointerType === 'touch') {
        g.px = x
        const dx = e.clientX - tapRef.current.x
        const dy = e.clientY - tapRef.current.y
        if (dx * dx + dy * dy > 64) tapRef.current.moved = true
      }
    }

    const onPointerUp = (e: PointerEvent) => {
      if (e.pointerType !== 'touch') return
      const tp = tapRef.current
      const g = game.current
      if (tp.blocked) return
      if (!tp.moved && Date.now() - tp.t < 300 && !g.launched && !g.over && g.human) {
        launch(); haptic('light')
      }
    }

    const onPointerEnter = (e: PointerEvent) => {
      if (e.pointerType === 'mouse' && !game.current.human) goHuman()
    }

    const onPointerLeave = (e: PointerEvent) => {
      if (e.pointerType === 'mouse') goAI()
    }

    const onClick = () => {
      if (lastPtrType.current !== 'mouse') return
      const g = game.current
      if (!g.human) return
      if (g.over) { fullReset(); return }
      if (!g.launched) { launch(); haptic('light') }
    }

    wrap.addEventListener('pointerdown', onPointerDown)
    wrap.addEventListener('pointermove', onPointerMove)
    wrap.addEventListener('pointerup', onPointerUp)
    wrap.addEventListener('pointerenter', onPointerEnter)
    wrap.addEventListener('pointerleave', onPointerLeave)
    wrap.addEventListener('click', onClick)

    /* ── Game loop ── */

    let raf = 0

    const loop = () => {
      const { w, h } = dims.current
      const g = game.current
      const bs = bricksRef.current
      const ps = particlesRef.current
      const ac = accentRef.current
      const ai = !g.human
      const py = h - 18

      ctx.clearRect(0, 0, w, h)

      ctx.strokeStyle = '#1a1a1a'; ctx.lineWidth = 1
      ctx.beginPath(); ctx.moveTo(0, h - 1); ctx.lineTo(w, h - 1); ctx.stroke()

      /* ── Brick descent & spawning ── */
      // Dynamic speed: fewer bricks → faster, more → slower; ramps with progression
      const aliveCount = bs.filter(b => b.alive).length
      const brickFactor = 1 - Math.min(aliveCount / DESCEND_BRICK_CAP, 1) // 0 (full) → 1 (empty)
      const progressFactor = 1 + Math.min(g.waveIdx / 12, 1) // 1× → 2× over ~12 waves
      const modeFactor = ai ? 1.5 : 1
      const descendSpeed = Math.min(
        DESCEND_MAX,
        DESCEND_BASE + (DESCEND_MAX - DESCEND_BASE) * brickFactor * progressFactor * modeFactor,
      )
      for (const b of bs) {
        if (b.alive) b.y += descendSpeed
      }

      bricksRef.current = bs.filter(b => b.alive && b.y < py - PADDLE_H - BALL_R)

      g.spawnTimer++
      const aliveBricks = bricksRef.current.filter(b => b.alive)
      const hasAlive = aliveBricks.length > 0
      const spawnInterval = ai ? Math.max(50, SPAWN_INTERVAL - g.waveIdx * 5) : SPAWN_INTERVAL

      if (g.spawnTimer >= spawnInterval || !hasAlive) {
        // Find the topmost alive brick
        let minY = Infinity
        for (const b of bricksRef.current) {
          if (b.alive && b.y < minY) minY = b.y
        }
        // Spawn when topmost brick has scrolled into view (past y=0) or no bricks
        if (minY > BRICK_H + BRICK_GAP || !hasAlive) {
          spawnRow()
          g.spawnTimer = 0
        }
      }

      const currentBs = bricksRef.current

      /* ── AI logic ── */
      if (ai) {
        if (g.over) fullReset()

        if (g.launched) {
          // Re-predict landing only when ball direction changes
          const dxSign = g.vx > 0 ? 1 : -1
          const dySign = g.vy > 0 ? 1 : -1
          if (dxSign !== g.aiLastDxSign || dySign !== g.aiLastDySign) {
            g.aiPredX = predictLanding(w, py)
            g.aiLastDxSign = dxSign
            g.aiLastDySign = dySign
          }

          let targetPX: number

          if (g.vy > 0) {
            // Ball descending — aim the bounce toward the lowest alive brick
            const landX = g.aiPredX

            // Find lowest alive brick (closest to paddle = highest priority)
            let targetBrick: Brick | null = null
            let maxBY = -1
            for (const b of currentBs) {
              if (!b.alive) continue
              if (b.y + b.h > maxBY) { maxBY = b.y + b.h; targetBrick = b }
            }

            if (targetBrick) {
              const bCx = targetBrick.x + targetBrick.w / 2
              const bCy = targetBrick.y + targetBrick.h / 2
              // Desired angle from landing point to target brick
              const desiredAng = Math.atan2(bCy - py, bCx - landX)
              // Solve: -π/2 + rel * 0.7 = desiredAng → rel = (desiredAng + π/2) / 0.7
              let desiredRel = (desiredAng + Math.PI / 2) / 0.7
              desiredRel = Math.max(-0.85, Math.min(0.85, desiredRel))
              // Position paddle so ball hits at this rel offset
              targetPX = landX - desiredRel * g.pw / 2
            } else {
              targetPX = landX
            }
          } else {
            // Ball ascending — pre-position near the lowest brick
            let targetBrick: Brick | null = null
            let maxBY = -1
            for (const b of currentBs) {
              if (!b.alive) continue
              if (b.y + b.h > maxBY) { maxBY = b.y + b.h; targetBrick = b }
            }
            targetPX = targetBrick ? targetBrick.x + targetBrick.w / 2 : w / 2
          }

          targetPX = Math.max(g.pw / 2, Math.min(w - g.pw / 2, targetPX))

          const speed = g.vy > 0 ? AI_SPEED : AI_DRIFT_SPEED
          const diff = targetPX - g.px
          if (Math.abs(diff) > AI_DEAD_ZONE) {
            g.px += Math.sign(diff) * Math.min(Math.abs(diff), speed)
          }
        } else {
          const diff = w / 2 - g.px
          if (Math.abs(diff) > AI_DEAD_ZONE) {
            g.px += Math.sign(diff) * Math.min(Math.abs(diff), AI_DRIFT_SPEED)
          }
          g.aiTimer++
          if (g.aiTimer > 60) { launch(); g.aiTimer = 0 }
        }
      }

      /* ── Draw bricks ── */
      ctx.font = '600 11px "Space Grotesk", sans-serif'
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      for (const b of currentBs) {
        if (!b.alive || b.y + b.h < 0) continue
        ctx.fillStyle = b.color; ctx.globalAlpha = 0.85
        ctx.beginPath(); ctx.roundRect(b.x, b.y, b.w, b.h, 4); ctx.fill()
        ctx.globalAlpha = 1; ctx.fillStyle = '#fff'
        ctx.fillText(b.label, b.x + b.w / 2, b.y + b.h / 2 + 1)
      }

      /* ── Paddle (drawn after bricks so it’s on top) ── */
      const pw = g.pw
      const px = Math.max(pw / 2, Math.min(w - pw / 2, g.px))
      ctx.fillStyle = ai ? '#444' : ac
      ctx.beginPath(); ctx.roundRect(px - pw / 2, py - PADDLE_H / 2, pw, PADDLE_H, 5); ctx.fill()

      /* ── Ball physics ── */
      if (!g.over) {
        if (!g.launched) {
          g.bx = px; g.by = py - PADDLE_H / 2 - BALL_R - 2
        } else {
          g.bx += g.vx; g.by += g.vy

          if (g.bx - BALL_R < 0) {
            g.bx = BALL_R; g.vx = Math.abs(g.vx)
            if (Math.abs(g.vx) < 0.8) g.vx += (Math.random() > 0.5 ? 1 : -1) * 0.6
          }
          if (g.bx + BALL_R > w) {
            g.bx = w - BALL_R; g.vx = -Math.abs(g.vx)
            if (Math.abs(g.vx) < 0.8) g.vx += (Math.random() > 0.5 ? 1 : -1) * 0.6
          }
          if (g.by - BALL_R < 0) {
            g.by = BALL_R; g.vy = Math.abs(g.vy)
            if (Math.abs(g.vx) < 0.8) {
              g.vx += (Math.random() > 0.5 ? 1 : -1) * (0.5 + Math.random() * 0.8)
            }
          }

          if (
            g.vy > 0 &&
            g.by + BALL_R >= py - PADDLE_H / 2 && g.by - BALL_R <= py + PADDLE_H / 2 &&
            g.bx >= px - pw / 2 - BALL_R && g.bx <= px + pw / 2 + BALL_R
          ) {
            const rel = (g.bx - px) / (pw / 2)
            const spd = Math.min(Math.hypot(g.vx, g.vy) + 0.05, SPEED_MAX)
            const ang = -Math.PI / 2 + rel * 0.7
            g.vx = Math.cos(ang) * spd; g.vy = Math.sin(ang) * spd
            g.by = py - PADDLE_H / 2 - BALL_R
            // Ensure minimum horizontal velocity to prevent vertical-only loops
            if (Math.abs(g.vx) < 1.0) {
              g.vx += (rel >= 0 ? 1 : -1) * (0.8 + Math.random() * 0.4)
            }
            if (!ai) haptic('light')
          }

          for (const b of currentBs) {
            if (!b.alive) continue
            if (
              g.bx + BALL_R > b.x && g.bx - BALL_R < b.x + b.w &&
              g.by + BALL_R > b.y && g.by - BALL_R < b.y + b.h
            ) {
              b.alive = false
              if (!ai) { g.score += 10; setScore(g.score); haptic('medium') }
              for (let k = 0; k < 8; k++) {
                const a = Math.random() * Math.PI * 2
                const sp = 1 + Math.random() * 3
                ps.push({
                  x: b.x + b.w / 2, y: b.y + b.h / 2,
                  vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
                  life: 1, color: b.color, size: 2 + Math.random() * 2,
                })
              }
              if (g.bx < b.x || g.bx > b.x + b.w) g.vx *= -1; else g.vy *= -1
              break
            }
          }

          if (g.by > h + BALL_R) {
            if (ai) { resetBall(); g.aiTimer = 0 }
            else {
              g.lives--; setLives(g.lives)
              if (g.lives <= 0) { g.over = true; haptic('heavy') }
              else { resetBall(); haptic('heavy') }
            }
          }

          g.vx = Math.max(-SPEED_MAX, Math.min(SPEED_MAX, g.vx))
          g.vy = Math.max(-SPEED_MAX, Math.min(SPEED_MAX, g.vy))
        }
      }

      /* ── Draw ball ── */
      ctx.beginPath(); ctx.arc(g.bx, g.by, BALL_R, 0, Math.PI * 2)
      ctx.fillStyle = '#fff'; ctx.fill()

      if (g.launched && !g.over) {
        const gr = ctx.createRadialGradient(g.bx, g.by, 0, g.bx, g.by, BALL_R * 3)
        gr.addColorStop(0, 'rgba(255,255,255,0.1)')
        gr.addColorStop(1, 'rgba(255,255,255,0)')
        ctx.beginPath(); ctx.arc(g.bx, g.by, BALL_R * 3, 0, Math.PI * 2)
        ctx.fillStyle = gr; ctx.fill()
      }

      /* ── Particles ── */
      for (let i = ps.length - 1; i >= 0; i--) {
        const p = ps[i]
        p.x += p.vx; p.y += p.vy; p.vy += 0.08; p.life -= 0.03
        if (p.life <= 0) { ps.splice(i, 1); continue }
        ctx.globalAlpha = p.life; ctx.fillStyle = p.color
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2); ctx.fill()
        ctx.globalAlpha = 1
      }

      /* ── AI label ── */
      if (ai && !g.over) {
        ctx.fillStyle = '#333'; ctx.font = '500 10px "Space Grotesk", sans-serif'
        ctx.textAlign = 'right'; ctx.fillText('AI playing', w - 12, h - 6)
      }

      /* ── Game over ── */
      if (g.over && !ai) {
        ctx.fillStyle = 'rgba(10,10,10,0.7)'; ctx.fillRect(0, 0, w, h)
        ctx.fillStyle = ac; ctx.font = '700 16px "Space Grotesk", sans-serif'
        ctx.textAlign = 'center'; ctx.fillText('Game Over', w / 2, h / 2 - 12)
        ctx.fillStyle = '#888'; ctx.font = '500 11px "Space Grotesk", sans-serif'
        ctx.fillText(touchDevice ? 'Tap to restart' : 'Click to restart', w / 2, h / 2 + 10)
        ctx.fillStyle = '#555'; ctx.font = '600 11px "Space Grotesk", sans-serif'
        ctx.fillText(`Score: ${g.score}`, w / 2, h / 2 + 32)
      }

      raf = requestAnimationFrame(loop)
    }

    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf); ro.disconnect()
      wrap.removeEventListener('pointerdown', onPointerDown)
      wrap.removeEventListener('pointermove', onPointerMove)
      wrap.removeEventListener('pointerup', onPointerUp)
      wrap.removeEventListener('pointerenter', onPointerEnter)
      wrap.removeEventListener('pointerleave', onPointerLeave)
      wrap.removeEventListener('click', onClick)
    }
  }, [])

  const hint = mode === 'human'
    ? isTouch ? 'Tap to launch \u00B7 Drag to move' : 'Click to launch \u00B7 You\u2019re playing'
    : isTouch ? 'Tap to take control' : 'Hover to take control from the AI'

  return (
    <div className="playground-wrapper">
      <div className="playground-header">
        <span className="playground-label">Skill Breaker</span>
        {mode === 'human' ? (
          <span className="playground-score">
            Score: {score}
            <span className="playground-lives">
              {Array.from({ length: Math.max(0, lives) }, (_, i) => (
                <span key={i} className="playground-heart" />
              ))}
            </span>
          </span>
        ) : (
          <span className="playground-score" style={{ color: '#555' }}>AI mode</span>
        )}
      </div>
      <div className="playground-canvas-wrap" ref={wrapRef}>
        <canvas ref={canvasRef} className="playground-canvas" />
      </div>
      <p className="playground-hint">{hint}</p>
    </div>
  )
}
