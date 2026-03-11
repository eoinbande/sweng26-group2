from fastapi import APIRouter, HTTPException
from datetime import datetime, timedelta
import json

from ..Tables import get_all_goals

schedule_router = APIRouter()


# =============================================================================
# HELPER: Extract tasks with due dates from a user's goals
# =============================================================================

def _get_all_tasks_with_dates(user_id: str) -> list[dict]:
    """
    Pull every task and subtask that has a due_date from a user's goals.
    
    Walks through goal_data JSONB for each goal, extracts tasks/subtasks,
    and attaches goal metadata (goal_id, goal_title) to each one.
    
    Returns a flat list of task dicts sorted by due_date.
    """
    all_goals = get_all_goals(user_id)
    if not all_goals:
        return []

    tasks_with_dates = []

    for goal in all_goals:
        goal_id = goal.get("id")
        goal_title = goal.get("title", "")
        goal_data = goal.get("goal_data", {})
        if isinstance(goal_data, str):
            goal_data = json.loads(goal_data)

        for task in goal_data.get("tasks", []):
            if task.get("due_date"):
                tasks_with_dates.append({
                    "goal_id": goal_id,
                    "goal_title": goal_title,
                    "task_id": task.get("id"),
                    "ai_id": task.get("ai_id"),
                    "description": task.get("description"),
                    "due_date": task.get("due_date"),
                    "status": task.get("status", "not_started"),
                    "order": task.get("order"),
                    #"is_subtask": False,
                    #"parent_ai_id": None
                })

            """# Also grab subtasks with due dates
            for sub in task.get("subtasks", []):
                if sub.get("due_date"):
                    tasks_with_dates.append({
                        "goal_id": goal_id,
                        "goal_title": goal_title,
                        "task_id": sub.get("id"),
                        "ai_id": sub.get("ai_id"),
                        "description": sub.get("description"),
                        "due_date": sub.get("due_date"),
                        "status": sub.get("status", "not_started"),
                        "order": sub.get("order"),
                        "is_subtask": True,
                        "parent_ai_id": task.get("ai_id")
                    })
            """

    # Sort by due_date
    tasks_with_dates = [t for t in tasks_with_dates if t["status"] != "completed"]
    tasks_with_dates.sort(key=lambda t: t["due_date"])
    return tasks_with_dates


# =============================================================================
# ENDPOINTS
# =============================================================================

@schedule_router.get("/schedule/{user_id}/date")
def get_tasks_for_date(user_id: str, date: str):
    """
    Get all tasks due on a specific date.
    
    Query param: date in YYYY-MM-DD format
    Example: GET /schedule/user123/date?date=2026-03-01
    """
    # Validate the date format
    try:
        datetime.strptime(date, "%Y-%m-%d")
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD.")

    all_tasks = _get_all_tasks_with_dates(user_id)
    tasks_on_date = [t for t in all_tasks if t["due_date"] == date]

    return {
        "date": date,
        "tasks": tasks_on_date,
        "count": len(tasks_on_date)
    }


@schedule_router.get("/schedule/{user_id}/upcoming-tasks")
def get_upcoming_tasks(user_id: str, days: int = 15):
    """
    Get all tasks due within the next N days (default 15).
    
    Example: GET /schedule/user123/upcoming-tasks
    Example: GET /schedule/user123/upcoming-tasks?days=7
    """
    today = datetime.utcnow().strftime("%Y-%m-%d")
    end_date = (datetime.utcnow() + timedelta(days=days)).strftime("%Y-%m-%d")

    all_tasks = _get_all_tasks_with_dates(user_id)
    upcoming = [t for t in all_tasks if today <= t["due_date"] <= end_date]

    return {
        "from": today,
        "to": end_date,
        "days": days,
        "tasks": upcoming,
        "count": len(upcoming)
    }


@schedule_router.get("/schedule/{user_id}/upcoming-goals")
def get_upcoming_goals(user_id: str, days: int = 30):
    """
    Get all goals with a goal_due_date within the next N days (default 30).
    
    Example: GET /schedule/user123/upcoming-goals
    Example: GET /schedule/user123/upcoming-goals?days=60
    """
    today = datetime.utcnow().strftime("%Y-%m-%d")
    end_date = (datetime.utcnow() + timedelta(days=days)).strftime("%Y-%m-%d")

    all_goals = get_all_goals(user_id)
    if not all_goals:
        return {"from": today, "to": end_date, "days": days, "goals": [], "count": 0}

    upcoming_goals = []
    for goal in all_goals:
        goal_data = goal.get("goal_data", {})
        if isinstance(goal_data, str):
            goal_data = json.loads(goal_data)

        goal_due_date = goal_data.get("goal_due_date", "")
        if goal_due_date and today <= goal_due_date <= end_date:
            upcoming_goals.append({
                "goal_id": goal.get("id"),
                "title": goal.get("title"),
                "category": goal.get("category"),
                "goal_due_date": goal_due_date,
                "description": goal_data.get("description", ""),
                "task_count": len(goal_data.get("tasks", []))
            })

    # Sort by due date
    upcoming_goals.sort(key=lambda g: g["goal_due_date"])

    return {
        "from": today,
        "to": end_date,
        "days": days,
        "goals": upcoming_goals,
        "count": len(upcoming_goals)
    }