from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import supabase

# Import all routers
from app.routers.goals import goal_router
from app.routers.tasks import task_router
from app.routers.auth import account_router
from app.routers.schedule import schedule_router
from app.routers.profile import profile_router  

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

# Include routers — all under /api prefix
app.include_router(goal_router, prefix="/api", tags=["Goals"])
app.include_router(task_router, prefix="/api", tags=["Tasks"])
app.include_router(account_router, prefix="/api", tags=["Profiles"])
app.include_router(schedule_router, prefix="/api", tags=["Schedule"])
app.include_router(profile_router, prefix="/api", tags=["Profile"])  