from fastapi.testclient import TestClient
from app.main import app
from unittest.mock import patch


"""TEST FILE: test file for tasks
This file will contain several Test functions to test the functionality of the task endpoint 
10 TESTS(full COVERAGE tasks.py) MOCKING DATABASE!"""

client = TestClient(app) #client to tests the HTTPS requests

#Requests tested:
#PATCH /api/tasks/{id}/status — updates task status
#POST /api/tasks/{id}/expand — expands task into subtasks
#GET /api/tasks/{goal_id}/progress — returns completion stats

#CHECKING ERROR CASES:
#Error cases: 404 for non-existent goals/tasks, invalid request bodies

#MOCKING DB


#==========================================================================================

#TEST: Update task status

#==========================================================================================

#This function test if we are able to modify a task status SUCCESSFULLY(Success Case)
def test_modify_task_status():
    with patch("app.routers.tasks.update_task_status") as mock_update:
        mock_update.return_value = True # Simulate successful update

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
    with patch("app.routers.tasks.update_task_status") as mock_update:
        mock_update.return_value = False # Simulate task not found

        response = client.patch(
        "/api/tasks/no-task-id/status",
        json = {"status": "completed"}
        )

    assert response.status_code == 404 #check if we get the correct code
    assert response.json()["detail"] == "Task not found"

#================================================================================

#TEST: Expand a task into subtasks

#===============================================================================

#this test checks if we can successfully expand a task(for now only task_5/MOCK)
def test_expand_task():
    fake_task = {"goal_id": "goal-1", "ai_id": "task_5", "user_id": "user-1"}
    fake_subtasks = [{"ai_id": "task_5a", "title": "Step 1", "description": "Step 1", "order": 1},
                     {"ai_id": "task_5b", "title": "Step 2", "description": "Step 2", "order": 2}]

    with patch("app.routers.tasks.get_task") as mock_get_task, \
         patch("app.routers.tasks.get_tasks_for_goal") as mock_get_tasks, \
         patch("app.routers.tasks.add_subtasks_to_task") as mock_add_subtasks, \
         patch("app.routers.tasks.ai_service.expand_task") as mock_ai, \
         patch("app.routers.tasks.log_ai_usage"), \
         patch("app.routers.tasks.estimate_carbon_usage", return_value=0.001):

        mock_get_task.return_value = fake_task
        mock_get_tasks.return_value = []
        mock_ai.return_value = {"subtasks": fake_subtasks, "task_ai_id": "task_5"}
        mock_add_subtasks.return_value = fake_subtasks

        response = client.post(
            "/api/tasks/valid-task-ai-id-task_5/expand",
            json={"stuck_reason": "I don't know how to reassemble the wheel"}
        )

    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "Task expanded into subtasks"
    assert data["stuck_reason"] == "I don't know how to reassemble the wheel"

#this test if that a specific task ALREADY has subtasks(400 case)
def test_task_already_expanded():
    fake_subtasks = [{"ai_id": "task_5a", "title": "Step 1", "description": "Step 1", "order": 1},
                     {"ai_id": "task_5b", "title": "Step 2", "description": "Step 2", "order": 2}]

    with patch("app.routers.tasks.get_task") as mock_get_task, \
         patch("app.routers.tasks.get_tasks_for_goal") as mock_get_tasks, \
         patch("app.routers.tasks.add_subtasks_to_task") as mock_add_subtasks, \
         patch("app.routers.tasks.ai_service.expand_task") as mock_ai, \
         patch("app.routers.tasks.log_ai_usage"), \
         patch("app.routers.tasks.estimate_carbon_usage", return_value=0.001):

        mock_get_task.return_value = {"id": "task_5", "goal_id": "goal-1", "ai_id": "task_5", "user_id": "user-1"}

        mock_get_tasks.side_effect = [
            [],   # first expand: check existing subtasks
            [],   # first expand: get goal tasks for AI
            [],   # first expand: duplicate ai_id check
            [{"parent_id": "task_5"}]  # second expand: check existing subtasks → triggers 400
        ]

        mock_ai.return_value = {"subtasks": fake_subtasks, "task_ai_id": "task_5"}
        mock_add_subtasks.return_value = fake_subtasks

        # First expand
        response = client.post("/api/tasks/task_5/expand", json={"stuck_reason": "whatever"})
        assert response.status_code == 200

        # Second expand (already has subtasks)
        response = client.post("/api/tasks/task_5/expand", json={"stuck_reason": "whatever"})
        assert response.status_code == 400
        assert "already has subtasks" in response.json()["detail"]


#this test will check if the task is not found(404 case)
def test_expand_task_notfound():
    with patch("app.routers.tasks.get_task") as mock_get_task:
        mock_get_task.return_value = None # Simulate task not found

        response = client.post(
        "/api/tasks/no-task-id/expand",
        json = {}
        )

    assert response.status_code == 404
    assert response.json()["detail"] == "Task not found"


#===============================================================

#TEST: Return completion stats

#==============================================================

#this test will check if we can return completion stats(successfully)
def test_get_progress():

    with patch("app.routers.tasks.get_completed_task_count") as mock_completed, \
         patch("app.routers.tasks.get_total_task_count") as mock_total:

        mock_completed.return_value = 3
        mock_total.return_value = 5

        response = client.get("/api/tasks/goal-id/progress")
  
        assert response.status_code == 200 #check if we get the correct code

        data = response.json()

        assert data["completed"] == 3
        assert data["total"] == 5
        assert data["percentage"] == 60.0


#this test check if there is no expanded list for a task(only for MOCK)
def test_expand_task_no_mock():
    fake_task = {"id": "task-10", "goal_id": "uuid-goal", "ai_id": "unknown_task"}

    with patch("app.routers.tasks.get_task") as mock_get_task, \
         patch("app.routers.tasks.get_tasks_for_goal"), \
         patch("app.routers.tasks.ai_service.expand_task") as mock_ai:

        mock_get_task.return_value = fake_task
        mock_ai.side_effect = Exception("AI unavailable")

        response = client.post(
            f"/api/tasks/{fake_task['id']}/expand",
            json={"stuck_reason": "I am confused"}
        )

    assert response.status_code == 503
    assert "AI service unavailable" in response.json()["detail"]

#This test checks if we can fail to retrieve the tasks of a goal
def test_get_no_tasks():
    with patch("app.routers.tasks.get_tasks_for_goal") as mock_get_tasks: #we mock(we dont use the DB)
        mock_get_tasks.return_value = []

        response = client.get("/api/tasks/goal-id")

        assert response.status_code == 200
        data = response.json()
        assert data["tasks"] == []
        assert data["message"] == "No tasks associated with this goal"

#This test checks if we can successfully retrieve the tasks of a goal
def test_get_tasks_with_results():
    # Mock the database function to return some tasks
    with patch("app.routers.tasks.get_tasks_for_goal") as mock_get:
        mock_get.return_value = [
            {"id": "task-1", "title": "Test task 1"},
            {"id": "task-2", "title": "Test task 2"}
        ]
        response = client.get("/api/tasks/goal-123")
        assert response.status_code == 200
        data = response.json()
        assert "tasks" in data
        assert len(data["tasks"]) == 2
        assert data["count"] == 2


#######THIS test FUNCTION TU TEST DELETE A GOAL NEEDS TO BE MOVED TO THE test_goals#########

#this test will check if we can successfully delete a goal
def test_delete_goal():
    with patch("app.routers.goals.delete_goal") as mock_delete_goal:
        mock_delete_goal.return_value = None # SIMULATE SUCCESSFUL DELETION

        goal_id = "goal-123"
        response = client.delete(f"/api/goals/{goal_id}")
    
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "Goal deleted successfully"
    assert data["goal_id"] == goal_id

def test_delete_goal_fail():
    with patch("app.routers.goals.delete_goal") as mock_delete_goal:
        mock_delete_goal.side_effect = Exception("Database error")

        goal_id = "goal-123"
        response = client.delete(f"/api/goals/{goal_id}")
    
    assert response.status_code == 500 #check if we get the correct status code
    data = response.json()
    assert "Error deleting goal" in data["detail"]
    assert "Database error" in data["detail"]

