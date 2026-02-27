import { useEffect, useState, useRef } from 'react'
import Lenis from 'lenis'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Marquee from './components/Marquee'
import About from './components/About'
import Projects from './components/Projects'
import Creative from './components/Creative'
import Contact from './components/Contact'
import './App.css'

function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const pos = useRef({ x: 0, y: 0 })
  const target = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      target.current = { x: e.clientX, y: e.clientY }
    }

    const animate = () => {
      pos.current.x += (target.current.x - pos.current.x) * 0.15
      pos.current.y += (target.current.y - pos.current.y) * 0.15
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${pos.current.x}px, ${pos.current.y}px)`
      }
      requestAnimationFrame(animate)
    }

    window.addEventListener('mousemove', onMove)
    const raf = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(raf)
    }
  }, [])

  return <div ref={dotRef} className="custom-cursor" />
}

function App() {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    })

    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)

    const timer = setTimeout(() => setLoaded(true), 100)

    return () => {
      lenis.destroy()
      clearTimeout(timer)
    }
  }, [])

  return (
    <>
      <CustomCursor />
      <div className="noise-overlay" />
      <div className={`page-loader ${loaded ? 'done' : ''}`} />
      <Navbar />
      <main>
        <Hero />
        <Marquee />
        <About />
        <Projects />
        <Creative />
        <Contact />
      </main>
      <footer className="footer">
        <div className="container footer-inner">
          <span>&copy; {new Date().getFullYear()} Vansh Bhardwaj</span>
          <span>Built with craft</span>
        </div>
      </footer>
    </>
  )
}

export default App
