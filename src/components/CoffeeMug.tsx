/** Tiny inline coffee-mug SVG — used as a decorative easter-egg. */
export default function CoffeeMug({
  size = 18,
  className = '',
  style,
}: {
  size?: number
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <svg
      className={`coffee-mug ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
      aria-hidden="true"
    >
      {/* steam wisps */}
      <path d="M8 2c0 1.5-1 2-1 3.5S8 7.5 8 9" opacity=".45" />
      <path d="M12 2c0 1.5-1 2-1 3.5s1 2 1 3.5" opacity=".35" />
      {/* mug body */}
      <path d="M5 10h10a1 1 0 0 1 1 1v5a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-5a1 1 0 0 1 1-1z" />
      {/* handle */}
      <path d="M16 12h1a3 3 0 0 1 0 6h-1" />
      {/* saucer */}
      <path d="M3 22h16" opacity=".5" />
    </svg>
  )
}
