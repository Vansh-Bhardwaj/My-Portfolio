const items = [
  'Developer',
  'Game Designer',
  'Co-Founder',
  'Creative Technologist',
  'Web Developer',
  'VR / AR',
]

function MarqueeContent() {
  return (
    <div className="marquee-content">
      {items.map((item) => (
        <span className="marquee-item" key={item}>
          {item}
          <span className="marquee-dot" />
        </span>
      ))}
    </div>
  )
}

export default function Marquee() {
  return (
    <div className="marquee">
      <div className="marquee-inner">
        <MarqueeContent />
        <MarqueeContent />
      </div>
    </div>
  )
}
