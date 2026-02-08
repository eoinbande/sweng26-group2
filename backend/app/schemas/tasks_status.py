from pydantic import BaseModel

#schema to be able to modify the status of an arbitrary task
class UpdateTaskStatusRequest(BaseModel):
    task_id: str
    status: str  #Possible status: Not_started, in_progress, completed


