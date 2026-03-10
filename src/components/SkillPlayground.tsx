import { useEffect, useRef, useState } from 'react'
import { haptic } from '../hooks/useHaptics'

/* ── Data ────────────────────────────────────────────────────── */

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

/* ── Types ───────────────────────────────────────────────────── */

interface Brick {
  x: number; y: number; w: number; h: number
  label: string; color: string; alive: boolean
  dying: boolean; deathTimer: number
}

interface Particle {
  x: number; y: number; vx: number; vy: number
  life: number; color: string; size: number
}

interface FloatingText {
  x: number; y: number; text: string; life: number; color: string
}

type PowerUpKind = 'wide' | 'fire' | 'slow' | 'multi'

interface PowerUp {
  x: number; y: number; vy: number; kind: PowerUpKind
}

interface ExtraBall {
  x: number; y: number; vx: number; vy: number
}

/* ── Constants ───────────────────────────────────────────────── */

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
const DESCEND_BRICK_CAP = 15
const SPAWN_INTERVAL = 120
const TRAIL_LEN = 20
const SHAKE_FRAMES = 8
const COMBO_WINDOW = 45
const POWERUP_DROP = 0.15
const POWERUP_FALL = 1.8
const POWERUP_DUR = 300
const GLOW_FRAMES = 12
const DEATH_FRAMES = 8
const LS_KEY = 'skillbreaker_hi'

const PU_META: Record<PowerUpKind, { color: string; icon: string; label: string }> = {
  wide:  { color: '#FFD700', icon: '⟷', label: 'WIDE PADDLE!' },
  fire:  { color: '#FF4D00', icon: '🔥', label: 'FIREBALL!' },
  slow:  { color: '#00BFFF', icon: '❄', label: 'SLOW-MO!' },
  multi: { color: '#A855F7', icon: '⊕', label: 'MULTI-BALL!' },
}

/* ── Component ───────────────────────────────────────────────── */

export default function SkillPlayground() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [mode, setMode] = useState<'ai' | 'human'>('ai')
  const [hiScore, setHiScore] = useState(() => {
    try { return parseInt(localStorage.getItem(LS_KEY) || '0', 10) || 0 } catch { return 0 }
  })
  const [isTouch] = useState(
    () => 'ontouchstart' in window || navigator.maxTouchPoints > 0
  )

  /* refs */
  const dims = useRef({ w: 0, h: 0 })
  const bricksRef = useRef<Brick[]>([])
  const particlesRef = useRef<Particle[]>([])
  const floatsRef = useRef<FloatingText[]>([])
  const powerUpsRef = useRef<PowerUp[]>([])
  const extraBallsRef = useRef<ExtraBall[]>([])
  const trailRef = useRef<{ x: number; y: number }[]>([])
  const accentRef = useRef('#FF4D00')

  const game = useRef({
    // ball
    bx: 0, by: 0, vx: 0, vy: 0,
    // paddle
    px: 0, pw: 100, pwBase: 100, pwTarget: 100,
    // state
    launched: false, over: false, paused: false,
    human: false, aiTimer: 0,
    score: 0, lives: 3, hiScore: 0,
    spawnTimer: 0, waveIdx: 0,
    // AI prediction cache
    aiPredX: 0, aiLastDxSign: 0, aiLastDySign: 0,
    // iOS haptic queue
    pendingHaptic: null as 'light' | 'medium' | 'heavy' | null,
    // combo
    combo: 0, comboTimer: 0,
    // screen shake
    shakeX: 0, shakeY: 0, shakeT: 0,
    // paddle glow
    glowT: 0,
    // power-up timers
    wideT: 0, fireT: 0, slowT: 0,
  })

  const tapRef = useRef({ x: 0, y: 0, t: 0, moved: false, blocked: false })
  const lastPtrType = useRef('mouse')

  /* ── Main effect ───────────────────────────────────────────── */

  useEffect(() => {
    const wrap = wrapRef.current
    const canvas = canvasRef.current
    if (!wrap || !canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const touchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
    const needsGestureHaptic = touchDevice && !('vibrate' in navigator)

    /* ── Haptic helpers (iOS gesture-queue) ── */

    const HPRIO = { light: 1, medium: 2, heavy: 3 } as const
    const gameHaptic = (type: 'light' | 'medium' | 'heavy') => {
      if (!needsGestureHaptic) { haptic(type); return }
      const g = game.current
      if (!g.pendingHaptic || HPRIO[type] > HPRIO[g.pendingHaptic]) g.pendingHaptic = type
    }
    const flushHaptic = () => {
      const h = game.current.pendingHaptic
      if (h) { haptic(h); game.current.pendingHaptic = null }
    }

    /* ── Accent colour ── */

    try { game.current.hiScore = parseInt(localStorage.getItem(LS_KEY) || '0', 10) || 0 } catch { /* */ }
    accentRef.current =
      getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#FF4D00'

    /* ── Brick helpers ── */

    const newBrick = (label: string, color: string, x: number, y: number, w: number): Brick =>
      ({ x, y, w, h: BRICK_H, label, color, alive: true, dying: false, deathTimer: 0 })

    const buildBricks = () => {
      const { w } = dims.current
      ctx.font = '600 11px "Space Grotesk", sans-serif'
      const rows: Brick[][] = []
      let row: Brick[] = []
      let cx = 8
      for (const s of SKILLS) {
        const bw = ctx.measureText(s.label).width + 20
        if (cx + bw + 8 > w && row.length) { rows.push(row); row = []; cx = 8 }
        row.push(newBrick(s.label, CAT_COLORS[s.cat], cx, 0, bw))
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
      const base = 4 + (g.waveIdx % 3)
      const count = !g.human ? Math.min(base + 1 + Math.floor(g.waveIdx / 5), SKILLS.length) : base
      const picked = Array.from({ length: count }, (_, i) => SKILLS[(start + i) % SKILLS.length])
      const bricks = picked.map(s => {
        const bw = ctx.measureText(s.label).width + 20
        return newBrick(s.label, CAT_COLORS[s.cat], 0, -(BRICK_H + BRICK_GAP), bw)
      })
      const tw = bricks.reduce((a, b) => a + b.w, 0) + (bricks.length - 1) * BRICK_GAP
      const anchors = [0.5, 0.3, 0.7, 0.4, 0.6]
      const anchor = anchors[g.waveIdx % anchors.length]
      let sx = Math.max(4, Math.min(w - tw - 4, w * anchor - tw / 2))
      for (const b of bricks) { b.x = sx; sx += b.w + BRICK_GAP }
      bricksRef.current.push(...bricks)
    }

    /* ── Ball / game state ── */

    const resetBall = () => {
      const g = game.current
      const { w, h } = dims.current
      g.bx = g.human ? Math.max(g.pw / 2, Math.min(w - g.pw / 2, g.px)) : w / 2
      g.by = h - 30 - BALL_R
      g.vx = 0; g.vy = 0; g.launched = false
      if (!g.human) g.px = w / 2
      trailRef.current.length = 0
      extraBallsRef.current.length = 0
    }

    const launch = () => {
      const g = game.current
      if (g.launched || g.over) return
      g.launched = true
      const a = -Math.PI / 2 + (Math.random() - 0.5) * 0.6
      g.vx = Math.cos(a) * SPEED_INIT
      g.vy = Math.sin(a) * SPEED_INIT
    }

    const saveHi = (s: number) => {
      const g = game.current
      if (s > g.hiScore) {
        g.hiScore = s; setHiScore(s)
        try { localStorage.setItem(LS_KEY, String(s)) } catch { /* */ }
      }
    }

    const fullReset = () => {
      const g = game.current
      g.waveIdx = 0; buildBricks()
      g.lives = 3; g.score = 0; g.over = false; g.aiTimer = 0; g.spawnTimer = 0
      g.aiPredX = dims.current.w / 2; g.aiLastDxSign = 0; g.aiLastDySign = 0
      g.combo = 0; g.comboTimer = 0
      g.shakeX = 0; g.shakeY = 0; g.shakeT = 0
      g.glowT = 0
      g.wideT = 0; g.fireT = 0; g.slowT = 0
      g.pw = g.pwBase; g.pwTarget = g.pwBase
      particlesRef.current.length = 0
      floatsRef.current.length = 0
      powerUpsRef.current.length = 0
      extraBallsRef.current.length = 0
      trailRef.current.length = 0
      setScore(0); setLives(3)
      resetBall()
    }

    const goHuman = () => {
      const g = game.current
      if (g.human) return
      g.human = true; setMode('human')
      if (g.over) fullReset()
      haptic('medium')
    }

    const goAI = () => {
      const g = game.current
      if (!g.human) return
      g.human = false; setMode('ai')
      if (g.over) fullReset()
    }

    /* ── Resize ── */

    const resize = () => {
      const r = wrap.getBoundingClientRect()
      const w = Math.round(r.width)
      const mobile = w < 768
      const h = mobile
        ? Math.min(460, Math.max(340, Math.round(w * 1.1)))
        : Math.min(400, Math.max(280, Math.round(w / 2.5)))
      dims.current = { w, h }
      const dpr = Math.min(devicePixelRatio, 2)
      canvas.width = w * dpr; canvas.height = h * dpr
      canvas.style.width = w + 'px'; canvas.style.height = h + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const pw = Math.max(60, w * 0.12)
      game.current.pw = pw; game.current.pwBase = pw; game.current.pwTarget = pw
      fullReset()
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(wrap)

    /* ── AI prediction ── */

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

    /* ── FX helpers ── */

    const shake = (intensity = 1) => {
      const g = game.current
      g.shakeT = SHAKE_FRAMES
      g.shakeX = (Math.random() - 0.5) * 2 * intensity
      g.shakeY = (Math.random() - 0.5) * 2 * intensity
    }

    const spawnParticles = (x: number, y: number, color: string, n: number, speed = 3) => {
      const ps = particlesRef.current
      for (let k = 0; k < n; k++) {
        const a = Math.random() * Math.PI * 2
        const sp = 1 + Math.random() * speed
        ps.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 1, color, size: 2 + Math.random() * 2 })
      }
    }

    const addFloat = (x: number, y: number, text: string, color: string) => {
      floatsRef.current.push({ x, y, text, life: 1, color })
    }

    const maybeDropPowerUp = (x: number, y: number) => {
      if (Math.random() > POWERUP_DROP) return
      const kinds: PowerUpKind[] = ['wide', 'fire', 'slow', 'multi']
      powerUpsRef.current.push({ x, y, vy: POWERUP_FALL, kind: kinds[Math.floor(Math.random() * kinds.length)] })
    }

    const activatePowerUp = (kind: PowerUpKind) => {
      const g = game.current
      if (kind === 'wide') {
        g.wideT = POWERUP_DUR; g.pwTarget = g.pwBase * 1.6
      } else if (kind === 'fire') {
        g.fireT = POWERUP_DUR
      } else if (kind === 'slow') {
        g.slowT = POWERUP_DUR
      } else {
        const spd = Math.hypot(g.vx, g.vy) || SPEED_INIT
        for (const off of [-0.5, 0.5]) {
          const a = -Math.PI / 2 + off
          extraBallsRef.current.push({ x: g.bx, y: g.by, vx: Math.cos(a) * spd, vy: Math.sin(a) * spd })
        }
      }
      addFloat(dims.current.w / 2, dims.current.h - 50, PU_META[kind].label, PU_META[kind].color)
    }

    /* ── Ball–brick collision ── */

    const hitBricks = (bx: number, by: number, vx: number, vy: number) => {
      const g = game.current
      const ai = !g.human
      let nvx = vx, nvy = vy

      for (const b of bricksRef.current) {
        if (!b.alive) continue
        if (bx + BALL_R > b.x && bx - BALL_R < b.x + b.w &&
            by + BALL_R > b.y && by - BALL_R < b.y + b.h) {
          b.alive = false; b.dying = true; b.deathTimer = DEATH_FRAMES

          if (!ai) {
            g.combo++; g.comboTimer = COMBO_WINDOW
            const mult = Math.min(g.combo, 5)
            g.score += 10 * mult; setScore(g.score); saveHi(g.score)
            gameHaptic('medium')
            if (mult > 1) addFloat(b.x + b.w / 2, b.y, `${mult}x`, '#FFD700')
            maybeDropPowerUp(b.x + b.w / 2, b.y + b.h / 2)
          } else {
            gameHaptic('light')
          }

          spawnParticles(b.x + b.w / 2, b.y + b.h / 2, b.color, 10)
          shake(g.combo >= 3 ? 1.5 : 1)

          if (g.fireT <= 0) {
            if (bx < b.x || bx > b.x + b.w) nvx *= -1; else nvy *= -1
            return { vx: nvx, vy: nvy }
          }
          // Fireball — don't bounce, continue hitting
        }
      }
      return { vx: nvx, vy: nvy }
    }

    /* ── Input handlers ── */

    const onPointerDown = (e: PointerEvent) => {
      lastPtrType.current = e.pointerType
      if (e.pointerType !== 'touch') return
      const g = game.current
      const x = e.clientX - canvas.getBoundingClientRect().left
      tapRef.current = { x: e.clientX, y: e.clientY, t: Date.now(), moved: false, blocked: false }
      flushHaptic()
      if (!g.human) { goHuman(); g.px = x; tapRef.current.blocked = true; return }
      if (g.over) { fullReset(); tapRef.current.blocked = true; return }
      g.px = x
    }

    const onPointerMove = (e: PointerEvent) => {
      const g = game.current
      const x = e.clientX - canvas.getBoundingClientRect().left
      if (e.pointerType === 'mouse') {
        g.px = x; if (!g.human) goHuman()
      } else if (e.pointerType === 'touch') {
        g.px = x; flushHaptic()
        const dx = e.clientX - tapRef.current.x, dy = e.clientY - tapRef.current.y
        if (dx * dx + dy * dy > 64) tapRef.current.moved = true
      }
    }

    const onPointerUp = (e: PointerEvent) => {
      if (e.pointerType !== 'touch') return
      const tp = tapRef.current, g = game.current
      if (tp.blocked) return
      // Swipe down → AI takes over
      if (tp.moved && e.clientY - tp.y > 60 && Date.now() - tp.t < 400) { goAI(); return }
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
    const onVisChange = () => { game.current.paused = document.hidden }

    document.addEventListener('visibilitychange', onVisChange)
    wrap.addEventListener('pointerdown', onPointerDown)
    wrap.addEventListener('pointermove', onPointerMove)
    wrap.addEventListener('pointerup', onPointerUp)
    wrap.addEventListener('pointerenter', onPointerEnter)
    wrap.addEventListener('pointerleave', onPointerLeave)
    wrap.addEventListener('click', onClick)

    const io = new IntersectionObserver(
      ([entry]) => { if (!entry.isIntersecting && game.current.human && touchDevice) goAI() },
      { threshold: 0.3 },
    )
    io.observe(wrap)

    /* ── Game loop ── */

    let raf = 0

    const loop = () => {
      const { w, h } = dims.current
      const g = game.current

      if (g.paused) { raf = requestAnimationFrame(loop); return }

      const bs = bricksRef.current
      const ps = particlesRef.current
      const fs = floatsRef.current
      const pups = powerUpsRef.current
      const xballs = extraBallsRef.current
      const trail = trailRef.current
      const ac = accentRef.current
      const ai = !g.human
      const py = h - 18
      const slow = g.slowT > 0 ? 0.5 : 1

      /* ── Timers ── */
      if (g.wideT > 0) { g.wideT--; if (g.wideT === 0) g.pwTarget = g.pwBase }
      if (g.fireT > 0) g.fireT--
      if (g.slowT > 0) g.slowT--
      if (g.shakeT > 0) {
        g.shakeT--
        const t = g.shakeT / SHAKE_FRAMES
        g.shakeX = (Math.random() - 0.5) * 3 * t
        g.shakeY = (Math.random() - 0.5) * 3 * t
      } else { g.shakeX = 0; g.shakeY = 0 }
      if (g.glowT > 0) g.glowT--
      if (g.comboTimer > 0) { g.comboTimer--; if (g.comboTimer === 0) g.combo = 0 }

      // Smooth paddle width lerp
      g.pw += (g.pwTarget - g.pw) * 0.15

      /* ── Canvas setup ── */
      ctx.save()
      ctx.translate(g.shakeX, g.shakeY)
      ctx.clearRect(-4, -4, w + 8, h + 8)
      ctx.strokeStyle = '#1a1a1a'; ctx.lineWidth = 1
      ctx.beginPath(); ctx.moveTo(0, h - 1); ctx.lineTo(w, h - 1); ctx.stroke()

      /* ── Brick descent ── */
      const alive = bs.filter(b => b.alive).length
      const bFact = 1 - Math.min(alive / DESCEND_BRICK_CAP, 1)
      const pFact = 1 + Math.min(g.waveIdx / 12, 1)
      const mFact = ai ? 1.5 : 1
      const dSpeed = Math.min(DESCEND_MAX, DESCEND_BASE + (DESCEND_MAX - DESCEND_BASE) * bFact * pFact * mFact)

      for (const b of bs) if (b.alive || b.dying) b.y += dSpeed
      for (const b of bs) if (b.dying) { b.deathTimer--; if (b.deathTimer <= 0) b.dying = false }
      bricksRef.current = bs.filter(b => (b.alive || b.dying) && b.y < py - PADDLE_H - BALL_R)

      /* ── Spawning ── */
      g.spawnTimer++
      const hasAlive = bricksRef.current.some(b => b.alive)
      const spawnInt = ai ? Math.max(50, SPAWN_INTERVAL - g.waveIdx * 5) : SPAWN_INTERVAL
      if (g.spawnTimer >= spawnInt || !hasAlive) {
        let minY = Infinity
        for (const b of bricksRef.current) if (b.alive && b.y < minY) minY = b.y
        if (minY > BRICK_H + BRICK_GAP || !hasAlive) { spawnRow(); g.spawnTimer = 0 }
      }

      /* ── AI ── */
      if (ai) {
        if (g.over) fullReset()
        if (g.launched) {
          const dxS = g.vx > 0 ? 1 : -1, dyS = g.vy > 0 ? 1 : -1
          if (dxS !== g.aiLastDxSign || dyS !== g.aiLastDySign) {
            g.aiPredX = predictLanding(w, py); g.aiLastDxSign = dxS; g.aiLastDySign = dyS
          }
          let tgt: number
          if (g.vy > 0) {
            const landX = g.aiPredX
            let best: Brick | null = null, maxY = -1
            for (const b of bricksRef.current) if (b.alive && b.y + b.h > maxY) { maxY = b.y + b.h; best = b }
            if (best) {
              const ang = Math.atan2(best.y + best.h / 2 - py, best.x + best.w / 2 - landX)
              let rel = (ang + Math.PI / 2) / 0.7
              rel = Math.max(-0.85, Math.min(0.85, rel))
              tgt = landX - rel * g.pw / 2
            } else { tgt = landX }
          } else {
            let best: Brick | null = null, maxY = -1
            for (const b of bricksRef.current) if (b.alive && b.y + b.h > maxY) { maxY = b.y + b.h; best = b }
            tgt = best ? best.x + best.w / 2 : w / 2
          }
          tgt = Math.max(g.pw / 2, Math.min(w - g.pw / 2, tgt))
          const spd = g.vy > 0 ? AI_SPEED : AI_DRIFT_SPEED
          const diff = tgt - g.px
          if (Math.abs(diff) > AI_DEAD_ZONE) g.px += Math.sign(diff) * Math.min(Math.abs(diff), spd)
        } else {
          const diff = w / 2 - g.px
          if (Math.abs(diff) > AI_DEAD_ZONE) g.px += Math.sign(diff) * Math.min(Math.abs(diff), AI_DRIFT_SPEED)
          g.aiTimer++
          if (g.aiTimer > 60) { launch(); g.aiTimer = 0 }
        }
      }

      /* ── Draw bricks ── */
      ctx.font = '600 11px "Space Grotesk", sans-serif'
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      for (const b of bricksRef.current) {
        if (b.y + b.h < 0) continue
        if (b.dying) {
          const t = b.deathTimer / DEATH_FRAMES
          ctx.save()
          ctx.translate(b.x + b.w / 2, b.y + b.h / 2)
          ctx.scale(0.5 + t * 0.5, 0.5 + t * 0.5)
          ctx.globalAlpha = t * 0.6; ctx.fillStyle = b.color
          ctx.beginPath(); ctx.roundRect(-b.w / 2, -b.h / 2, b.w, b.h, 4); ctx.fill()
          ctx.globalAlpha = t; ctx.fillStyle = '#fff'
          ctx.fillText(b.label, 0, 1)
          ctx.restore(); ctx.globalAlpha = 1
          continue
        }
        if (!b.alive) continue
        ctx.fillStyle = b.color; ctx.globalAlpha = 0.85
        ctx.beginPath(); ctx.roundRect(b.x, b.y, b.w, b.h, 4); ctx.fill()
        ctx.globalAlpha = 1; ctx.fillStyle = '#fff'
        ctx.fillText(b.label, b.x + b.w / 2, b.y + b.h / 2 + 1)
      }

      /* ── Power-ups (falling capsules) ── */
      const px2 = Math.max(g.pw / 2, Math.min(w - g.pw / 2, g.px))
      for (let i = pups.length - 1; i >= 0; i--) {
        const p = pups[i]
        p.y += p.vy
        if (p.y > h) { pups.splice(i, 1); continue }
        // Collect
        if (p.y + 10 >= py - PADDLE_H / 2 && p.y - 10 <= py + PADDLE_H / 2 &&
            p.x >= px2 - g.pw / 2 - 10 && p.x <= px2 + g.pw / 2 + 10) {
          activatePowerUp(p.kind); gameHaptic('medium'); pups.splice(i, 1); continue
        }
        // Draw capsule
        const meta = PU_META[p.kind]
        ctx.fillStyle = meta.color; ctx.globalAlpha = 0.85
        ctx.beginPath(); ctx.roundRect(p.x - 10, p.y - 6, 20, 12, 6); ctx.fill()
        ctx.globalAlpha = 1; ctx.fillStyle = '#000'
        ctx.font = '700 8px "Space Grotesk", sans-serif'
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillText(meta.icon, p.x, p.y + 1)
      }

      /* ── Paddle ── */
      ctx.font = '600 11px "Space Grotesk", sans-serif'
      const pw = g.pw
      const px = Math.max(pw / 2, Math.min(w - pw / 2, g.px))
      const isFire = g.fireT > 0
      if (g.glowT > 0) {
        ctx.shadowColor = ai ? '#666' : (isFire ? '#FF4D00' : ac)
        ctx.shadowBlur = 12 * (g.glowT / GLOW_FRAMES)
      }
      ctx.fillStyle = ai ? '#444' : (isFire ? '#FF4D00' : ac)
      ctx.beginPath(); ctx.roundRect(px - pw / 2, py - PADDLE_H / 2, pw, PADDLE_H, 5); ctx.fill()
      ctx.shadowBlur = 0

      // Duration bars
      const barY = py + PADDLE_H / 2 + 3
      const drawBar = (timer: number, color: string, offset: number) => {
        if (timer <= 0) return
        ctx.fillStyle = color; ctx.globalAlpha = 0.6
        ctx.fillRect(px - pw / 2, barY + offset, pw * (timer / POWERUP_DUR), 2)
        ctx.globalAlpha = 1
      }
      drawBar(g.wideT, PU_META.wide.color, 0)
      drawBar(g.fireT, PU_META.fire.color, 3)
      drawBar(g.slowT, PU_META.slow.color, 6)

      /* ── Main ball physics ── */
      if (!g.over) {
        if (!g.launched) {
          g.bx = px; g.by = py - PADDLE_H / 2 - BALL_R - 2
        } else {
          g.bx += g.vx * slow; g.by += g.vy * slow
          trail.push({ x: g.bx, y: g.by })
          if (trail.length > TRAIL_LEN) trail.shift()

          // Walls
          if (g.bx - BALL_R < 0) { g.bx = BALL_R; g.vx = Math.abs(g.vx) }
          if (g.bx + BALL_R > w) { g.bx = w - BALL_R; g.vx = -Math.abs(g.vx) }
          if (g.by - BALL_R < 0) {
            g.by = BALL_R; g.vy = Math.abs(g.vy)
            if (Math.abs(g.vx) < 0.8) g.vx += (Math.random() > 0.5 ? 1 : -1) * (0.5 + Math.random() * 0.8)
          }

          // Paddle
          if (g.vy > 0 &&
              g.by + BALL_R >= py - PADDLE_H / 2 && g.by - BALL_R <= py + PADDLE_H / 2 &&
              g.bx >= px - pw / 2 - BALL_R && g.bx <= px + pw / 2 + BALL_R) {
            const rel = (g.bx - px) / (pw / 2)
            const spd = Math.min(Math.hypot(g.vx, g.vy) + 0.05, SPEED_MAX)
            const a = -Math.PI / 2 + rel * 0.7
            g.vx = Math.cos(a) * spd; g.vy = Math.sin(a) * spd
            g.by = py - PADDLE_H / 2 - BALL_R
            if (Math.abs(g.vx) < 1.0) g.vx += (rel >= 0 ? 1 : -1) * (0.8 + Math.random() * 0.4)
            if (!ai) gameHaptic('light')
            g.glowT = GLOW_FRAMES
          }

          // Bricks
          const r = hitBricks(g.bx, g.by, g.vx, g.vy)
          g.vx = r.vx; g.vy = r.vy

          // Lost ball
          if (g.by > h + BALL_R) {
            if (xballs.length > 0) {
              const nb = xballs.pop()!
              g.bx = nb.x; g.by = nb.y; g.vx = nb.vx; g.vy = nb.vy
            } else if (ai) {
              resetBall(); g.aiTimer = 0
            } else {
              g.lives--; setLives(g.lives)
              if (g.lives <= 0) { g.over = true; gameHaptic('heavy'); saveHi(g.score) }
              else { resetBall(); gameHaptic('heavy') }
            }
          }

          g.vx = Math.max(-SPEED_MAX, Math.min(SPEED_MAX, g.vx))
          g.vy = Math.max(-SPEED_MAX, Math.min(SPEED_MAX, g.vy))
        }
      }

      /* ── Extra balls ── */
      for (let i = xballs.length - 1; i >= 0; i--) {
        const eb = xballs[i]
        eb.x += eb.vx * slow; eb.y += eb.vy * slow
        if (eb.x - BALL_R < 0) { eb.x = BALL_R; eb.vx = Math.abs(eb.vx) }
        if (eb.x + BALL_R > w) { eb.x = w - BALL_R; eb.vx = -Math.abs(eb.vx) }
        if (eb.y - BALL_R < 0) { eb.y = BALL_R; eb.vy = Math.abs(eb.vy) }
        if (eb.y > h + BALL_R) { xballs.splice(i, 1); continue }

        if (eb.vy > 0 &&
            eb.y + BALL_R >= py - PADDLE_H / 2 && eb.y - BALL_R <= py + PADDLE_H / 2 &&
            eb.x >= px - pw / 2 - BALL_R && eb.x <= px + pw / 2 + BALL_R) {
          const rel = (eb.x - px) / (pw / 2)
          const spd = Math.min(Math.hypot(eb.vx, eb.vy), SPEED_MAX)
          const a = -Math.PI / 2 + rel * 0.7
          eb.vx = Math.cos(a) * spd; eb.vy = Math.sin(a) * spd
          eb.y = py - PADDLE_H / 2 - BALL_R
          g.glowT = GLOW_FRAMES
        }

        const r = hitBricks(eb.x, eb.y, eb.vx, eb.vy)
        eb.vx = r.vx; eb.vy = r.vy
      }

      /* ── Draw energy trail ── */
      if (g.launched && !g.over && trail.length > 1) {
        for (let i = 0; i < trail.length; i++) {
          const t = (i + 1) / trail.length // 0→1 (tail→head)
          const r = BALL_R * t * 0.8
          // Glow layer
          if (t > 0.3) {
            const glow = isFire ? 'rgba(255,77,0,' : 'rgba(255,255,255,'
            ctx.globalAlpha = t * 0.12
            ctx.fillStyle = glow + '1)'
            ctx.beginPath(); ctx.arc(trail[i].x, trail[i].y, r * 2.2, 0, Math.PI * 2); ctx.fill()
          }
          // Core dot — eased opacity for smoother fade
          const ease = t * t // quadratic ease-in
          ctx.globalAlpha = ease * 0.5
          ctx.fillStyle = isFire
            ? `rgb(255,${Math.round(77 + 178 * (1 - t))},${Math.round(60 * (1 - t))})`
            : `rgba(255,255,255,1)`
          ctx.beginPath(); ctx.arc(trail[i].x, trail[i].y, r, 0, Math.PI * 2); ctx.fill()
        }
        ctx.globalAlpha = 1
      }

      /* ── Draw ball ── */
      const bColor = isFire ? '#FF4D00' : '#fff'
      ctx.beginPath(); ctx.arc(g.bx, g.by, BALL_R, 0, Math.PI * 2)
      ctx.fillStyle = bColor; ctx.fill()

      if (g.launched && !g.over) {
        const gc = isFire ? 'rgba(255,77,0,' : 'rgba(255,255,255,'
        const gr = ctx.createRadialGradient(g.bx, g.by, 0, g.bx, g.by, BALL_R * 3)
        gr.addColorStop(0, gc + '0.15)'); gr.addColorStop(1, gc + '0)')
        ctx.beginPath(); ctx.arc(g.bx, g.by, BALL_R * 3, 0, Math.PI * 2)
        ctx.fillStyle = gr; ctx.fill()
      }

      for (const eb of xballs) {
        ctx.beginPath(); ctx.arc(eb.x, eb.y, BALL_R * 0.85, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.fill()
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

      /* ── Floating text ── */
      ctx.font = '700 13px "Space Grotesk", sans-serif'; ctx.textAlign = 'center'
      for (let i = fs.length - 1; i >= 0; i--) {
        const f = fs[i]; f.y -= 0.8; f.life -= 0.02
        if (f.life <= 0) { fs.splice(i, 1); continue }
        ctx.globalAlpha = f.life; ctx.fillStyle = f.color
        ctx.fillText(f.text, f.x, f.y); ctx.globalAlpha = 1
      }

      /* ── HUD overlays ── */
      if (ai && !g.over) {
        ctx.fillStyle = '#333'; ctx.font = '500 10px "Space Grotesk", sans-serif'
        ctx.textAlign = 'right'; ctx.fillText('AI playing', w - 12, h - 6)
      }

      if (!ai && g.combo >= 2) {
        ctx.fillStyle = '#FFD700'; ctx.globalAlpha = Math.min(1, g.comboTimer / 20)
        ctx.font = '700 10px "Space Grotesk", sans-serif'
        ctx.textAlign = 'left'; ctx.fillText(`${g.combo}x COMBO`, 12, h - 6)
        ctx.globalAlpha = 1
      }

      /* ── Game over ── */
      if (g.over && !ai) {
        ctx.fillStyle = 'rgba(10,10,10,0.75)'; ctx.fillRect(-4, -4, w + 8, h + 8)
        ctx.textAlign = 'center'
        ctx.fillStyle = ac; ctx.font = '700 18px "Space Grotesk", sans-serif'
        ctx.fillText('Game Over', w / 2, h / 2 - 20)
        ctx.fillStyle = '#888'; ctx.font = '500 11px "Space Grotesk", sans-serif'
        ctx.fillText(touchDevice ? 'Tap to restart' : 'Click to restart', w / 2, h / 2 + 2)
        ctx.fillStyle = '#666'; ctx.font = '600 12px "Space Grotesk", sans-serif'
        ctx.fillText(`Score: ${g.score}`, w / 2, h / 2 + 24)
        if (g.score >= g.hiScore && g.score > 0) {
          ctx.fillStyle = '#FFD700'; ctx.font = '700 10px "Space Grotesk", sans-serif'
          ctx.fillText('\u2605 NEW BEST! \u2605', w / 2, h / 2 + 44)
        }
      }

      ctx.restore()
      raf = requestAnimationFrame(loop)
    }

    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf); ro.disconnect(); io.disconnect()
      document.removeEventListener('visibilitychange', onVisChange)
      wrap.removeEventListener('pointerdown', onPointerDown)
      wrap.removeEventListener('pointermove', onPointerMove)
      wrap.removeEventListener('pointerup', onPointerUp)
      wrap.removeEventListener('pointerenter', onPointerEnter)
      wrap.removeEventListener('pointerleave', onPointerLeave)
      wrap.removeEventListener('click', onClick)
    }
  }, [])

  /* ── Render ── */

  const hint = mode === 'human'
    ? isTouch ? 'Tap to launch \u00B7 Drag to move \u00B7 Swipe \u2193 to exit' : 'Click to launch \u00B7 You\u2019re playing'
    : isTouch ? 'Tap to take control' : 'Hover to take control from the AI'

  return (
    <div className="playground-wrapper">
      <div className="playground-header">
        <span className="playground-label">Skill Breaker</span>
        {mode === 'human' ? (
          <span className="playground-score">
            {hiScore > 0 && <span className="playground-hi">Best: {hiScore}&ensp;</span>}
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
