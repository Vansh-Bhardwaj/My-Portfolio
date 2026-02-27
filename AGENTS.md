# AGENTS.md

## Cursor Cloud specific instructions

This is a React + TypeScript + Vite single-page portfolio website. No backend, no database, no external services required.

### Available npm scripts

See `package.json` for all scripts. Key ones:

- `npm run lint` — ESLint with `--max-warnings 0`
- `npm run build` — TypeScript check (`tsc`) then Vite production build
- `npm run preview` — serve the production build locally (default port 4173)

### Notes

- The Vite config sets `base: "/"` for deployment to a custom domain.
- There are no automated tests configured; lint and build are the primary quality checks.
- Node.js 18+ is required (project uses ES2020 target and ESM modules).
- The site uses Google Fonts (Space Grotesk), loaded via CDN in `index.html`.
- CSS is split into `src/index.css` (reset/variables/scrollbar) and `src/App.css` (component styles + responsive breakpoints).
- All scroll-reveal animations use a custom `useInView` hook backed by IntersectionObserver.
- Lenis smooth scroll is initialized in `App.tsx`; do NOT add `scroll-behavior: smooth` to CSS.
- The "Selected Work" section uses a scroll-takeover pattern (sticky + scroll-driven state) — its container height is `numProjects * 100vh`.
- The project visual panels use CSS gradients (no screenshot images in `public/`). Each project's `gradient` and `decoColor` are defined inline in `Projects.tsx`.
- Mobile nav uses a hamburger toggle (`Navbar.tsx`) that shows a fullscreen overlay with backdrop blur.
- Responsive breakpoints are at 1024px, 768px, 480px, and 360px (see bottom of `App.css`).
- The user's canonical portfolio data source is https://vanshbhardwaj.is-a.dev/ — use it to verify bio, experience, and project details.
