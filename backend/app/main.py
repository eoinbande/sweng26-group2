from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import supabase

# Import the routers
from app.routers.goals import goal_router
from app.routers.tasks import task_router
from app.routers.auth import account_router
from app.routers.feedback import feedback_router
from app.routers.task_progress import task_progress_router
from app.routers.ai_tasks import ai_task_router
from app.routers.feedback import feedback_router

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

# Include routers
app.include_router(goal_router, prefix="/api", tags=["Goals"])
app.include_router(task_router, prefix="/api", tags=["Tasks"])
app.include_router(account_router, prefix="/api", tags=["Profiles"])
app.include_router(ai_task_router, prefix="/api", tags=["AI Tasks"])
app.include_router(feedback_router, prefix="/api", tags=["AI Feedback"])
app.include_router(task_progress_router, prefix="/api", tags=["task progression"])

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