# Repository Guidelines

## Project Structure & Module Organization
- Source in `src/` using a feature‑sliced layout: `app/`, `pages/`, `features/`, `entities/`, `shared/`, `assets/`.
- Routes live in `src/app/routes.tsx`; app entry is `src/main.tsx` and styles in `src/index.css`.
- Shared utilities and UI live under `src/shared/{utils,ui,config,nats}`. Persisted client data uses `src/shared/db.ts` (IndexedDB).
- Build output goes to `dist/`. Public assets are in `public/`.

## Build, Test, and Development Commands
- `npm run dev`: Start Vite dev server with React Fast Refresh.
- `npm run build`: Type‑check (`tsc -b`) and produce production build to `dist/`.
- `npm run preview`: Serve the production build locally.
- `npm run lint`: Run ESLint over the repo.

Use one package manager consistently. Prefer `npm` (a `package-lock.json` is present).

## Coding Style & Naming Conventions
- Language: TypeScript with React 18/19 JSX (`react-jsx`). Strict mode enabled.
- Linting: ESLint (`eslint.config.js`) with TypeScript, React Hooks, and React Refresh rules. Fix issues before committing.
- Components: `PascalCase.tsx` (e.g., `Wallets.tsx`). Hooks: `useX.ts`. Barrel exports via `index.ts` where useful.
- Folder roles follow feature‑sliced design: page‑level UI in `pages/`, reusable features in `features/`, domain models in `entities/`, cross‑cutting in `shared/`.

## Testing Guidelines
- No test runner is configured yet. When adding tests, prefer Vitest + React Testing Library.
- Co‑locate tests next to code as `*.test.ts`/`*.test.tsx` and keep them independent of network; mock NATS/Keycloak.
- Aim for meaningful coverage on `features/` and `entities/` logic.

## Commit & Pull Request Guidelines
- Commits: Use concise, imperative messages. Conventional Commits are preferred (e.g., `feat: add wallets page`, `fix: debounce nats reconnect`). Group related changes.
- PRs: Provide a summary, linked issue, and steps to verify. Include screenshots/GIFs for UI changes. Ensure `npm run lint` and `npm run build` succeed.

## Security & Configuration
- Configure environment in `.env` (see `.env.example`): `VITE_NATS_URL`, `VITE_KEYCLOAK_URL`, `VITE_KEYCLOAK_REALM`, `VITE_KEYCLOAK_CLIENT_ID`.
- Do not commit secrets. Prefer mock values in examples and avoid logging tokens.
