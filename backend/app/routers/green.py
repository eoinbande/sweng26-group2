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

#GET function to get green metrics by GOAL
@green_router.get("/green/goals/{user_id}")
def carbon_per_goal(user_id: str):

    response = supabase.table("ai_usage_logs")\
    .select("*")\
    .eq("user_id", user_id)\
    .execute()

    logs = response.data or []
    goals = {}

    for log in logs:
        goal_id = log["goal_id"]
        if goal_id not in goals:
            goals[goal_id] = {
                "ai_calls": 0,
                "tokens_used": 0,
                "carbon_footprint": 0
            }
        
        goals[goal_id]["ai_calls"] += 1
        goals[goal_id]["tokens_used"] += log["tokens_used"]
        goals[goal_id]["carbon_footprint"] += log["carbon_footprint"]

    #when getting the sum, round the carbon values
    for goal in goals:
        goals[goal]["carbon_footprint"] = round(goals[goal]["carbon_footprint"], 6)

        
    return goals
    

#GET function to get green stats by month
@green_router.get("/green/stats/monthly/{user_id}")
def get_monthly_green_stats(user_id: str):

    response = supabase.table("ai_usage_logs")\
    .select("*")\
    .eq("user_id", user_id)\
    .execute()

    logs = response.data or []
    monthly_stats = {}

    for log in logs:
        month = str(log["timestamp"])[:7] #take the first 7 characters, supabase format YYYY-MM
        if month not in monthly_stats:
            monthly_stats[month] = {
                "ai_calls": 0,
                "tokens_used": 0,
                "carbon_footprint": 0
            }

        monthly_stats[month]["ai_calls"] += 1
        monthly_stats[month]["tokens_used"] += log["tokens_used"]
        monthly_stats[month]["carbon_footprint"] += log["carbon_footprint"]

    #when getting the sum, round carbon values
    for month in monthly_stats:
        monthly_stats[month]["carbon_footprint"] = round(
            monthly_stats[month]["carbon_footprint"], 6
        )

    return monthly_stats