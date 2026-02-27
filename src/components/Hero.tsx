function SplitLine({ text, baseDelay, className = '' }: { text: string; baseDelay: number; className?: string }) {
  return (
    <span className={`split-line ${className}`}>
      {text.split('').map((char, i) => (
        <span
          key={i}
          className="char"
          style={{ animationDelay: `${baseDelay + i * 0.04}s` }}
        >
          {char}
        </span>
      ))}
    </span>
  )
}

export default function Hero() {
  return (
    <section className="hero">
      <p className="hero-label animate-in" style={{ animationDelay: '0.8s' }}>
        Creative Developer &amp; Co-Founder
      </p>
      <h1 className="hero-name">
        <SplitLine text="Vansh" baseDelay={1.0} />
        <SplitLine text="Bhardwaj" baseDelay={1.3} className="stroke" />
      </h1>
      <p className="hero-desc animate-in" style={{ animationDelay: '1.8s' }}>
        Building immersive digital experiences &mdash; from VR worlds
        and mobile games to modern web applications.
      </p>
      <span className="hero-scroll animate-in" style={{ animationDelay: '2.2s' }}>Scroll</span>
    </section>
  )
}
