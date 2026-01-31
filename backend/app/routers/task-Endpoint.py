from fastapi import APIRouter
from ..Tables import create_task, get_tasks #we import the functions related to tasks
from pydantic import BaseModel


#CREATION of TASK(when you create an arbitrary goal) endpoint
#USE GET(FrontEnd will send a request to GET data from Supabase)
#USE POsT(FrontEnd will send a request to POST data to Supabase)


task_router = APIRouter()

class RequestTasks(BaseModel):
    goal_id: str
    title: str
    description: str
    due_date: str | None = None #either a due_date OR NOT

#USE POST HTTP REQUEST TO STORE DATA IN SUPABASE
@task_router.post("/tasks")
def write_task(task: RequestTasks):
    result = create_task(
        goal_id = task.goal_id,
       # title = goal.title,
        description = task.description,
        due_date = task.due_date
    )
    return {"message": "Task successfully created", "task": result.data}




#USE GET HTTP REQUEST TO GET DATA FROM SUPABASE
@task_router.get("/tasks/{goal_id}") #FETCH by goal_id!
def read_tasks(goal_id: str):
    all_tasks = get_tasks(goal_id) #search by goal id!
    if not all_tasks: #if user has no tasks, no tasks found for a specific user
        return {"tasks": [], "message": "No tasks assocciated with the user"}
    return {"tasks": all_tasks}

