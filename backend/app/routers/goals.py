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


#USE POST HTTP REQUEST TO STORE DATA IN SUPABASE
@goal_router.post("/goals")
def write_goal(goal: RequestGoals):
    """
    Create a goal with optional AI-generated task breakdown.
    
    If generate_plan=True, AI will create a task breakdown.
    If generate_plan=False, creates a simple goal without tasks.
    """

    # If user wants AI-generated plan
    if goal.generate_plan:
        # Get AI-generated plan from mock templates
        ai_plan = get_initial_goal_breakdown(goal.title)
        
        if ai_plan:
            #  **Convert Pydantic models to dictionaries for JSON storage
            goal_data = {
                "user_id": goal.user_id,
                "title": goal.title,
                "description": goal.description,
                "goal_type": ai_plan["goal_type"],
                "nodes": [node.model_dump() for node in ai_plan["nodes"]],  
                "edges": [edge.model_dump() for edge in ai_plan["edges"]]   
            }
            
            # Add due_date if provided
            if goal.due_date:
                goal_data["due_date"] = goal.due_date
            
            # Use new function to store with goal_data
            result = create_goal_with_data( 
                user_id=goal.user_id,
                title=goal.title,
                goal_data=goal_data,
                description=ai_plan.get("description", goal.description)
            )
            
            return {
                "message": "Goal with AI-generated plan created successfully",
                "goal": result.data,
                "ai_generated": True,
                "goal_type": ai_plan["goal_type"],
                "task_count": len(ai_plan["nodes"])
            }
    
    # Fallback: Original manual goal creation
    result = create_goal(
        user_id=goal.user_id,
        title=goal.title,
        description=goal.description,
        due_date=goal.due_date
    )
    return {"message": "Goal successfully created", "goal": result.data}

# PREVIEW endpoint - returns AI plan WITHOUT saving to DB
@goal_router.post("/goals/preview")
def preview_goal(goal: RequestGoals):
    """
    Get an AI-generated task breakdown without saving anything.
    The goal is only saved when the user clicks Accept on the review page.
    """
    if goal.generate_plan:
        ai_plan = get_initial_goal_breakdown(goal.title)

        if ai_plan:
            goal_data = {
                "user_id": goal.user_id,
                "title": goal.title,
                "description": ai_plan.get("description", goal.description),
                "goal_type": ai_plan["goal_type"],
                "nodes": [node.model_dump() for node in ai_plan["nodes"]],
                "edges": [edge.model_dump() for edge in ai_plan["edges"]]
            }

            if goal.due_date:
                goal_data["due_date"] = goal.due_date

            return {
                "message": "AI plan generated (not saved yet)",
                "goal_data": goal_data,
                "ai_generated": True,
                "goal_type": ai_plan["goal_type"],
                "task_count": len(ai_plan["nodes"])
            }

    return {
        "message": "No AI plan available for this goal",
        "ai_generated": False
    }

#USE GET HTTP REQUEST TO GET DATA FROM SUPABASE
@goal_router.get("/goals/{user_id}") #FETCH by user_id!
def get_goals(user_id: str):
    all_goals = get_all_goals(user_id)
    if not all_goals: #if user has no goals, no goals found for a specific user
        return {"goals": [], "message": "No goals assocciated with the user"}
    return {"goals": all_goals}

# NEW endpoint to get goal details with full graph structure
@goal_router.get("/goal-details/{goal_id}")
def get_goal_details(goal_id: str):
    """Get full goal data including nodes and edges (goal_data JSON)"""
    from app.database import supabase
    
    result = supabase.table("goals").select("*").eq("id", goal_id).execute()
    
    if not result.data:
        return {"error": "Goal not found"}
    
    goal = result.data[0]
    
    # Check if goal has goal_data field
    if "goal_data" in goal and goal["goal_data"]:
        return {
            "goal": goal,
            "has_ai_plan": True,
            "goal_data": goal["goal_data"]
        }
    else:
        return {
            "goal": goal,
            "has_ai_plan": False,
            "message": "This goal doesn't have an AI-generated plan"
        }
    
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
