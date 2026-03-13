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