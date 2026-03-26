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

@profile_router.get("/profile/{user_id}/tasks-completed")
def get_tasks_completed(user_id: str):
    """
    Total number of tasks and subtasks ever marked completed.
    """
    all_tasks = _get_all_tasks_for_user(user_id)
    count = sum(1 for t in all_tasks if t.get("status") == "completed")
    return {"user_id": user_id, "tasks_completed": count}

@profile_router.get("/profile/{user_id}/goals-completed-on-time")
def get_goals_completed_on_time(user_id: str):
    """
    Total goals completed on or before their goal_due_date.
    Completion date is the latest tasks.updated_at across the goal.
    """
    goals = get_all_goals(user_id) or []
    all_tasks = _get_all_tasks_for_user(user_id)
 
    count = 0
    for g in goals:
        if not _is_goal_completed(g["id"]):
            continue
 
        goal_data = g.get("goal_data", {})
        if isinstance(goal_data, str):
            try:
                goal_data = json.loads(goal_data)
            except (json.JSONDecodeError, TypeError):
                goal_data = {}
 
        due_dt = _parse_date(goal_data.get("goal_due_date"))
        if not due_dt:
            continue
 
        goal_tasks = [t for t in all_tasks if t.get("goal_id") == g["id"] and t.get("updated_at")]
        completion_dates = [d for d in (_parse_date(t["updated_at"]) for t in goal_tasks) if d]
        if not completion_dates:
            continue
 
        if max(completion_dates).date() <= due_dt.date():
            count += 1
 
    return {"user_id": user_id, "goals_completed_on_time": count}

@profile_router.get("/profile/{user_id}/tasks-completed-on-time")
def get_tasks_completed_on_time(user_id: str):
    """
    Total tasks completed on or before their due_date.
    Only tasks with both a due_date and status == 'completed' are counted.
    """
    all_tasks = _get_all_tasks_for_user(user_id)
 
    count = 0
    for t in all_tasks:
        if t.get("status") != "completed":
            continue
        due_dt = _parse_date(t.get("due_date"))
        completed_dt = _parse_date(t.get("updated_at"))
        if due_dt and completed_dt and completed_dt.date() <= due_dt.date():
            count += 1
 
    return {"user_id": user_id, "tasks_completed_on_time": count}