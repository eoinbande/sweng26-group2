# Procrastination Solver - Backend

AI-powered goal planning API built with FastAPI and Supabase.

---

## 🚀 Quick Start

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop) installed and running

### Setup 
```bash
# 1. Clone and navigate
git clone <repo-url>
cd backend

# 2. Create .env file
cp .env.example .env
# Ask backend lead for Supabase credentials to fill in .env

# 3. Run
docker-compose up --build



# 4. Test
# Open: http://localhost:8000/docs
```

**Done!** ✅

---

## 💻 Daily Use

**Start backend:**
```bash
docker-compose up
```

**Stop backend:**
```bash
Ctrl+C
```

**Make code changes:**
- Edit any `.py` file
- Save → Server auto-reloads
- Test at http://localhost:8000/docs

**Rebuild (only when adding packages):**
```bash
docker-compose up --build
```

---

## 📁 Project Structure
```
backend/
├── app/
│   ├── main.py          # FastAPI app
│   ├── config.py        # Environment variables
│   ├── database.py      # Supabase connection
│   └── routers/         # API endpoints 
├── Dockerfile
├── docker-compose.yml
├── requirements.txt
└── .env                 # Your secrets (never commit!)
```

---

## 🔌 API Endpoints

Visit http://localhost:8000/docs to see and test all endpoints.

**Current:**
- `GET /` - API info
- `GET /api/test/supabase` - Test DB connection


## 🐛 Troubleshooting

**Docker won't start?**
→ Make sure Docker Desktop is running

**Port 8000 in use?**
```bash
# Mac/Linux
lsof -i :8000
kill -9 

# Windows
netstat -ano | findstr :8000
taskkill /PID  /F
```

**Changes not showing?**
→ Check you saved the file (server should say "reloading...")

**Import errors after adding packages?**
→ Run `docker-compose up --build`



---

## ⚠️ Important

**NEVER commit `.env`** - it has secrets!

The `.env` file should look like this:
```bash
SUPABASE_URL=https://tvpyvxndoreoicmwhpvg.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
TEST_USER_ID=00000000-0000-0000-0000-000000000001
ENVIRONMENT=development
```

---
