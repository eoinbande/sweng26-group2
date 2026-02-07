from fastapi import APIRouter
from ..Tables import create_goal, create_goal_with_data, get_all_goals #we import the functions related to goals
from ..Mocked.mock_response_templates import get_initial_goal_breakdown  
from pydantic import BaseModel


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
@goal_router.post("/goals")
def write_goal(goal: RequestGoals):
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


#USE GET HTTP REQUEST TO GET DATA FROM SUPABASE
@goal_router.get("/goals/{user_id}") #FETCH by user_id!
def get_goals(user_id: str):
    all_goals = get_all_goals(user_id)
    if not all_goals: #if user has no goals, no goals found for a specific user
        return {"goals": [], "message": "No goals assocciated with the user"}
    return {"goals": all_goals}

