from fastapi.testclient import TestClient
from app.main import app
from unittest.mock import patch
from datetime import datetime, timedelta
 
"""TEST FILE: test file for schedule endpoints
This file tests the functionality of the schedule endpoints
covering tasks by date, upcoming tasks, and upcoming goals.
MOCKING DATABASE for all tests."""
 
client = TestClient(app)

#sample mock data

TODAY = datetime.utcnow().strftime("%Y-%m-%d")
YESTERDAY = (datetime.utcnow() - timedelta(days=1)).strftime("%Y-%m-%d")
IN_7_DAYS = (datetime.utcnow() + timedelta(days=7)).strftime("%Y-%m-%d")
IN_14_DAYS = (datetime.utcnow() + timedelta(days=14)).strftime("%Y-%m-%d")
IN_20_DAYS = (datetime.utcnow() + timedelta(days=20)).strftime("%Y-%m-%d")
IN_35_DAYS = (datetime.utcnow() + timedelta(days=35)).strftime("%Y-%m-%d")

SAMPLE_GOALS = [
    {
        "id": "goal-1",
        "title": "Fix my bike tyre",
        "category": "health",
        "goal_data": {
            "description": "Replace the front tyre",
            "goal_due_date": IN_14_DAYS,
            "tasks": [
                {
                    "id": "task-1",
                    "ai_id": "task_1",
                    "description": "Buy a new tyre",
                    "due_date": TODAY,
                    "status": "not_started",
                    "order": 1
                },
                {
                    "id": "task-2",
                    "ai_id": "task_2",
                    "description": "Remove the old tyre",
                    "due_date": IN_7_DAYS,
                    "status": "not_started",
                    "order": 2
                },
                {
                    "id": "task-3",
                    "ai_id": "task_3",
                    "description": "Fit the new tyre",
                    "due_date": IN_14_DAYS,
                    "status": "completed",  # should be filtered out
                    "order": 3
                }
            ]
        }
    },
    {
        "id": "goal-2",
        "title": "Learn Python",
        "category": "education",
        "goal_data": {
            "description": "30-day Python course",
            "goal_due_date": IN_35_DAYS,
            "tasks": [
                {
                    "id": "task-4",
                    "ai_id": "task_4",
                    "description": "Set up environment",
                    "due_date": IN_20_DAYS,
                    "status": "not_started",
                    "order": 1
                }
            ]
        }
    }
]

GOAL_NO_TASKS = [
    {
        "id": "goal-3",
        "title": "Draft goal with no plan",
        "category": "personal",
        "goal_data": {
            "description": "Not accepted yet",
            "goal_due_date": IN_7_DAYS,
            "tasks": []  # no tasks — should be excluded from upcoming goals
        }
    }
]


# ==============================================================================
# GET /schedule/{user_id}/date — tasks for a specific date
# ==============================================================================
 
def test_get_tasks_for_date_success():
    """Should return tasks that are due on the given date."""
    with patch("app.routers.schedule.get_all_goals") as mock_goals:
        mock_goals.return_value = SAMPLE_GOALS
 
        response = client.get(f"/api/schedule/user-1/date?date={TODAY}")
 
    assert response.status_code == 200
    data = response.json()
    assert data["date"] == TODAY
    assert data["count"] == 1
    assert data["tasks"][0]["description"] == "Buy a new tyre"

def test_get_tasks_for_date_no_tasks_on_day():
    """Should return empty list when no tasks are due on the given date."""
    with patch("app.routers.schedule.get_all_goals") as mock_goals:
        mock_goals.return_value = SAMPLE_GOALS
 
        response = client.get(f"/api/schedule/user-1/date?date={YESTERDAY}")
 
    assert response.status_code == 200
    data = response.json()
    assert data["count"] == 0
    assert data["tasks"] == []
 
 
def test_get_tasks_for_date_invalid_format():
    """Should return 400 when date is not in YYYY-MM-DD format."""
    response = client.get("/api/schedule/user-1/date?date=25-03-2026")
 
    assert response.status_code == 400
    assert "Invalid date format" in response.json()["detail"]