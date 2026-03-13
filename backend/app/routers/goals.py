from fastapi import APIRouter, HTTPException
from enum import Enum
from pydantic import BaseModel, Field
from typing import Optional
import json
from app.services.ai_service import AIService
from app.services.ai_service import log_ai_usage
# Database functions (Tables.py)
from ..Tables import (
    create_goal, get_all_goals, get_goal, delete_goal,
    update_goal_data, save_tasks_to_db, merge_and_save_tasks,
    get_tasks_for_goal, get_categories, create_category
)
from ..database import supabase

# Mock AI responses (replace with real AI later)
from ..mock_ai_responses import get_mock_plan, get_mock_feedback_response



#CREATION of GOAL(when you create an arbitrary goal) endpoint
#USE GET(FrontEnd will send a request to GET data from Supabase)
#USE POsT(FrontEnd will send a request to POST data to Supabase)


goal_router = APIRouter()
ai_service = AIService()

# =============================================================================
# REQUEST MODELS
# =============================================================================

class CreateGoalRequest(BaseModel):
    """
    What frontend sends when user types a goal and hits submit.
    
    Example: {"user_id": "uuid-123", "title": "Fix my bike tyre"}
    """
    user_id: str
    title: str = Field(min_length=1) # won't allow goals to be created with empty titles
    category: Optional[str] = None  # accepts predefined or custom categories

class AcceptPlanRequest(BaseModel):
    """
    What frontend sends when user clicks "Accept" on the review screen.
    Contains the task list (which may have been modified by feedback).
    
    Example: {"tasks": [{ai_id: "task_1", description: "...", ...}]}
    """
    tasks: list[dict]
    due_date: str | None = None  # Optional due date in YYYY-MM-DD format


class FeedbackRequest(BaseModel):
    """
    What frontend sends when user gives feedback on a plan.

    current_tasks: The tasks currently visible to the user. If provided, used as
    AI context instead of fetching from DB — critical for multi-round feedback
    on the preview page where intermediate revisions aren't saved yet.

    Example: {"feedback": "I don't like task_3, use soapy water instead"}
    """
    feedback: str
    current_tasks: Optional[list] = None


class UpdateCategoryRequest(BaseModel):
    """
    What frontend sends when updating a goal's category.
    
    Example: {"category": "Health"}
    """
    category: str


class CreateCategoryRequest(BaseModel):
    """
    What frontend sends when creating a new custom category.
    
    Example: {"user_id": "uuid-123", "name": "Fitness"}
    """
    user_id: str
    name: str = Field(min_length=1)


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
        title=goal.title,
        category=goal.category
    )

    # Extract the goal ID from the database response
    if hasattr(result, "data") and result.data:
        goal_data = result.data[0]
    else:
        raise HTTPException(status_code=500, detail="Failed to create goal")

    goal_id = goal_data["id"]

    # Get AI-generated plan from mock templates
    # TODO: Replace with real AI call when AI integration is ready
    #ai_plan = get_mock_plan(goal.title) <- we used this for mocking

    #----------------------Real AI integration(the following block of code calls the AI to generate the goal!)--------------
    try:
        ai_plan = ai_service.generate_plan(goal.title)

        #LOG AI usage for green metrics
        log_ai_usage(
            user_id = goal.user_id,
            endpoint_type = "generate_plan",
            tokens_used = ai_plan.get("tokens_used", 0),
            carbon_footprint = ai_plan.get("carbon_footprint", 0)
        )
    except Exception as e:
        raise HTTPException(status_code = 500, detail = f"AI generation failed: {str(e)}")

    #exception related to AI service returns a malformed output
    if "tasks" not in ai_plan:
        raise HTTPException(status_code = 500, detail = "AI response error")


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
        "category": goal.category,
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
    #updated_plan = get_mock_feedback_response(goal["title"], request.feedback) <- we use this for mocking

    #------------------------Real AI integration-----------------

    # Use tasks sent by the frontend if provided (covers multi-round feedback on preview,
    # where intermediate revisions are not yet saved to DB). Fall back to DB state otherwise.
    if request.current_tasks is not None:
        current_tasks = request.current_tasks
    else:
        current_data = goal.get("goal_data", {})
        if isinstance(current_data, str):
            current_data = json.loads(current_data)
        current_tasks = current_data.get("tasks", [])

    #call real AI service to update plan based on the feedback
    try:
        updated_plan = ai_service.revise_plan(
            user_input = request.feedback,
            current_goals = current_tasks
        )

        #LOG AI usage for green metrics
        log_ai_usage(
            user_id = goal.user_id,
            endpoint_type = "generate_plan",
            tokens_used = updated_plan.get("tokens_used", 0),
            carbon_footprint = updated_plan.get("carbon_footprint", 0)
        )
    except Exception as e:
        raise HTTPException(status_code = 500, detail = f"AI feedback failed: {str(e)}")

    #exception related to the AI service outputting an error
    if "tasks" not in updated_plan:
        raise HTTPException(status_code = 500, detail = "AI response error")

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

    # save tasks and capture returned tasks (with UUIDs)
    if current_tasks and any(t.get("id") for t in current_tasks):
        # Goal already has tasks with UUIDs → merge to preserve completed work
        saved_tasks = merge_and_save_tasks(goal_id, request.tasks)
    else:
        # First save → generate UUIDs and save everything
        saved_tasks = save_tasks_to_db(goal_id, request.tasks)

    current_data["tasks"] = saved_tasks

    # If the user sends "AI_DECIDE", we keep the date originally generated by AI
    if request.due_date == "AI_DECIDE":
        final_due_date = current_data.get("goal_due_date", "")
    else:
        current_data["goal_due_date"] = request.due_date
        final_due_date = request.due_date

    # update call
    update_goal_data(goal_id, current_data)

    return {
        "message": "Plan accepted and saved!",
        "goal_id": goal_id,
        "tasks": saved_tasks,
        "due_date": final_due_date,
        "saved_to_db": True
    }


# ---- Get all goals for a user ----

@goal_router.get("/goals/{user_id}")
def get_goals(user_id: str):
    """
    Get all goals for a user.
    
    Each goal includes its goal_data JSONB which contains
    the full nested task list (tasks + subtasks with both IDs).
    Only returns goals that have tasks saved (i.e., user has accepted the plan)!
    
    Called when: User opens their dashboard/goals screen.
    """
    all_goals = get_all_goals(user_id)
    if not all_goals:
        return {"goals": [], "message": "No goals associated with the user"}
    
    # Filter out goals that haven't been accepted yet (empty task list)
    import json
    accepted_goals = []
    for goal in all_goals:
        goal_data = goal.get("goal_data", {})
        if isinstance(goal_data, str):
            goal_data = json.loads(goal_data)
        if goal_data.get("tasks"):
            accepted_goals.append(goal)

    if not accepted_goals:
        return {"goals": [], "message": "No goals associated with the user"}

    return {"goals": accepted_goals}


# ---- Get a single goal with full task data ----

@goal_router.get("/goal-details/{goal_id}")
def get_goal_details(goal_id: str):
    """
    Get full details of a single goal, including all tasks and subtasks.
    
    The task data comes from the goal_data JSONB column, BUT we patch
    the status field from the 'tasks' table.
    
    Why?
    The 'tasks' table is the Single Source of Truth for status and handles
    concurrent updates (row-level locking) much better than the JSONB blob.
    
    The JSONB blob is liable to race conditions if the user clicks check/uncheck
    rapidly. By reading status from the tasks table, we ensure the UI
    always shows the correct state upon reload.
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

    tasks_from_json = goal_data.get("tasks", [])

    # fixed for frontend: Sync status from tasks table
    try:
        # Fetch current reliable states from DB
        db_tasks = get_tasks_for_goal(goal_id)
        if db_tasks is not None:
            # Create map: task_id -> status
            status_map = {t['id']: t['status'] for t in db_tasks}
            
            # Update the JSON structure with the reliable status
            for task in tasks_from_json:
                # Update parent
                if task.get("id") in status_map:
                    task["status"] = status_map[task["id"]]
                
                # Update subtasks
                for sub in task.get("subtasks", []):
                    if sub.get("id") in status_map:
                        sub["status"] = status_map[sub["id"]]
                    
    except Exception as e:
        print(f"Warning: Failed to sync tasks from DB: {e}")
        # If DB sync fails, we just fall back to whatever is in the JSON
        pass

    return {
        "goal": goal,
        "tasks": tasks_from_json,
        "has_tasks": len(tasks_from_json) > 0
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
