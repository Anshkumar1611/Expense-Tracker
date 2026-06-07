# Deployment

This app is split into two deployables:

- **Frontend** (`client/`) — a static React/Vite build → **Vercel**
- **Backend** (`server/`) — an Express API with a SQLite database → a host
  with a **persistent disk** (Render / Railway / Fly), because Vercel's
  serverless filesystem can't persist a SQLite file.

> **Why not the backend on Vercel too?** Vercel functions run on a read-only,
> ephemeral filesystem (only `/tmp`, which isn't shared between invocations).
> `better-sqlite3` writes to a real file, so the data would be lost on every
> cold start. Keeping the backend on a host with a mounted disk avoids a full
> rewrite to a hosted database.

---

## 0. Prerequisites

- The project pushed to a **GitHub repo** (both Vercel and Render deploy from git).
  This folder isn't a git repo yet:
  ```bash
  cd /Users/anshkumar/Personal/expense-tracker
  git init && git add . && git commit -m "Initial commit"
  # create a repo on GitHub, then:
  git remote add origin https://github.com/<you>/expense-tracker.git
  git push -u origin main
  ```
  (`.env` and `*.db*` files are git-ignored, so secrets and local data won't be pushed.)

---

## 1. Deploy the backend (Render)

A `server/render.yaml` blueprint is included.

1. On https://render.com → **New → Web Service** → connect the repo.
2. Set **Root Directory** = `server`.
3. Build command `npm install`, start command `npm start` (already in `render.yaml`).
4. Add a **Persistent Disk**: mount path `/data`, size 1 GB.
   *(Requires the paid Starter plan — the free tier has no persistent disk and
   would wipe the database on each redeploy.)*
5. Set environment variables:
   | Key | Value |
   |-----|-------|
   | `JWT_SECRET` | a long random string (`openssl rand -hex 32`) |
   | `DATABASE_PATH` | `/data/data.db` |
   | `CLIENT_ORIGIN` | your Vercel URL (fill in after step 2, e.g. `https://expense-tracker.vercel.app`) |
6. Deploy. Confirm it's live: `https://<your-api>.onrender.com/api/health` → `{"status":"ok"}`.

> **Alternatives:** Railway (add a Volume mounted where `DATABASE_PATH` points) or
> Fly.io (`fly volumes create`, free allowance). Same three env vars apply.

---

## 2. Deploy the frontend (Vercel)

1. On https://vercel.com → **Add New → Project** → import the repo.
2. Set **Root Directory** = `client` (Vercel auto-detects Vite; `client/vercel.json`
   covers the build + SPA routing fallback).
3. Add an environment variable:
   | Key | Value |
   |-----|-------|
   | `VITE_API_URL` | your backend origin from step 1, **no** trailing slash, e.g. `https://expense-tracker-api.onrender.com` |
4. Deploy. Vercel gives you a URL like `https://expense-tracker.vercel.app`.

---

## 3. Link the two

1. Copy the Vercel URL into the backend's `CLIENT_ORIGIN` env var (Render dashboard) and redeploy the backend.
2. Open the Vercel URL, register an account, and confirm expenses save and reload.

`VITE_API_URL` is read at **build time**, so if you change it later, trigger a
redeploy on Vercel.

---

## Local development (unchanged)

Leave `VITE_API_URL` empty locally — the Vite dev proxy forwards `/api` to
`http://localhost:4000`. See the root `README.md` for the two-terminal setup.
