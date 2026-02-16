from fastapi.testclient import TestClient
from app.main import app

"""TEST FILE: test file for tasks
This file will contain several Test functions to test the functionality of the task endpoint
"""

#Requests tested:
#PATCH /api/tasks/{id}/status — updates task status
#POST /api/tasks/{id}/expand — expands task into subtasks
#GET /api/tasks/{goal_id}/progress — returns completion stats

#CHECKING ERROR CASES:
#Error cases: 404 for non-existent goals/tasks, invalid request bodies


#==========================================================================================
#TEST: Update task status

#==========================================================================================

#This function test if we are able to modify a task status SUCCESSFULLY(Success Case)
def test_modify_task_status():
    response = client.patch("/api/tasks/task-id/status",
    json = {"status": "completed"}
    )

    assert response.status_code == 200 #we check if we get the correct code
    data = response.json()

    assert data["message"] == "Task status updated successfully!"
    assert data["task_id"] == "task-id"
    assert data["new_status"] == "completed"
    
    