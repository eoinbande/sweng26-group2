from fastapi.testclient import TestClient
from app.main import app

"""TEST FILE: test file for tasks
This file will contain several Test functions to test the functionality of the task endpoint """

client = TestClient
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

#This function test if we try to modify the task status by a invalid status(INVALID case 400)
def test_modify_task_invalid():
    response = client.patch(
        "/api/tasks/task-id/status",
        json ={"status": "INVALID"}
    )
    
    assert response.status_code == 400 #check if it returns the correct code
    assert "Invalid status" in response.json()["detail"]

def test_modify_task_notfound():
    response = client.patch(
        "/api/tasks/no-task-id/status",
        json = {"status": "completed"}
    )

    assert response.status_code == 404 #check if we get the correct code
    assert response.json()["detail"] == "Task not found"

#================================================================================
#TEST: Expand a task into subtasks

#===============================================================================

#this test checks if we can successfully expand a task(for now only task_5)
def test_expand_task():
    response = client.post( #for now we can only expand task_5
        "/api/tasks/valid-task-ai-id-task_5/expand",
        json = {"stuck_reason": "I don't know how to reassemble the wheel"}
    )

    assert response.status_code == 200
    data = response.json()

    assert data["message"] == "Task expanded into subtasks"
    assert "subtasks" in data
    assert isinstance(data["subtasks"], list)