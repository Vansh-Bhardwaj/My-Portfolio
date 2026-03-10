# vansh.indevs.in

Personal portfolio — a single-page site built to showcase my work, skills, and experience as a software engineer.

**Live →** [vansh.indevs.in](https://vansh.indevs.in/)

## Tech Stack

- **React 18** + **TypeScript** — component-driven UI with strict type safety
- **Vite** — instant HMR, optimized production builds with automatic code-splitting
- **Lenis** — buttery smooth scroll
- **HTML5 Canvas** — interactive brick-breaker game (AI + human mode) in the About section
- **CSS** — hand-written, no frameworks; responsive breakpoints at 1024 / 768 / 480 / 360 px
- **Cloudflare Pages** — deployed on every push to `main`

## Features

- Scroll-reveal animations powered by `IntersectionObserver` (custom `useInView` hook)
- Canvas skill-breaker game with AI that aims bounces toward bricks, dynamic difficulty scaling, and seamless AI ↔ human switching
- Haptic feedback for touch interactions (Android vibration + iOS fallback)
- Magnetic hover links, noise-grain overlay, and GPU-composited hero animation
- Lazy-loaded sections for fast initial paint
- Fully responsive down to 360 px

## Project Structure

```
src/
├── App.tsx              # Layout, Lenis init, lazy imports
├── App.css              # All component styles + responsive breakpoints
├── index.css            # CSS reset, variables, scrollbar
├── main.tsx             # React entry point
├── components/
│   ├── Hero.tsx         # Animated hero with scroll-scale effect
│   ├── Marquee.tsx      # Infinite scrolling ticker
│   ├── About.tsx        # Bio + skill playground wrapper
│   ├── SkillPlayground.tsx  # Canvas brick-breaker game (AI/human)
│   ├── Projects.tsx     # Selected work with video previews
│   ├── Creative.tsx     # Creative / 3D projects bento grid
│   ├── Experience.tsx   # Timeline of roles & education
│   ├── Stack.tsx        # Tech stack grid
│   ├── Contact.tsx      # Contact section with magnetic links
│   ├── Navbar.tsx       # Responsive nav with mobile hamburger
│   ├── ArrowIcon.tsx    # Reusable animated arrow SVG
│   └── CoffeeMug.tsx    # Decorative coffee mug SVG easter egg
├── hooks/
│   ├── useInView.ts     # IntersectionObserver hook for scroll reveals
│   └── useHaptics.ts    # Haptic feedback (vibration + iOS fallback)
public/
├── favicon.svg
└── projects/            # Video assets for project showcases
```

## Getting Started

```bash
npm install
npm run dev        # dev server at localhost:5173
npm run build      # type-check + production build
npm run lint       # ESLint with zero-warning policy
npm run preview    # serve production build locally
```

Requires **Node.js 18+**.

## Deployment

Connected to **Cloudflare Pages** — pushes to `main` trigger automatic builds and deployment.

## License

Source code is open for reference. Please don't copy the design wholesale — build your own thing.
