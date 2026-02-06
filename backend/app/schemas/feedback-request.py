from pydantic import BaseModel

class ExpandTaskRequest(BaseModel):
    task_id: str #stuck in this specific task (by task_id)
    stuck_reason: str | None = None #this should be optional(if user wants to say why)