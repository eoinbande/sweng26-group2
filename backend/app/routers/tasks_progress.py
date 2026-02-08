from fastapi import APIRouter, HTTPException
from app.schemas.task_status import UpdateTaskStatusRequest
from ..Tables import update_task_status

task_progress_router = APIRouter() #main router for task progression

#this function will EDIT the current status of the task
#(will sent an http request from frontEnd)
@task_progress_router.patch("tasks/status")
def modify_task_status(request: UpdateTaskStatusRequest):
    result = update_task_status(
        task_id = request.task_id,
        status = request.status
    )

    #if task is not found, send an 404 exception!
    if not result.data:
        raise HTTPException(status_code = 404, detail= "Task not found")

    return {
        "message": "Task status updated successfully!", #we return to the user that the task status has updated
        "task": result.data
    }