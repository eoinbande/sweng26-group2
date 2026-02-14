from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
# Database functions (Tables.py)
from ..Tables import (
    create_goal, get_all_goals, get_goal, delete_goal,
    update_goal_data, save_tasks_to_db, merge_and_save_tasks
)

# Mock AI responses (replace with real AI later)
from ..mock_ai_responses import get_mock_plan, get_mock_feedback_response



#CREATION of GOAL(when you create an arbitrary goal) endpoint
#USE GET(FrontEnd will send a request to GET data from Supabase)
#USE POsT(FrontEnd will send a request to POST data to Supabase)


goal_router = APIRouter()

# =============================================================================
# REQUEST MODELS
# =============================================================================

class CreateGoalRequest(BaseModel):
    """
    What frontend sends when user types a goal and hits submit.
    
    Example: {"user_id": "uuid-123", "title": "Fix my bike tyre"}
    """
    user_id: str
    title: str


class AcceptPlanRequest(BaseModel):
    """
    What frontend sends when user clicks "Accept" on the review screen.
    Contains the task list (which may have been modified by feedback).
    
    Example: {"tasks": [{ai_id: "task_1", description: "...", ...}]}
    """
    tasks: list[dict]


class FeedbackRequest(BaseModel):
    """
    What frontend sends when user gives feedback on a plan.
    
    Example: {"feedback": "I don't like task_3, use soapy water instead"}
    """
    feedback: str



# =============================================================================
# ENDPOINTS
# =============================================================================

# ---- Step 1: Create a goal and get AI-generated plan preview ----

#USE POST HTTP REQUEST TO STORE DATA IN SUPABASE
@goal_router.post("/goals")
def create_goal_endpoint(goal: CreateGoalRequest):
    """
    Create a new goal and return an AI-generated plan preview.
    
    FLOW:
    1. Save the goal to DB (with empty task list)
    2. Get AI-generated tasks from mock (later: real AI)
    3. Return the plan to frontend for review
    
    The tasks are NOT saved to DB yet — that happens when user clicks Accept.
    
    Frontend should show the returned tasks on a review/preview screen.
    """
    # Create the goal in the database (empty task list for now)
    result = create_goal(
        user_id=goal.user_id,
        title=goal.title
    )

    # Extract the goal ID from the database response
    if hasattr(result, "data") and result.data:
        goal_data = result.data[0]
    else:
        raise HTTPException(status_code=500, detail="Failed to create goal")

    goal_id = goal_data["id"]

    # Get AI-generated plan from mock templates
    # TODO: Replace with real AI call when AI integration is ready
    ai_plan = get_mock_plan(goal.title)

    # Save description and due date from AI plan to goal_data
    update_goal_data(goal_id, {
        "tasks": [],
        "description": ai_plan.get("description", ""),
        "goal_due_date": ai_plan.get("goal_due_date", "")
    })

    return {
        "message": "Goal created — review your plan below",
        "goal_id": goal_id,
        "title": goal.title,
        "description": ai_plan.get("description", ""),
        "goal_due_date": ai_plan.get("goal_due_date", ""),
        "tasks": ai_plan["tasks"],   # Tasks for frontend to display on review screen
        "saved_to_db": False          # Frontend knows this isn't saved yet
    }


# ---- Step 2: User gives feedback on the plan (optional, can loop) ----

@goal_router.post("/goals/{goal_id}/feedback")
def feedback_on_plan(goal_id: str, request: FeedbackRequest):
    """
    User gives feedback on the plan before accepting.
    Returns an updated task list based on the feedback.
    
    FLOW:
    1. Check if goal exists
    2. Send feedback to AI (or return mock feedback response)
    3. Return updated plan — still NOT saved to DB
    
    User can call this multiple times until they're happy with the plan.
    
    NOTE: This also works AFTER the goal is active (user has progress).
    In that case, use the /goals/{goal_id}/accept endpoint after to save,
    which will preserve completed tasks via ai_id matching.
    """
    # Verify the goal exists
    try:
        goal = get_goal(goal_id)
    except Exception:
        raise HTTPException(status_code=404, detail="Goal not found")

    # Get AI feedback response from mock
    # TODO: Replace with real AI call that takes current plan + feedback text
    # For now, we just return a pre-made feedback response based on the title
    updated_plan = get_mock_feedback_response(goal["title"])

    return {
        "message": "Plan updated based on your feedback",
        "goal_id": goal_id,
        "tasks": updated_plan["tasks"],
        "feedback_received": request.feedback,
        "saved_to_db": False
    }


# ---- Step 3: User accepts the plan → save to database ----

@goal_router.post("/goals/{goal_id}/accept")
def accept_plan(goal_id: str, request: AcceptPlanRequest):
    """
    User clicks "Accept" — save the task plan to the database.
    
    FLOW:
    1. Check if goal already has tasks (feedback on active goal vs first save)
    2. If first save → save_tasks_to_db (generates UUIDs)
    3. If goal already has tasks → merge_and_save_tasks (preserves completed work)
    4. Return the final task list with both ai_ids and UUIDs
    
    After this, frontend can use the task UUIDs for all interactions.
    """
    # Verify the goal exists
    try:
        goal = get_goal(goal_id)
    except Exception:
        raise HTTPException(status_code=404, detail="Goal not found")

    # Check if goal already has saved tasks (i.e., this is a re-accept after feedback)
    import json
    current_data = goal.get("goal_data", {})
    if isinstance(current_data, str):
        current_data = json.loads(current_data)
    current_tasks = current_data.get("tasks", [])

    if current_tasks and any(t.get("id") for t in current_tasks):
        # Goal already has tasks with UUIDs → merge to preserve completed work
        saved_tasks = merge_and_save_tasks(goal_id, request.tasks)
    else:
        # First save → generate UUIDs and save everything
        saved_tasks = save_tasks_to_db(goal_id, request.tasks)

    return {
        "message": "Plan accepted and saved!",
        "goal_id": goal_id,
        "tasks": saved_tasks,
        "saved_to_db": True
    }



# ---- Get all goals for a user ----

@goal_router.get("/goals/{user_id}")
def get_goals(user_id: str):
    """
    Get all goals for a user.
    
    Each goal includes its goal_data JSONB which contains
    the full nested task list (tasks + subtasks with both IDs).
    
    Called when: User opens their dashboard/goals screen.
    """
    all_goals = get_all_goals(user_id)
    if not all_goals:
        return {"goals": [], "message": "No goals associated with the user"}
    return {"goals": all_goals}


# ---- Get a single goal with full task data ----

@goal_router.get("/goal-details/{goal_id}")
def get_goal_details(goal_id: str):
    """
    Get full details of a single goal, including all tasks and subtasks.
    
    The task data comes from the goal_data JSONB column —
    one query gets everything frontend needs.
    
    Called when: User taps on a goal to see its tasks.
    """
    try:
        goal = get_goal(goal_id)
    except Exception:
        raise HTTPException(status_code=404, detail="Goal not found")

    import json
    goal_data = goal.get("goal_data", {})
    if isinstance(goal_data, str):
        try:
            goal_data = json.loads(goal_data)
        except json.JSONDecodeError:
            goal_data = {}
            
    # Ensure goal['goal_data'] is the parsed dict for the frontend
    goal['goal_data'] = goal_data

    tasks = goal_data.get("tasks", [])

    return {
        "goal": goal,
        "tasks": tasks,
        "has_tasks": len(tasks) > 0
    }


# ---- Delete a goal ----

@goal_router.delete("/goals/{goal_id}")
def delete_goal_endpoint(goal_id: str):
    """
    Delete a goal and all its tasks.
    Tasks are deleted automatically via ON DELETE CASCADE in the database.
    """
    try:
        delete_goal(goal_id)
        return {"message": "Goal deleted successfully", "goal_id": goal_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting goal: {str(e)}")




    
"""@goal_router.delete("/goals/{user_id}/{goal_id}")
def delete_goal(user_id: str, goal_id: str):
    
    Delete a goal by its goal_id.
    
    try:
        # Find the goal
        all_goals = get_all_goals(user_id)
        db_id = None
        
        for goal_record in all_goals:
            if goal_record.get("goal_data", {}).get("goal_id") == goal_id:
                db_id = goal_record.get("id")
                break
        
        if not db_id:
            raise HTTPException(
                status_code=404,
                detail=f"Goal {goal_id} not found for user {user_id}"
            )
        
        # Delete from database
        supabase.table("goals").delete().eq("id", db_id).execute()
        
        return {
            "status": "success",
            "message": f"Goal {goal_id} deleted successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error deleting goal: {str(e)}"
        )
        """ 
