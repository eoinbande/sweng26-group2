from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.services.ai_service import AIService

# Database functions (Tables.py)
from ..Tables import (
    get_tasks_for_goal, get_task, update_task_status,
    add_subtasks_to_task, get_completed_task_count, get_total_task_count
)

# Mock AI responses for expand/stuck feature
from ..mock_ai_responses import BIKE_EXPAND_TASK_5


#CREATION of TASK(when you create an arbitrary goal) endpoint
#USE GET(FrontEnd will send a request to GET data from Supabase)
#USE POsT(FrontEnd will send a request to POST data to Supabase)


task_router = APIRouter()
ai_service = AIService()

# =============================================================================
# REQUEST MODELS
# =============================================================================

class UpdateStatusRequest(BaseModel):
    """
    What frontend sends when user ticks a task as done or changes status.
    
    Example: {"status": "completed"}
    """
    status: str  # "not_started", "in_progress", or "completed"


class ExpandTaskRequest(BaseModel):
    """
    What frontend sends when user clicks "expand" or "I'm stuck" on a task.
    
    Example: {"stuck_reason": "I don't have the right tools"}
    """
    stuck_reason: Optional[str] = None


# =============================================================================
# ENDPOINTS
# =============================================================================

# ---- Get all tasks for a goal (from tasks table, flat rows) ----

@task_router.get("/tasks/{goal_id}")
def get_tasks(goal_id: str):
    """
    Get all task rows for a goal from the tasks table.
    
    Returns flat rows — subtasks are separate rows with parent_id set.
    For the nested structure, use GET /goal-details/{goal_id} instead
    (which reads from goal_data JSONB).
    
    Called when: Backend needs flat task data (e.g., for admin views).
    Frontend should prefer /goal-details/{goal_id} for the nested view.
    """
    all_tasks = get_tasks_for_goal(goal_id)
    if not all_tasks:
        return {"tasks": [], "message": "No tasks associated with this goal"}
    return {
        "tasks": all_tasks,
        "count": len(all_tasks)
    }


# ---- Update a task's status (complete, in-progress, etc.) ----

@task_router.patch("/tasks/{task_id}/status")
def modify_task_status(task_id: str, request: UpdateStatusRequest):
    """
    Update a task or subtask's status.
    
    This updates BOTH:
    1. The task row in the tasks table
    2. The task inside the goal_data JSONB blob
    
    Frontend sends the task's UUID (not ai_id).
    
    Called when: User ticks a checkbox, marks a task in progress, etc.
    
    Valid statuses: "not_started", "in_progress", "completed"
    """
    # Validate status value
    valid_statuses = ["not_started", "in_progress", "completed"]
    if request.status not in valid_statuses:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status '{request.status}'. Must be one of: {valid_statuses}"
        )

    # Update the task in both places (tasks table + goal_data JSONB)
    result = update_task_status(task_id=task_id, status=request.status)

    if not result:
        raise HTTPException(status_code=404, detail="Task not found")

    return {
        "message": "Task status updated successfully!",
        "task_id": task_id,
        "new_status": request.status
    }


# ---- Expand a task into subtasks (I'm stuck / break it down) ----

@task_router.post("/tasks/{task_id}/expand")
def expand_task(task_id: str, request: ExpandTaskRequest):
    """
    Expand a task into smaller subtasks.
    
    Used when user finds a task too challenging and wants it broken down.
    Calls AI (or mock) to generate subtasks, then saves them to the database.
    
    FLOW:
    1. Look up the task by UUID to get its ai_id and goal_id
    2. Get subtasks from AI/mock based on the ai_id
    3. Save subtasks to both tasks table and goal_data JSONB
    4. Return the new subtasks (with UUIDs assigned)
    
    Called when: User clicks "I'm stuck" or "Expand" on a task.
    """
    # Look up the task to get its ai_id and goal_id
    task = get_task(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    goal_id = task["goal_id"]
    ai_id = task.get("ai_id")

    # Check if task already has subtasks
    existing_subtasks = get_tasks_for_goal(goal_id)
    has_subtasks = any(t.get("parent_id") == task_id for t in existing_subtasks)
    if has_subtasks:
        raise HTTPException(
            status_code=400,
            detail="Task already has subtasks. Cannot expand again."
        )

    # Get subtasks from AI/mock
    # TODO: Replace with real AI call that takes the task description + stuck_reason
    # For now, we only have a mock for task_5 (bike tyre: reassemble wheel)
    # mock_expansions = {
    #     "task_5": BIKE_EXPAND_TASK_5["subtasks"] <- used for mock
    # }

    #---------------------Real AI integration---------------------
    # subtask_data = mock_expansions.get(ai_id) <- used for mock
    try:
        ai_response = ai_service.aiExpand(
            userInput = request.stuck_reason or task["description"] #if not given stuck reason
            currentGoals = []
        )
    
    except Exception as e:
        raise HTTPException(status_code = 503, detail = "AI service unavailable")

    if "subtasks" not in ai_response:
        raise HTTPException(status_code = 500, detail = "AI response error")
    
    subtask_data = ai_response["subtasks"]

    if not isinstance(subtask_data, list):
        raise HTTPException(status_code = 500, detail = "AI subtasks invalid format")

    #add another constraint for green computing?

    for substask in subtask_data:
        if "title" not in subtask or "ai_id" not in subtask:
            


    if not subtask_data:
        # No mock available — return a generic "break it down" response
        # In production, AI would always generate something
        raise HTTPException(
            status_code=404,
            detail=f"No expansion available for task '{ai_id}' (mock limitation). "
                   f"Real AI will handle any task."
        )

    # Save subtasks to the database (assigns UUIDs, updates both tables)
    saved_subtasks = add_subtasks_to_task(
        goal_id=goal_id,
        parent_task_id=task_id,
        subtasks=subtask_data
    )

    return {
        "message": "Task expanded into subtasks",
        "task_id": task_id,
        "task_ai_id": ai_id,
        "subtasks": saved_subtasks,
        "stuck_reason": request.stuck_reason
    }


# ---- Get progress for a goal ----

@task_router.get("/tasks/{goal_id}/progress")
def get_progress(goal_id: str):
    """
    Get completion progress for a goal.
    
    Returns completed count and total count (tasks + subtasks).
    Frontend can use this for progress bars, "3/7 done", etc.
    
    Called when: Showing goal progress on dashboard or goal detail screen.
    """
    completed = get_completed_task_count(goal_id)
    total = get_total_task_count(goal_id)

    return {
        "goal_id": goal_id,
        "completed": completed,
        "total": total,
        "percentage": round((completed / total) * 100) if total > 0 else 0
    }


