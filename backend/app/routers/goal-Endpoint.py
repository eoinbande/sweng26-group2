from fastapi import APIRouter
from ..Tables import create_goal, get_all_goals #we import the functions related to goals
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

#USE POST HTTP REQUEST TO STORE DATA IN SUPABASE
@goal_router.post("/goals")
def write_goal(goal: RequestGoals):
    result = create_goal(
        user_id = goal.user_id,
        title = goal.title,
        description = goal.description,
        due_date = goal.due_date
    )
    return {"message": "Goal successfully created", "goal": result.data}




#USE GET HTTP REQUEST TO GET DATA FROM SUPABASE
@goal_router.get("/goals/{user_id}") #FETCH by user_id!
def get_goals(user_id: str):
    all_goals = get_all_goals(user_id)
    if not all_goals: #if user has no goals, no goals found for a specific user
        return {"goals": [], "message": "No goals assocciated with the user"}
    return {"goals": all_goals}

