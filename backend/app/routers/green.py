from fastapi import APIRouter
from app.database import supabase

green_router = APIRouter()

@green_router.get("/green/stats/{user_id}")
def get_green_stats(user_id: str):
    response = supabase.table("ai_usage_logs").select("*").eq("user_id", user_id).execute()
    logs = response.data or []

    total_tokens = sum(log["tokens_used"] for log in logs)
    total_carbon = sum(log["carbon_footprint"] for log in logs)

    return {
        "total_ai_calls": len(logs),
        "total_tokens": total_tokens,
        "total_carbon": round(total_carbon, 6)
    }


@green_router.get("/green/goals/{user_id}")
def carbon_per_goal(user_id: str):

    response = supabase.table("ai_usage_logs")\
    .select("*")\
    .eq("user_id", user_id)\
    .execture()

    logs = response.data or []
    goals = {}

    for log in logs:
        goal_id = log["goal_id"]
        if goal_id not in goals:
            goals[goal_id] = {
                "ai_calls": 0,
                "tokens": 0,
                "carbon": 0
            }
        
        goals[goal_id]["ai_calls"] += 1
        goals[goal_id]["tokens"] += log["tokens_used"]
        goals[goal_id]["carbon"] += log["carbon_footprint"]

        return goals