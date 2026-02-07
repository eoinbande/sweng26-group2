from fastapi import APIRouter, HTTPException
from app.schemas.task_status import UpdateTaskStatusRequest
from ..Tables import update_task_status

task_progress_router = APIRouter()

#this function will EDIT the current status of the task
#(will sent an http request from frontEnd)
@task_progress_router.patch("tasks/status")
def modify_task_status(request: UpdateTaskStatusRequest):
    result = update_task_status(
        task_id = request.task_id,
        status = request.status
    )


    return {
        "message": "Task status updated successfully!",
        "task": result.data
    }