from pydantic import BaseModel


class RerouteRequest(BaseModel):
    goal_id: str
    task_id: str