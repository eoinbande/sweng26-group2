from app.aicalls import aiGenerate, aiFeedback, aiExpand
from app.database import supabase

#This file is centralized service layer which will call the AI functions
#routers will call the service, which calls the real AI!

class AIService:
    def generate_plan(self, user_input: str):
        return aiGenerate(user_input)

    def revise_plan(self, user_input: str, current_goals):
        return aiFeedback(user_input, current_goals)

    def expand_task(self, user_input: str, current_goals):
        return aiExpand(user_input, current_goals)


def log_ai_usage(user_id, endpoint_type, tokens_used, carbon_footprint):
    try:
        supabase.table("ai_usage_logs").insert({
            "user_id": user_id,
            "endpoint_type": endpoint_type,
            "tokens_used": tokens_used,
            "carbon_footprint": carbon_footprint
        }).execute()
        print(f"[GREEN LOG] Logged: user={user_id}, type={endpoint_type}, tokens={tokens_used}, carbon={carbon_footprint}")
    except Exception as e:
        print(f"[GREEN LOG ERROR] Failed to log: {e}")

"""Central place for error handling and logging"""