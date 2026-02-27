from app.services.ai_service import AIService

ai = AIService()

# Test AI generation
plan = ai.generate_plan("Learn Python in 30 days")
print("AI plan:", plan)

# Test AI feedback
feedback_plan = ai.revise_plan(
    user_input="Make the tasks shorter and more daily",
    current_goals =plan.get("tasks", [])
)
print("Updated plan:", feedback_plan)
