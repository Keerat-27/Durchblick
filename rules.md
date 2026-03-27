Guidelines for AI assistants and contributors working on this repo. Each section is independent.

---

## Contents

1. [Event handler parameter naming](#1-event-handler-parameter-naming)
2. [Kebab-case source filenames](#2-kebab-case-source-filenames)
3. [Comments — avoid noise](#3-comments--avoid-noise)
4. [Imports and path alias](#4-imports-and-path-alias)
5. [UI stack and styling](#5-ui-stack-and-styling)
6. [API and backend](#6-api-and-backend)
7. [Auth and routing](#7-auth-and-routing)
8. [Where code lives](#8-where-code-lives)
9. [Changes and scope](#9-changes-and-scope)

---

## 1. Event handler parameter naming

When writing DOM or React event handlers, name the event argument **`event`**, not `e`, `ev`, or `evt`.

### Why

- Easier to read and grep; matches common style guides.
- Avoids confusion with other meanings of `e` (errors, elements in loops).

### Scope

- React: `onChange`, `onSubmit`, `onClick`, `onBlur`, `onKeyDown`, etc.
- Vanilla JS: `addEventListener` callbacks.

### Examples

Prefer:

```tsx
<Input onChange={(event) => setName(event.target.value)} />

<form
  onSubmit={(event) => {
    event.preventDefault();
    void handleSubmit();
  }}
>
```

Avoid:

```tsx
<Input onChange={(e) => setName(e.target.value)} />
```

### Notes

- Do not rename unrelated identifiers (e.g. the letter “e” inside strings like `"e.g."`).
- If a file already uses a different convention throughout, match that file unless you are standardizing it deliberately.

---

## 2. Kebab-case source filenames

Use **kebab-case** for React/TypeScript **source file names** under `src/`, not PascalCase.

### Why

- Matches the codebase (`login-page.tsx`, `grammar-practice-view.tsx`, `auth-context.tsx`).
- Easier sorting and alignment with common JS/TS module naming.

### Scope

- **Pages:** `login-page.tsx`, `register-page.tsx`.
- **App entry:** `app.tsx` with `app.css`, not `App.tsx` / `App.css`.
- **New code:** components, hooks, utils — e.g. `my-widget.tsx`, `use-mounted.ts`, `auth-api.ts`.

### Exceptions (do not mass-rename)

- **Exported component/function names** stay PascalCase or camelCase as usual (e.g. `export default function App` in `app.tsx`).
- **`src/components/ui/` (shadcn-style):** keep existing filenames and project patterns.
- **Repo root and `server/` config** — follow each tool’s conventions.

### Examples

| File path                      | Export name (OK)  |
| ------------------------------ | ----------------- |
| `src/pages/login-page.tsx`     | `LoginPage`       |
| `src/views/dashboard-app.tsx`  | `DashboardApp`    |
| `src/app.tsx`                  | `App`             |
| `src/main.tsx`                 | imports `./app`   |

---

## 3. Comments — avoid noise

**Do not add unnecessary comments.** Prefer clear names, structure, and types over explaining obvious code.

### Skip comments that

- Restate what the next line does in plain English (“set loading to true”).
- Label obvious sections (`// hooks`, `// return` next to `return`).
- Duplicate information already expressed by types, function names, or tests.

### When comments are appropriate

- **Non-obvious rationale:** tradeoffs or invariants the code alone does not convey.
- **Workarounds:** links to issues, browser/API quirks, temporary hacks with intent to remove.
- **Exported APIs:** short JSDoc only where it adds real value.

### Principle

If removing the comment would not make the code harder to maintain for a competent reader, leave it out.

---

## 4. Imports and path alias

- Prefer the **`@/*` alias** mapped to `src/*` (see `tsconfig.app.json`): `@/components/...`, `@/lib/...`, `@/hooks/...`, `@/contexts/...`, `@/api/...`, `@/views/...`, `@/pages/...`.
- **Default export** pages/components are imported without braces; **named** imports use braces, matching each module’s export style.

---

## 5. UI stack and styling

- **Components:** primitives under `src/components/ui/` follow this project’s **shadcn + Base UI** setup. Do not rename those files to satisfy kebab-case rules.
- **Icons:** **lucide-react**.
- **Theming:** **next-themes** with `ThemeProvider`. Client-only theme UI should avoid hydration flashes (e.g. **`useMounted`** where needed).
- **Toasts:** there is **no** shared Sonner/toast layer in this repo yet. Do not assume `lib/app-toast` or `components/ui/sonner` exist unless they are added.
- **Class names:** merge with **`cn()`** from **`@/lib/utils.ts`** (clsx + tailwind-merge).
- **Look and feel:** prefer existing **Duo-style** tokens and variables from `index.css` / `app.css` (e.g. **`--duo-border`**, **`--chart-2`**, **`--primary-shadow`**) rather than unrelated design systems or ad hoc hex unless necessary.

---

## 6. API and backend

This app is **Vite + React** in the repo root and a separate **Express** API under **`server/`**.

### Frontend HTTP

- Use **`src/api/auth-api.ts`** helpers (`authFetch`, `loginRequest`, `registerRequest`, etc.) for authenticated routes — **`fetch`** with **`credentials: 'include'`** so **httpOnly refresh cookies** work.
- **Base URL:** in local dev, leave **`VITE_API_URL`** unset so requests stay same-origin and **Vite’s `/api` proxy** forwards to the API (default `http://localhost:3001`). For production builds against a separate host, set **`VITE_API_URL`** (no trailing slash).
- **Access token:** stored under **`dl_access_token`** in `localStorage` (see `auth-api.ts`); do not assume a generic **`token`** key or **Axios** unless the project is migrated.

### Backend

- Auth routes live under **`/api/auth/*`** on the Express app (`server/src/`).
- **Do not** document or assume **Create React App** env vars (**`REACT_APP_*`**) or a **Django/backend on port 8000`** for this repo.

---

## 7. Auth and routing

- **Libraries:** **react-router-dom** (v7) with **`BrowserRouter`** in **`main.tsx`**.
- **Auth state:** **`AuthProvider`** / **`useAuth`** in **`src/contexts/auth-context.tsx`**.
- **Route wiring** in **`src/app.tsx`:**
  - **`LoginRoute`** / **`RegisterRoute`** — wait for auth bootstrap (`AuthRouteSpinner`), then show the portal or redirect signed-in users to **`/`**.
  - **`ProtectedRoute`** — requires a user; shows a small full-screen placeholder while **`status === 'loading'`**; redirects guests to **`/login`** (with `state.from` when applicable).
  - **`*`** — catch-all navigates to **`/`**.
- There is **no** `Layout` wrapper, **`PublicRoute`**, **`LandingRoute`**, **`AdminRoute`**, **`FullPageSpinner`**, or **`FullPageRadarSpinner`** in this codebase unless you add them.

---

## 8. Where code lives

- **Full-screen route UIs:** **`src/pages/*-page.tsx`** (login, register).
- **Large app shells / feature views:** **`src/views/`** (e.g. **`dashboard-app.tsx`**, **`grammar-practice-view.tsx`**).
- **Auth layout shared by portals:** **`src/components/auth-portal-layout.tsx`**.
- **Reusable hooks:** **`src/hooks/`**.
- **Pure helpers:** **`src/lib/utils.ts`**, **`src/utils/`**, **`src/types/`**, **`src/data/`**.
- **API modules:** **`src/api/`** (auth, Wikipedia grammar, etc.).
- **Express API:** **`server/src/`** (not inside `src/`).

There is **no** `frontend/` directory, **`components/layout.tsx`**, **`lib/layout-nav.ts`**, **`components/graphics/`**, or **`applyradar-graphics.css`** in this project.

---

## 9. Changes and scope

- **Match existing files** before introducing a new pattern.
- **Keep diffs focused:** change only what the task requires; avoid drive-by refactors or unrelated files.
- **Prefer extraction** when the same logic repeats (small **`hooks/`** or **`lib/`** helpers) instead of copy-paste.

### Dev workflow (reference)

- Run **frontend + API** together: **`./.trdf web`** or **`npm run web`** / **`npm run dev:full`** (see **`README.md`**).

---

_Last updated: aligned with the Vite monorepo layout, Express JWT API, and current `src/` tree. Remove or revise sections if the stack changes._
