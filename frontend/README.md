# How to Run the App

You need **2 terminals** open at the same time: one for the backend, one for the frontend.

---

## Install these first (once)

- [Node.js](https://nodejs.org/) (LTS version)
- [Docker Desktop](https://www.docker.com/products/docker-desktop)

---

## First-time setup

### Backend (Terminal 1)

```bash
cd backend
cp .env.example .env # copy the format to your .env
# now open backend/.env and fill in with real credentials (ask a 3rd year for these)
docker-compose up --build
```

`backend/.env` should look like:
```
SUPABASE_URL=https://tvpyvxndoreoicmwhpvg.supabase.co
SUPABASE_KEY=<ask a 3rd year>
TEST_USER_ID=00000000-0000-0000-0000-000000000001
ENVIRONMENT=development
```

Wait until you see `Uvicorn running on http://0.0.0.0:8000`. Leave this terminal open.

### Frontend (Terminal 2 — open a NEW one)

```bash
cd frontend
cp .env.example .env
# open frontend/.env and fill in the real credentials (ask a 3rd year)
npm install
npm run dev
```

`frontend/.env` should look like:
```
VITE_SUPABASE_URL=https://tvpyvxndoreoicmwhpvg.supabase.co
VITE_SUPABASE_ANON_KEY=<ask a 3rd year>
VITE_API_URL=http://localhost:8000/api
```

App runs at http://localhost:5173/

---

## Daily workflow

Make sure Docker Desktop is open, then:

**Terminal 1 — Backend:**
```bash
cd backend
docker-compose up
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm install
npm run dev
```

Both have hot-reload — just save and it updates.

**When you're done:**
```bash
Ctrl+C  # in both terminals
git add .
git commit -m "what you did"
git push origin your-branch-name
```

---

## Don't commit `.env` files!!!!!!!!!!!!!!

They're in `.gitignore` already. Share credentials privately, not through Git.

---

## Ports

- `localhost:5173` — the frontend (what you see in the browser)
- `localhost:8000` — the backend API
- `localhost:8000/docs` — API docs (useful for testing endpoints)

---

## Common errors

- **"Docker daemon not running"** → Open Docker Desktop and wait for it to start
- **"Network error" / API calls failing** → The backend isn't running properly. Check Terminal 1
- **New packages were added** → Backend: `docker-compose up --build` / Frontend: `npm install`