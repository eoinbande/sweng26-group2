from app.aicalls import aiGenerate, aiFeedback, aiExpand
import json

goal = "Help me learn Python"

print("\n--- GENERATE PLAN ---")
plan = aiGenerate(goal)
print(json.dumps(plan, indent=2))
print("Tokens:", plan["tokens_used"])
print("Carbon:", plan["carbon_footprint"])


print("\n--- FEEDBACK TEST ---")
feedback = aiFeedback("Make the tasks shorter", plan["tasks"])
print(json.dumps(feedback, indent=2))
print("Tokens:", feedback["tokens_used"])
print("Carbon:", feedback["carbon_footprint"])


print("\n--- EXPAND TEST ---")
expanded = aiExpand("Expand task 1", feedback["tasks"])
print(json.dumps(expanded, indent=2))
print("Tokens:", expanded["tokens_used"])
print("Carbon:", expanded["carbon_footprint"])

"""EXAMPLE OUTPUT
GENERATE PLAN:
--- GENERATE PLAN ---
{
  "description": "Learn Python from fundamentals to building small projects, with a simple routine and feedback loop.",   
  "goal_due_date": null,
  "tasks": [
    {
      "ai_id": "task_1",
      "id": null,
Tokens: 1933
Carbon: 0.0015463999999999999
      
FEEDBACK TEST:
   --- FEEDBACK TEST ---
{
  "tasks": [
    {
      "ai_id": "task_1",
      "id": null,
      "description": "Set up Python (install + editor) and choose a weekly study schedule.",
      "order": 1,
      "status": "in_progress",
      "due_date": null,
      "guidance": "Install Python 3, pick an editor (VS Code), and decide how many days/hours per week you can study.",     

TOKENS: 2315
Carbon_footprint: 0.001852


EXPAND TEST:
--- EXPAND TEST ---
{
  "task_ai_id": "task_1",
  "subtasks": [
    {
      "ai_id": "task_1a",
      "id": null,

Tokens: 1570
Carbon: 0.0012560000000000002
      
      """