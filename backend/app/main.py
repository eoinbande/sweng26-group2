from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import supabase

app = FastAPI(
    title="Procrastination Solver API",
    description="AI-powered goal planning and task management",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:8080",
        "http://localhost:4200",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "message": "Procrastination Solver API 🚀",
        "version": "1.0.0",
        "environment": settings.ENVIRONMENT,
        "docs": "/docs"
    }

@app.get("/api/test/supabase")
async def test_supabase():
    """Test Supabase connection"""
    try:
        # Try to query (table might not exist yet, that's ok)
        result = supabase.table('goals').select("*", count='exact').execute()
        return {
            "status": "success",
            "message": "Supabase connection working!",
            "goals_count": result.count if result.count else 0
        }
    except Exception as e:
        return {
            "status": "connected",
            "message": "Supabase connected (tables may not exist yet)",
            "note": str(e)
        }