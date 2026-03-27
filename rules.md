Guidelines for AI assistants and contributors working on this repo. Each section is independent.

---

## Contents

1. [Event handler parameter naming](#1-event-handler-parameter-naming)
2. [Kebab-case source filenames](#2-kebab-case-source-filenames)
3. [Comments — avoid noise](#3-comments--avoid-noise)
4. [Imports and path alias](#4-imports-and-path-alias)
5. [UI stack and styling](#5-ui-stack-and-styling)
6. [API client](#6-api-client)
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

```ts
element.addEventListener("click", (event) => {
  event.preventDefault();
});
```

Avoid:

```tsx
<Input onChange={(e) => setName(e.target.value)} />
```

### Notes

- Do not rename unrelated identifiers (e.g. the letter “e” inside strings like `"e.g."`).
- If a file already uses `event` consistently, keep that style.

---

## 2. Kebab-case source filenames

Use **kebab-case** for React/TypeScript **source file names** under `frontend/src/`, not PascalCase.

### Why

- Matches the rest of the codebase (`login-page.tsx`, `landing-page.tsx`, `auth-context.tsx`).
- Easier sorting and alignment with common JS/TS module naming.

### Scope

- **Pages:** `landing-page.tsx` (implementation) and barrel `landing.tsx`, not `Landing.tsx`.
- **App entry:** `app.tsx` with `app.css`, not `App.tsx` / `App.css`.
- **New code:** components, hooks, libs — e.g. `my-widget.tsx`, `use-session.ts`, `api-client.ts`.

### Exceptions (do not mass-rename)

- **Exported component/function names** stay PascalCase or camelCase as usual (e.g. `export default function App` in `app.tsx`).
- **`components/ui/` (shadcn):** keep existing filenames and project patterns.
- **Repo root config** (`tailwind.config.js`, etc.) — follow each tool’s conventions.

### Examples

| File path                             | Export name (OK) |
| ------------------------------------- | ---------------- |
| `frontend/src/pages/landing-page.tsx` | `LandingPage`    |
| `frontend/src/app.tsx`                | `App`            |
| `frontend/src/index.tsx`              | imports `./app`  |

---

## 3. Comments — avoid noise

**Do not add unnecessary comments.** Prefer clear names, structure, and types over explaining obvious code.

### Skip comments that

- Restate what the next line does in plain English (“set loading to true”).
- Label obvious sections (`// hooks`, `// return` next to `return`).
- Duplicate information already expressed by types, function names, or tests.
- Pad PRs or “document” self-explanatory JSX or trivial helpers.

### When comments are appropriate

- **Non-obvious rationale:** why this approach exists, tradeoffs, or invariants that code alone doesn’t convey.
- **Workarounds:** links to issues, browser/API quirks, temporary hacks with intent to remove.
- **Public or subtle contracts:** assumptions for callers where JSDoc on exported APIs adds real value (keep it short).

### Principle

If removing the comment would not make the code harder to maintain for a competent reader, leave it out.

---

## 4. Imports and path alias

- Prefer the **`@/*` alias** mapped to `frontend/src/*` (see `frontend/tsconfig.json`): `@/components/...`, `@/lib/...`, `@/hooks/...`, `@/contexts/...`.
- **Default export** pages/components are imported without braces; **named** imports use braces, matching each module’s export style.

---

## 5. UI stack and styling

- **Components:** **shadcn-style** primitives under `frontend/src/components/ui/` (Radix + Tailwind). Do not rename those files to match kebab-case conventions.
- **Icons:** **lucide-react**.
- **Theming:** **`next-themes`** with `ThemeProvider` (`attribute="class"`, `defaultTheme="system"`, `enableSystem`). Client-only theme UI should avoid hydration flashes (e.g. **`useMounted`** pattern where needed).
- **Toasts:** **`lib/app-toast`** with **Sonner** (`components/ui/sonner`).
- **Class names:** merge with **`cn()`** from **`lib/utils.ts`** (clsx + tailwind-merge).
- **Brand accents:** use design tokens such as **`hsl(var(--brand))`** and existing CSS variables rather than one-off hex unless necessary.

---

## 6. API client

- Use the shared **Axios instance** **`API`** from **`lib/api.ts`** (default export).
- **Base URL:** `REACT_APP_BACKEND_URL` (no trailing slash) or `http://localhost:8000`, then **`/api`**.
- **Auth:** attach **`Authorization: Bearer <token>`** from **`localStorage.getItem('token')`** when present.
- **`FormData`:** let the client omit **`Content-Type`** so the browser sets the boundary.
- **401 responses:** interceptor clears token/user and redirects to **`/login`**.

---

## 7. Auth and routing

- **Auth state** lives in **`AuthProvider`** / **`useAuth`** (`contexts/auth-context.tsx`).
- **Route wrappers** in **`app.tsx`:**
  - **`ProtectedRoute`** — requires user; shows **`FullPageSpinner`** while loading; wraps children in **`Layout`**.
  - **`PublicRoute`** — redirects authenticated users (e.g. to dashboard); may return **`null`** while loading.
  - **`LandingRoute`** — landing for guests; authenticated users redirected.
  - **`AdminRoute`** — same as protected plus **`user.role === 'admin'`**.
- **Loading UX:** **`FullPageSpinner`** → branded **`FullPageRadarSpinner`** for full-screen waits.

---

## 8. Where code lives

- **Route-level screens:** **`pages/*-page.tsx`**; optional thin barrels (e.g. **`landing.tsx`** re-exporting **`landing-page.tsx`**).
- **Shared layout:** **`components/layout.tsx`**; nav/config data in **`lib/layout-nav.ts`**, **`lib/layout-profile.ts`**, etc., instead of huge inline arrays.
- **Reusable hooks:** **`hooks/`** (e.g. **`use-mounted`**, page-specific setup like **`use-landing-page`**).
- **Pure helpers, API shapes, constants:** **`lib/`**.
- **Decorative branded SVGs:** **`components/graphics/`** with **`applyradar-graphics.css`**; decorative graphics use **`aria-hidden`**; loading indicators use appropriate **`role`** / **`aria-live`**.

---

## 9. Changes and scope

- **Match existing files** before introducing a new pattern.
- **Keep diffs focused:** change only what the task requires; avoid drive-by refactors, unrelated files, or new markdown docs unless asked.
- **Prefer extraction** when the same logic or styling repeats (small **`hooks/`** or **`lib/`** helpers) instead of copy-paste.

---

_Last updated: rules are additive; prefer matching existing files over introducing new conventions in isolation._
