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

def _parse_date(date_str: str | None) -> datetime | None:
    if not date_str:
        return None
    for fmt in ("%Y-%m-%dT%H:%M:%S.%f%z", "%Y-%m-%dT%H:%M:%S%z", "%Y-%m-%dT%H:%M:%S.%f", "%Y-%m-%dT%H:%M:%S", "%Y-%m-%d"):
        try:
            dt = datetime.strptime(date_str, fmt)
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=timezone.utc)
            return dt
        except ValueError:
            continue
    return None

# profil progress endpoints 

@profile_router.get("/profile/{user_id}/streak")
def get_streak(user_id:str):
    """
    Current streak: consecutive days (UTC) with at least one task completed.
    Derived from tasks.updated_at where status == 'completed'.
    """
    all_tasks = _get_all_tasks_for_user(user_id)
    completed = [t for t in all_tasks if t.get("status") == "completed" and t.get("updated_at")]

    active_days: set[str] = set()
    for t in completed:
        dt = _parse_date(t["updated_at"])
        if dt:
            active_days.add(dt.strftime("%Y-%m-%d"))

    if not active_days: # if there is no active_days then it will set the current streak equal to zero
        return {"user_id": user_id, "current_streak": 0}
    
    now = datetime.now(timezone.utc)
    today = now.strftime("%Y-%m-%d")
    yesterday = (now - timedelta(days=1)).strftime("%Y-%m-%d")
 
    current_streak = 0
    if today in active_days or yesterday in active_days:
        check = datetime.strptime(today if today in active_days else yesterday, "%Y-%m-%d").replace(tzinfo=timezone.utc)
        while check.strftime("%Y-%m-%d") in active_days:
            current_streak += 1
            check -= timedelta(days=1)
 
    return {"user_id": user_id, "current_streak": current_streak}
    
@profile_router.get("/profile/{user_id}/goals-completed")
def get_goals_completed(user_id: str):
    """
    Total number of goals where every task is marked completed.
    """
    goals = get_all_goals(user_id) or []
    count = sum(1 for g in goals if _is_goal_completed(g["id"]))
    return {"user_id": user_id, "goals_completed": count}