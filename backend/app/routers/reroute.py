from fastapi import APIRouter, HTTPException
from app.Mocked.mock_expand_templates import mock_feedback_templates
from ..Tables import get_goal_graph, update_goal_graph
from app.schemas.reroute_request import RerouteRequest

"""Goal of this endpoint: AI will say: Change the plan and SAVE it (IN DATABASE)
For now, it will ONLY applo mocked AI reroute changes! """

reroute_router = APIRouter()

#Modify graph of tasks and return the updated graph!
@reroute_router.post("/feedback/reroute")
def reroute_goal(request: RerouteRequest):

    template = mock_feedback_templates(request.task_id)

    #if there is no template available, raise exception
    if not template:
        raise HTTPException(status_code = 404, detail = "No reroute available")

     #first, load current graph of tasks
    goal_graph = get_goal_graph(request.goal_id)

    #Second, apply the changes(later by AI)
    goal_graph["nodes"].extend(template["new_nodes"])

    #Third, Remove edges
    goal_graph["edges"] = [
        e for e in goal_graph["edges"]
        if e not in template["edges_to_remove"]
    ]

    #Fourth, add edges
    goal_graph["edges"].extend(template["new_edges"])

    #Final, save the updated graph to DB!
    update_goal_graph(request.goal_id, goal_graph)

    return {
        "message": "Goal rerouted successfully",
        "updated_graph": goal_graph
    }

