import { useEffect, useRef, useCallback, useState } from 'react'
import { haptic } from '../hooks/useHaptics'

const W = 600
const H = 320
const PADDLE_H = 64
const PADDLE_W = 8
const BALL_R = 6
const SPEED = 3.5
const AI_SPEED = 2.8
const EDGE = 16

export default function PongGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [score, setScore] = useState({ player: 0, ai: 0 })
  const [started, setStarted] = useState(false)
  const stateRef = useRef({
    playerY: H / 2,
    aiY: H / 2,
    ballX: W / 2,
    ballY: H / 2,
    ballVx: SPEED,
    ballVy: SPEED * 0.6,
    running: false,
    pointerDown: false,
  })

  const resetBall = useCallback((dir: number) => {
    const s = stateRef.current
    s.ballX = W / 2
    s.ballY = H / 2
    s.ballVx = SPEED * dir
    s.ballVy = (Math.random() - 0.5) * SPEED * 1.2
  }, [])

  const startGame = useCallback(() => {
    setStarted(true)
    stateRef.current.running = true
    resetBall(1)
    setScore({ player: 0, ai: 0 })
    haptic('medium')
  }, [resetBall])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let rafId: number

    const handlePointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      const scaleY = H / rect.height
      stateRef.current.playerY = (e.clientY - rect.top) * scaleY
    }

    const handleTouch = (e: TouchEvent) => {
      e.preventDefault()
      const rect = canvas.getBoundingClientRect()
      const scaleY = H / rect.height
      stateRef.current.playerY = (e.touches[0].clientY - rect.top) * scaleY
    }

    canvas.addEventListener('pointermove', handlePointerMove)
    canvas.addEventListener('touchmove', handleTouch, { passive: false })

    const draw = () => {
      const s = stateRef.current
      const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#FF4D00'

      ctx.fillStyle = '#0a0a0a'
      ctx.fillRect(0, 0, W, H)

      // dashed centre line
      ctx.setLineDash([4, 8])
      ctx.strokeStyle = '#1e1e1e'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(W / 2, 0)
      ctx.lineTo(W / 2, H)
      ctx.stroke()
      ctx.setLineDash([])

      if (s.running) {
        // AI
        const aiTarget = s.ballY
        if (s.aiY < aiTarget - 4) s.aiY += AI_SPEED
        else if (s.aiY > aiTarget + 4) s.aiY -= AI_SPEED

        // ball
        s.ballX += s.ballVx
        s.ballY += s.ballVy

        if (s.ballY - BALL_R <= 0 || s.ballY + BALL_R >= H) {
          s.ballVy *= -1
          s.ballY = s.ballY - BALL_R <= 0 ? BALL_R : H - BALL_R
        }

        // player paddle hit
        const pTop = s.playerY - PADDLE_H / 2
        const pBot = s.playerY + PADDLE_H / 2
        if (
          s.ballX - BALL_R <= EDGE + PADDLE_W &&
          s.ballX + BALL_R >= EDGE &&
          s.ballY >= pTop &&
          s.ballY <= pBot
        ) {
          s.ballVx = Math.abs(s.ballVx) * 1.03
          s.ballVy += (s.ballY - s.playerY) * 0.06
          s.ballX = EDGE + PADDLE_W + BALL_R
          haptic('light')
        }

        // AI paddle hit
        const aTop = s.aiY - PADDLE_H / 2
        const aBot = s.aiY + PADDLE_H / 2
        if (
          s.ballX + BALL_R >= W - EDGE - PADDLE_W &&
          s.ballX - BALL_R <= W - EDGE &&
          s.ballY >= aTop &&
          s.ballY <= aBot
        ) {
          s.ballVx = -Math.abs(s.ballVx) * 1.03
          s.ballVy += (s.ballY - s.aiY) * 0.06
          s.ballX = W - EDGE - PADDLE_W - BALL_R
        }

        // scoring
        if (s.ballX < 0) {
          setScore((p) => ({ ...p, ai: p.ai + 1 }))
          haptic('heavy')
          resetBall(1)
        }
        if (s.ballX > W) {
          setScore((p) => ({ ...p, player: p.player + 1 }))
          haptic('medium')
          resetBall(-1)
        }

        // speed cap
        const maxV = 7
        s.ballVx = Math.max(-maxV, Math.min(maxV, s.ballVx))
        s.ballVy = Math.max(-maxV, Math.min(maxV, s.ballVy))
      }

      // player paddle
      ctx.fillStyle = accent
      ctx.fillRect(EDGE, s.playerY - PADDLE_H / 2, PADDLE_W, PADDLE_H)

      // AI paddle
      ctx.fillStyle = '#333'
      ctx.fillRect(W - EDGE - PADDLE_W, s.aiY - PADDLE_H / 2, PADDLE_W, PADDLE_H)

      // ball
      ctx.beginPath()
      ctx.arc(s.ballX, s.ballY, BALL_R, 0, Math.PI * 2)
      ctx.fillStyle = '#fff'
      ctx.fill()

      // ball glow
      if (s.running) {
        ctx.beginPath()
        ctx.arc(s.ballX, s.ballY, BALL_R * 3, 0, Math.PI * 2)
        const g = ctx.createRadialGradient(s.ballX, s.ballY, 0, s.ballX, s.ballY, BALL_R * 3)
        g.addColorStop(0, 'rgba(255,255,255,0.08)')
        g.addColorStop(1, 'rgba(255,255,255,0)')
        ctx.fillStyle = g
        ctx.fill()
      }

      rafId = requestAnimationFrame(draw)
    }

    rafId = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(rafId)
      canvas.removeEventListener('pointermove', handlePointerMove)
      canvas.removeEventListener('touchmove', handleTouch)
    }
  }, [resetBall])

  return (
    <div className="pong-wrapper">
      <div className="pong-header">
        <span className="pong-label">Take a break</span>
        <span className="pong-score">{score.player} &ndash; {score.ai}</span>
      </div>
      <div className="pong-canvas-wrap">
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          className="pong-canvas"
          onClick={!started ? startGame : undefined}
        />
        {!started && (
          <button className="pong-start" onClick={startGame}>
            Tap to play
          </button>
        )}
      </div>
    </div>
  )
}
