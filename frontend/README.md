# How to Run the App

You need **2 terminals** open at the same time: one for the backend, one for the frontend. (And a **3rd** if you want to test on your phone).

---

## Install these first (once)

- [Node.js](https://nodejs.org/) (LTS version)
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
- **[ngrok](https://ngrok.com/download)**

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


#### NEW CRUCIAL change FOR FRONTEND .env !!!!
Change VITE_API_URL=http://localhost:8000/api for VITE_API_URL=/api

(To ensure the app works both locally and via ngrok, we use a relative path for the API)

`frontend/.env` should look like:
```
VITE_SUPABASE_URL=https://tvpyvxndoreoicmwhpvg.supabase.co
VITE_SUPABASE_ANON_KEY=<ask a 3rd year>
VITE_API_URL=/api
```

(This works because our vite.config.js is set up to proxy all /api calls to localhost:8000)

---

## First-time setup

If you want to open the app on your phone or share it with someone outside your house:

1. **Terminal 1 & 2** must be running as usual.

2. **Start the tunnel in a 3rd terminal:**

```
ngrok http 5173
```
4. **Open the link:**

Copy the Forwarding URL (e.g., https://abcd-123.ngrok-free.app) and open it on your phone.

5. **Bypass the warning:**

When you first open the link, you will see an ngrok splash screen. Click "Visit Site" to load the app.


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