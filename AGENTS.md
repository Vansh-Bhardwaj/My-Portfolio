## Cursor Cloud specific instructions

This is a React + TypeScript + Vite single-page application (portfolio site). No backend, no database, no external services required.

### Available npm scripts

See `package.json` for all scripts. Key ones:

- `npm run lint` — ESLint with `--max-warnings 0`
- `npm run build` — TypeScript check (`tsc`) then Vite production build
- `npm run preview` — serve the production build locally on port 4173 at `/My-Portfolio/`

### Notes

- The Vite config sets `base: "/My-Portfolio/"`, so the app is served at that subpath (e.g. `http://localhost:4173/My-Portfolio/`).
- There are no automated tests configured in this project; lint and build are the primary quality checks.
- Node.js 18+ is required (project uses ES2020 target and ESM modules).
