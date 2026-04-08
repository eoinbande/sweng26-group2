# Procrastination Solver

An AI-powered goal planning app that helps users break down their goals into actionable steps, stay accountable, and beat procrastination. Built with React and FastAPI.

**Deployed version:** https://sweng26-group2.vercel.app

## 1. Prerequisites

- [Node.js](https://nodejs.org/) (LTS version)
- [Docker Desktop](https://www.docker.com/products/docker-desktop)

## 2. Setup

You need **2 terminals** open at the same time: one for the backend, one for the frontend.

### Backend (Terminal 1)

```bash
cd backend
cp .env.example .env
# Fill in .env with real credentials (ask a team member)
docker-compose up --build
```

Wait until you see `Uvicorn running on http://0.0.0.0:8000`. Leave this terminal open.

### Frontend (Terminal 2)

```bash
cd frontend
cp .env.example .env
# Fill in .env with real credentials (ask a team member)
npm install
npm run dev
```

The app should now be running at http://localhost:5173.

## 3. Daily Workflow

Make sure Docker Desktop is open, then:

**Terminal 1 -- Backend:**
```bash
cd backend
docker-compose up
```

**Terminal 2 -- Frontend:**
```bash
cd frontend
npm run dev
```

Both have hot-reload -- just save and it updates.

## 4. Useful Links

| Service          | URL                            |
|------------------|--------------------------------|
| Frontend         | http://localhost:5173           |
| Backend API      | http://localhost:8000           |
| API Docs         | http://localhost:8000/docs      |
| Deployed App     | https://sweng26-group2.vercel.app |

## 5. Tests

**Backend:**
```bash
cd backend
docker-compose up --build
docker exec -it backend-api-1 pytest
```

**Frontend:**
```bash
cd frontend
npm run lint
```

## 6. Important

- **Never commit `.env` files** -- they contain secrets and are already in `.gitignore`.
- When new backend packages are added, rebuild with `docker-compose up --build`.
- When new frontend packages are added, run `npm install`.

## 7. Team

| Name                | Email              |
|---------------------|--------------------|
| Rwan Hashim Elmileik  | elmileir@tcd.ie    |
| Gian Luigi De Leon  | deleong@tcd.ie     |
| Hakan Okan Okray Sinisterra   | okraysih@tcd.ie    |
| Lorcan O Ceallaigh   | locealla@tcd.ie    |
| Eoin Bande   | bandee@tcd.ie    |
| Jennifer Obinna-Thomas   | obinnatj@tcd.ie    |
| Ryan O'Dowd   | ryodowd@tcd.ie    |
| Liliana Berenguer   | berengul@tcd.ie    |
