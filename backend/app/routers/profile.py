from fastapi import APIRouter
from datetime import datetime, timedelta, timezone
import json
 
from ..Tables import get_all_goals
from ..database import supabase
 
profile_router = APIRouter()

# Helper def

def _get_all_tasks_for_user(user_id: str) -> list[dict]:
    goals = get_all_goals(user_id)
    if not goals:
        return []
    all_tasks = []
    for goal in goals:
        rows = supabase.table("tasks").select("*").eq("goal_id", goal["id"]).execute().data
        all_tasks.extend(rows or [])
    return all_tasks

def _is_goal_completed(goal_id: str) -> bool:
    rows = supabase.table("tasks").select("status").eq("goal_id", goal_id).execute().data
    if not rows:
        return False
    return all(r["status"] == "completed" for r in rows)
        