# Repository Guidelines

## Project Structure & Module Organization
The app uses the Next.js App Router. Chat UI lives in `app/App.tsx` and is exposed through `app/page.tsx`. Reusable UI and feedback overlays reside in `components/`, and custom hooks (for color themes, etc.) are under `hooks/`. Shared config and constants sit in `lib/`, while `app/api/create-session/route.ts` handles ChatKit session brokering. Place static media in `public/`.

## Build, Test, and Development Commands
- `npm install` installs dependencies; run after any dependency change.
- `npm run dev` starts the hot-reloading dev server.
- `npm run build` compiles the optimized production bundle.
- `npm run start` serves the production build locally for smoke tests.
- `npm run lint` enforces ESLint rules; append `--fix` when safe.

## Coding Style & Naming Conventions
Write TypeScript React function components with 2-space indentation. Use `PascalCase` for components (`ChatKitPanel`), `camelCase` for hooks/utilities (`useColorScheme`), and `SCREAMING_SNAKE_CASE` for env-driven constants. Keep side effects in `useEffect`, export types near their usage, and organize Tailwind classes layout → spacing → color → state. Let ESLint guide import ordering and avoid unused symbols.

## Testing Guidelines
No automated suite ships yet, so rely on `npm run lint` and manual QA in `npm run dev`. When adding coverage, mirror Next.js patterns: colocate component tests or group them in `__tests__/`, use React Testing Library with Vitest or Jest, and mock network calls to `create-session`. Record edge cases for workflow IDs, session cookies, and file upload toggles before submitting a PR. Always run `npm run build` prior to review to catch runtime type errors.

## Commit & Pull Request Guidelines
Existing commits favor short imperatives (for example, `Remove unset command…`). Continue that style: one focused change per commit, present tense, ≤72 characters, and link issues or PR numbers when relevant. Pull requests need a summary of behavior, configuration updates, and manual/automated test notes; attach screenshots or clips for UI adjustments. Confirm lint and build status before requesting review.

## Configuration & Secrets
Add `OPENAI_API_KEY` and `NEXT_PUBLIC_CHATKIT_WORKFLOW_ID` to `.env.local`; optionally set `CHATKIT_API_BASE` for alternate endpoints. Restart the dev server after changes so `app/api/create-session/route.ts` receives updated values. Never commit env files, and document expected defaults when collaborating with agents or teammates.
