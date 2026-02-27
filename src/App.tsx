import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Marquee from './components/Marquee'
import About from './components/About'
import Projects from './components/Projects'
import Contact from './components/Contact'
import './App.css'

function App() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Marquee />
        <About />
        <Projects />
        <Contact />
      </main>
      <footer className="footer">
        <div className="container footer-inner">
          <span>&copy; {new Date().getFullYear()} Vansh Bhardwaj</span>
          <span>Built with passion</span>
        </div>
      </footer>
    </>
  )
}

export default App
