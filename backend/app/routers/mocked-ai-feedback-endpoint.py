from fastapi import APIRouter, HTTPException

from app.schemas.feedback_request import ExpandTaskRequest
from app.schemas.ai_models import AIExpandTaskResponse
from app.Mocked.mock_expand_templates import mock_feedback_templates

#GOAL OF ENDPOINT: POST subtasks (if user wants feedback, post the new subtasks and 
#modification of graph 

feedback_router = APIRouter()

@feedback_router.post("/feedback/expand-task", response_model=AIExpandTaskResponse)
def expand_task(request: ExpandTaskRequest):
    template = mock_feedback_templates.get(request.task_id)


    return AIExpandTaskResponse(
        original_task_id=request.task_id,
        new_nodes=template["new_nodes"],
        new_edges=template["new_edges"],
        edges_to_remove=template["edges_to_remove"]
    )

