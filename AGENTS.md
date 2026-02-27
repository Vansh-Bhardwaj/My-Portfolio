# AGENTS.md

## Cursor Cloud specific instructions

This is a React + TypeScript + Vite portfolio app (`reactportfolio`). It is a single-service, client-side-only SPA with no backend or database dependencies.

### Key commands

All standard scripts are in `package.json`:

- **Lint:** `npm run lint`
- **Build:** `npm run build` (runs `tsc && vite build`)
- **Dev server:** `npm run dev` (Vite dev server with HMR)
- **Preview built app:** `npm run build && npm run preview`

### Notes

- The Vite config sets `base: "/My-Portfolio/"`, so the app is served under that path prefix. When using `vite preview`, access the app at `http://localhost:4173/My-Portfolio/`.
- There are no automated tests (no test framework configured). Validation relies on `npm run lint` and `npm run build`.
- No `.env` files or secrets are required.
