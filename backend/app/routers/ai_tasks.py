from fastapi import APIRouter
from ..Tables import create_ai_task, get_ai_tasks
from pydantic import BaseModel

ai_task_router = APIRouter()

class RequestAiTasks(BaseModel):
    goal_id: str
    #title: str
    description: str
    due_date: str | None = None
    ai_generated: bool = True  # Default to True for AI tasks

@ai_task_router.post("/ai_tasks")
def generate_ai_task(task: RequestAiTasks):
    result = create_ai_task(
        goal_id=task.goal_id,
        #title=task.title,
        description=task.description,
        due_date=task.due_date,
        ai_generated=task.ai_generated 
    )
    return {
        "message": "AI task generated successfully",
        "task": result.data,
        "ai_generated": task.ai_generated
    }

@ai_task_router.get("/ai-tasks/{goal_id}")
def read_ai_tasks(goal_id: str):
    all_tasks = get_ai_tasks(goal_id)
    
    if not all_tasks:
        return {
            "tasks": [], 
            "message": "No AI tasks associated with this goal",  
        }
    
    return {
        "tasks": all_tasks,
        "message": f"Found {len(all_tasks)} AI-generated tasks"
    }