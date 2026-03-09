import { useEffect, useState, lazy, Suspense } from 'react'
import Lenis from 'lenis'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Marquee from './components/Marquee'
import './App.css'

const About = lazy(() => import('./components/About'))
const Projects = lazy(() => import('./components/Projects'))
const Creative = lazy(() => import('./components/Creative'))
const Experience = lazy(() => import('./components/Experience'))
const Stack = lazy(() => import('./components/Stack'))
const Contact = lazy(() => import('./components/Contact'))

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
        <Suspense fallback={null}>
          <About />
          <Projects />
          <Creative />
          <Experience />
          <Stack />
          <Contact />
        </Suspense>
      </main>
      <footer className="footer">
        <div className="container footer-inner">
          <span>&copy; {new Date().getFullYear()} Vansh Bhardwaj</span>
          <span>Designed &amp; Engineered by Hand</span>
        </div>
      </footer>
    </>
  )
}

export default App
