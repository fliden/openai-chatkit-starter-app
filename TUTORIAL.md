# ChatKit Starter Tutorial

This guide walks you through the architecture of the ChatKit starter app so you can confidently customize the experience or integrate it into a larger product. The project uses the Next.js App Router, React server components, and the `@openai/chatkit-react` helpers.

## 1. Project Layout

| Path | Purpose |
| --- | --- |
| `app/App.tsx` | Client component that wires global hooks and renders the chat UI shell. |
| `app/page.tsx` | The route entry point; it simply renders the `App` component. |
| `app/api/create-session/route.ts` | Edge runtime API endpoint that brokers ChatKit sessions. |
| `components/ChatKitPanel.tsx` | Main chat surface that embeds `<openai-chatkit>` and handles events. |
| `components/ErrorOverlay.tsx` | Overlay shown while sessions initialize or when recoverable errors occur. |
| `hooks/useColorScheme.ts` | Persistent light/dark/system theme hook used by the chat panel. |
| `lib/config.ts` | Centralized configuration for prompts, theme palette, and environment-driven constants. |
| `public/` | Static assets (images, icons, docs) served by Next.js. |

## 2. UI Shell (`app/App.tsx`)

- Marks itself as a client component and pulls the current color scheme from `useColorScheme`.
- Provides handlers for ChatKit widget actions (for example, `record_fact`) and lifecycle events so you can layer in analytics or persistence.
- Renders a responsive container with light/dark background classes; `setScheme` is passed down so the agent can request theme changes at runtime.

## 3. Page Routing (`app/page.tsx`)

The App Router automatically turns this file into the `/` route. Because the chat experience lives entirely inside `App`, the page component just returns `<App />`. This keeps routing concerns separate from the chat implementation.

## 4. Chat Surface (`components/ChatKitPanel.tsx`)

`ChatKitPanel` is the heart of the interface:

- Imports configuration constants (starter prompts, greeting, placeholders, theme info) from `lib/config.ts`. By editing those exports you immediately change what ChatKit renders.
- Uses the `useChatKit` hook to instantiate and control the `<ChatKit>` web component. You can pass override props such as `startScreen`, `composer`, and `threadItemActions`.
- Implements `getClientSecret`, the callback ChatKit invokes whenever it needs a fresh session token. The callback POSTs to `CREATE_SESSION_ENDPOINT`, handles JSON parsing, and raises helpful debug logs in development mode.
- Manages non-happy paths with `ErrorOverlay`. Script load failures, missing workflow IDs, or API errors all surface through the overlay so users see actionable messages.
- Watches for custom tool calls: the Agent Builder can issue `switch_theme` or `record_fact` actions, and the component responds by flipping the theme or emitting `onWidgetAction`.
- Tracks initialization state and retries. `handleResetChat` lets you recycle the widget if the session needs a restart without forcing a page refresh.

## 5. Error Overlay (`components/ErrorOverlay.tsx`)

This lightweight client component renders a translucent overlay with optional retry affordances. It receives error messages from `ChatKitPanel`, but you can reuse it in other views by passing your own `error` / `fallbackMessage`.

## 6. Theme Hook (`hooks/useColorScheme.ts`)

`useColorScheme` centralizes theme persistence:

- Syncs with the system-level color scheme via `matchMedia` and `useSyncExternalStore`.
- Stores the user preference in `localStorage`, reacting to cross-tab updates (`storage` event).
- Applies the chosen scheme to `<html>` by toggling `data-color-scheme`, the `dark` class, and `color-scheme` CSS property—a pattern Tailwind recognizes immediately.
- Exposes helpers to set an explicit scheme or fall back to “system.” `App` passes `setScheme` to ChatKit so an automation workflow can call `switch_theme`.

## 7. Serverless Session Broker (`app/api/create-session/route.ts`)

The POST handler is responsible for exchanging your OpenAI API key and workflow ID for a ChatKit session client secret:

- Validates the presence of `OPENAI_API_KEY`; without it the handler returns a 500 with guidance.
- Accepts optional overrides from the request body but defaults to `WORKFLOW_ID` from `lib/config.ts`.
- Persists a `chatkit_session_id` cookie so subsequent calls use a stable user identifier. The cookie is HTTP-only, SameSite=Lax, and Secure in production.
- Forwards requests to `https://api.openai.com/v1/chatkit/sessions` (or `CHATKIT_API_BASE` if provided) with `OpenAI-Beta: chatkit_beta=v1`.
- Normalizes upstream errors into structured JSON and logs useful diagnostics during development.

Because the route exports `runtime = "edge"`, it runs on the Edge Runtime for low latency. You can add middleware or auth checks here before the upstream call.

## 8. Configuration Hub (`lib/config.ts`)

- `WORKFLOW_ID` reads from `NEXT_PUBLIC_CHATKIT_WORKFLOW_ID`; it defaults to an empty string so missing configuration trips the UI error overlay.
- `CREATE_SESSION_ENDPOINT` points the client to the Next.js API route.
- `STARTER_PROMPTS`, `PLACEHOLDER_INPUT`, and `GREETING` define the initial chat experience.
- `getThemeConfig` tailors ChatKit’s palette. Try tweaking grayscale or accent values and watch them propagate instantly.

## 9. Environment Variables

Create `.env.local` (based on `.env.example`) with:

- `OPENAI_API_KEY` – must live in the same OpenAI org/project as your Agent Builder workflow.
- `NEXT_PUBLIC_CHATKIT_WORKFLOW_ID` – the `wf_...` identifier your agent exposes.
- Optional `CHATKIT_API_BASE` if you proxy ChatKit through a different domain.

Remember to restart `npm run dev` after editing env files so both the API route and client pick up the change.

## 10. Local Development Workflow

1. `npm install` – pulls dependencies.
2. `npm run dev` – starts the Next.js dev server with hot reload.
3. Visit `http://localhost:3000` – verify the start screen loads and that the API route returns a session.
4. `npm run lint` or `npm run build` – sanity check type safety and runtime issues before shipping changes.

## 11. Customization Ideas

- Update prompt copy or add icons in `lib/config.ts` to steer your agent conversations.
- Extend `ChatKitPanel`’s `onWidgetAction` to persist facts, send analytics, or trigger secondary workflows.
- Implement additional API routes next to `create-session` for storing transcripts, then call them from `onResponseEnd`.
- Swap Tailwind utility classes in `App.tsx` or `ErrorOverlay.tsx` to align the UI with your brand.

With these building blocks you can iterate quickly: change config values for instant UI updates, or dive into `ChatKitPanel` to add advanced behaviors.
