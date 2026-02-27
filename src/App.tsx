import { useEffect, useState } from 'react'
import Lenis from 'lenis'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Marquee from './components/Marquee'
import About from './components/About'
import Projects from './components/Projects'
import Creative from './components/Creative'
import Contact from './components/Contact'
import './App.css'

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
