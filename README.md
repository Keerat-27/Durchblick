# Durchblick

German learning web app: Vite + React (TypeScript) UI with an Express API and JWT-based authentication (access token + httpOnly refresh cookie).

## Requirements

- Node.js 20+ (recommended)

## Install

From the repository root:

```bash
npm install
npm install --prefix server
```

## Configuration (API)

1. Copy the example env file:

   ```bash
   cp server/.env.example server/.env
   ```

2. Edit `server/.env` and set **at least 32 characters** each for `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET`.

3. Adjust `CLIENT_ORIGIN` if the app is not served from `http://localhost:5173` (must match the browser origin for cookies and CORS).

User accounts are stored in `server/data/users.json` (created on first registration; the file is gitignored).

## Run the app

**Frontend and API together** (recommended):

```bash
./.trdf web
```

or:

```bash
npm run web
# same as: npm run dev:full
```

**Separate terminals:**

```bash
npm run dev          # Vite dev server (proxies /api → localhost:3001)
npm run dev:api      # API only (from ./server)
```

Open the URL Vite prints (usually `http://localhost:5173`). Use **Registrieren** / **Anmelden**; the dashboard is protected until you sign in.

## Scripts

| Command | Description |
|--------|-------------|
| `./.trdf web` | Start Vite + API via `npm run dev:full` |
| `npm run web` | Same as `dev:full` |
| `npm run dev` | Frontend only |
| `npm run dev:api` | Backend only |
| `npm run build` | Typecheck + production build (`dist/`) |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | ESLint |
| `npm run build --prefix server` | Compile API to `server/dist/` |
| `npm start --prefix server` | Run compiled API (`node dist/index.js` after build) |

## Project layout

- `src/` — React app (routes, auth context, grammar practice UI)
- `server/` — Express auth API (`/api/auth/*`)
- `.trdf` — small helper script; `./.trdf web` runs the full stack

## Production notes

- Build the SPA with `npm run build` and serve `dist/` from your host or CDN.
- Set `VITE_API_URL` when building the frontend if the API lives on another origin (omit it in local dev to use the Vite proxy).
- Run the API with a production `CLIENT_ORIGIN` matching the deployed SPA URL, and use HTTPS so secure cookies work as intended.
