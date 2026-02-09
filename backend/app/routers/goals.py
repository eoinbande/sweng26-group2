from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from ..Tables import create_goal, create_goal_with_data, get_all_goals #we import the functions related to goals
from ..database import supabase
from ..Mocked.mock_response_templates import get_initial_goal_breakdown  



#CREATION of GOAL(when you create an arbitrary goal) endpoint
#USE GET(FrontEnd will send a request to GET data from Supabase)
#USE POsT(FrontEnd will send a request to POST data to Supabase)


goal_router = APIRouter()

class RequestGoals(BaseModel):
    user_id: str
    title: str
    description: str
    due_date: str | None = None #either a due_date OR NOT
    generate_plan: bool = True  # NEW: Flag to generate AI plan

#USE POST HTTP REQUEST TO STORE DATA IN SUPABASE
@goal_router.post("/goals")
def write_goal(goal: RequestGoals):
    """
    Create a goal with optional AI-generated task breakdown.
    
    If generate_plan=True, AI will create a task breakdown.
    If generate_plan=False, creates a simple goal without tasks.
    
    Request:
    {
        "user_id": "user_123",
        "title": "fix my bike tire",
        "description": "Need to fix flat tire",
        "due_date": "2026-02-15",
        "generate_plan": true
    }
    """

    # If user wants AI-generated plan
    if goal.generate_plan:
        # Get AI-generated plan from mock templates
        ai_plan = get_initial_goal_breakdown(goal.title)
        
        if ai_plan:
            # Create goal_data structure
            goal_data = {
                "user_id": goal.user_id,
                "title": goal.title,
                "description": goal.description,
                "goal_type": ai_plan["goal_type"],
                "nodes": ai_plan["nodes"],
                "edges": ai_plan["edges"]
            }
            
            # Add due_date if provided
            if goal.due_date:
                goal_data["due_date"] = goal.due_date
            
            # Use new function to store with goal_data
            result = create_goal_with_data( 
                user_id=goal.user_id,
                title=goal.title,
                goal_data=goal_data
            )
            
            return {
                "message": "Goal with AI-generated plan created successfully",
                "goal": result.data,
                "ai_generated": True,
                "goal_type": ai_plan["goal_type"],
                "task_count": len(ai_plan["nodes"]),
                "goal data": goal_data
            }
    
    # Fallback: Original manual goal creation
    result = create_goal(
        user_id=goal.user_id,
        title=goal.title,
        description=goal.description,
        due_date=goal.due_date
    )
    return {"message": "Goal successfully created", "goal": result.data}


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
    
@goal_router.delete("/goals/{user_id}/{goal_id}")
def delete_goal(user_id: str, goal_id: str):
    """
    Delete a goal by its goal_id.
    """
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