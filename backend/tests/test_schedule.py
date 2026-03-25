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


def test_get_tasks_for_date_completely_invalid_string():
    """Should return 400 for a completely nonsensical date string."""
    response = client.get("/api/schedule/user-1/date?date=not-a-date")
 
    assert response.status_code == 400
    assert "Invalid date format" in response.json()["detail"]
 
 
def test_get_tasks_for_date_excludes_completed():
    """Completed tasks should never appear in the date results."""
    with patch("app.routers.schedule.get_all_goals") as mock_goals:
        mock_goals.return_value = SAMPLE_GOALS
 
        response = client.get(f"/api/schedule/user-1/date?date={IN_14_DAYS}")
 
    assert response.status_code == 200
    data = response.json()
    # task-3 is due IN_14_DAYS but is completed — should not appear
    for task in data["tasks"]:
        assert task["status"] != "completed"

def test_get_tasks_for_date_no_goals():
    """Should return empty list when user has no goals."""
    with patch("app.routers.schedule.get_all_goals") as mock_goals:
        mock_goals.return_value = []
 
        response = client.get(f"/api/schedule/user-1/date?date={TODAY}")
 
    assert response.status_code == 200
    data = response.json()
    assert data["count"] == 0
    assert data["tasks"] == []
 
 
def test_get_tasks_for_date_response_shape():
    """Response should always include date, tasks, and count keys."""
    with patch("app.routers.schedule.get_all_goals") as mock_goals:
        mock_goals.return_value = SAMPLE_GOALS
 
        response = client.get(f"/api/schedule/user-1/date?date={TODAY}")
 
    data = response.json()
    assert "date" in data
    assert "tasks" in data
    assert "count" in data

# GET /schedule/{user_id}/upcoming-tasks — tasks in next N days

def test_get_upcoming_tasks_default_window():
    """Should return tasks within the default 15-day window."""
    with patch("app.routers.schedule.get_all_goals") as mock_goals:
        mock_goals.return_value = SAMPLE_GOALS
 
        response = client.get("/api/schedule/user-1/upcoming-tasks")
 
    assert response.status_code == 200
    data = response.json()
    # task-1 (today) and task-2 (in 7 days) are within 15 days
    # task-3 is completed so excluded; task-4 is in 20 days so outside default window
    assert data["count"] == 2
    assert data["days"] == 15

def test_get_upcoming_tasks_custom_window():
    """Should respect a custom days query param."""
    with patch("app.routers.schedule.get_all_goals") as mock_goals:
        mock_goals.return_value = SAMPLE_GOALS
 
        response = client.get("/api/schedule/user-1/upcoming-tasks?days=25")
 
    assert response.status_code == 200
    data = response.json()
    # task-1, task-2, and task-4 (in 20 days) all fall within 25 days; task-3 is completed
    assert data["count"] == 3
    assert data["days"] == 25

def test_get_upcoming_tasks_excludes_completed():
    """Completed tasks should never appear in upcoming tasks."""
    with patch("app.routers.schedule.get_all_goals") as mock_goals:
        mock_goals.return_value = SAMPLE_GOALS
    
        response = client.get("/api/schedule/user-1/upcoming-tasks?days=60")
 
    data = response.json()
    for task in data["tasks"]:
        assert task["status"] != "completed"

def test_get_upcoming_tasks_sorted_by_due_date():
    """Tasks should be returned sorted by due_date ascending."""
    with patch("app.routers.schedule.get_all_goals") as mock_goals:
        mock_goals.return_value = SAMPLE_GOALS
 
        response = client.get("/api/schedule/user-1/upcoming-tasks?days=60")
 
    data = response.json()
    dates = [t["due_date"] for t in data["tasks"]]
    assert dates == sorted(dates)
 
 
def test_get_upcoming_tasks_no_goals():
    """Should return empty list when user has no goals."""
    with patch("app.routers.schedule.get_all_goals") as mock_goals:
        mock_goals.return_value = []
 
        response = client.get("/api/schedule/user-1/upcoming-tasks")
 
    assert response.status_code == 200
    data = response.json()
    assert data["count"] == 0
    assert data["tasks"] == []

def test_get_upcoming_tasks_response_shape():
    """Response should include from, to, days, tasks, and count."""
    with patch("app.routers.schedule.get_all_goals") as mock_goals:
        mock_goals.return_value = SAMPLE_GOALS
 
        response = client.get("/api/schedule/user-1/upcoming-tasks")
 
    data = response.json()
    assert "from" in data
    assert "to" in data
    assert "days" in data
    assert "tasks" in data
    assert "count" in data
 
 
def test_get_upcoming_tasks_goal_metadata_attached():
    """Each task should carry goal_id and goal_title from its parent goal."""
    with patch("app.routers.schedule.get_all_goals") as mock_goals:
        mock_goals.return_value = SAMPLE_GOALS
 
        response = client.get("/api/schedule/user-1/upcoming-tasks?days=60")
 
    data = response.json()
    for task in data["tasks"]:
        assert "goal_id" in task
        assert "goal_title" in task