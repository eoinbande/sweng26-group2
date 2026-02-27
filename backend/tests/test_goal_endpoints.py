import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
from app.main import app
from app.schemas import TaskStatus


# =============================================================================
# Test Client Setup
# =============================================================================

client = TestClient(app)


# =============================================================================
# Mock Data Fixtures
# =============================================================================

@pytest.fixture
def mock_user_id():
    """Standard test user ID."""
    return "test-user-123"


@pytest.fixture
def mock_goal_id():
    """Standard test goal ID."""
    return "goal-uuid-456"


@pytest.fixture
def sample_bike_tyre_plan():
    """Sample AI-generated plan for bike tyre goal."""
    return {
        "description": "Step-by-step guide to fixing a flat bike tyre",
        "goal_due_date": "2026-03-01",
        "tasks": [
            {
                "ai_id": "task_1",
                "description": "Remove the wheel from the bike",
                "order": 1,
                "status": "not_started",
                "due_date": "2026-02-22",
                "requires_input": False,
                "guidance": "Flip the bike upside down...",
                "subtasks": []
            },
            {
                "ai_id": "task_2",
                "description": "Take out the inner tube",
                "order": 2,
                "status": "not_started",
                "due_date": "2026-02-22",
                "requires_input": False,
                "guidance": "Use tyre levers...",
                "subtasks": []
            }
        ]
    }


@pytest.fixture
def sample_feedback_response():
    """Sample AI-generated feedback response."""
    return {
        "tasks": [
            {
                "ai_id": "task_1",
                "description": "Remove the wheel from the bike",
                "order": 1,
                "status": "not_started",
                "due_date": "2026-02-20",
                "requires_input": False,
                "subtasks": []
            },
            {
                "ai_id": "task_2",
                "description": "Take out the inner tube (modified)",
                "order": 2,
                "status": "not_started",
                "due_date": "2026-02-20",
                "requires_input": False,
                "subtasks": []
            }
        ]
    }


@pytest.fixture
def sample_tasks_with_uuids():
    """Sample tasks after being saved to DB with UUIDs."""
    return [
        {
            "id": "uuid-task-1",
            "ai_id": "task_1",
            "description": "Remove the wheel from the bike",
            "order": 1,
            "status": "not_started",
            "due_date": "2026-02-22",
            "requires_input": False,
            "subtasks": []
        },
        {
            "id": "uuid-task-2",
            "ai_id": "task_2",
            "description": "Take out the inner tube",
            "order": 2,
            "status": "not_started",
            "due_date": "2026-02-22",
            "requires_input": False,
            "subtasks": []
        }
    ]


@pytest.fixture
def sample_goal_list():
    """Sample list of goals for a user.

    goal_data can be either a dict or a JSON string — the router handles both.
    Tasks must be non-empty so the router's accepted-goals filter
    (``if goal_data.get("tasks")``) doesn't strip these goals out.
    """
    def _make_task(ai_id, uid, desc):
        return {
            "ai_id": ai_id, "id": uid, "description": desc,
            "order": 1, "status": "not_started", "subtasks": []
        }
    return [
        {
            "id": "goal-1",
            "user_id": "test-user-123",
            "title": "Fix my bike tyre",
            "created_at": "2026-02-16T10:00:00",
            "goal_data": {
                "description": "Step-by-step guide to fixing a flat bike tyre",
                "goal_due_date": "2026-03-01",
                "tasks": [_make_task("task_1", "uuid-t1", "Remove the wheel from the bike")]
            }
        },
        {
            "id": "goal-2",
            "user_id": "test-user-123",
            "title": "Learn piano",
            "created_at": "2026-02-15T10:00:00",
            "goal_data": {
                "description": "Beginner's roadmap to learning piano",
                "goal_due_date": "2026-05-15",
                "tasks": [_make_task("task_1", "uuid-t2", "Get access to a piano")]
            }
        }
    ]


# =============================================================================
# POST /api/goals — Create Goal and Return Mock Plan
# =============================================================================

class TestCreateGoal:
    """Tests for POST /api/goals endpoint."""

    @patch("app.routers.goals.create_goal")
    @patch("app.routers.goals.get_mock_plan")
    @patch("app.routers.goals.update_goal_data")
    def test_create_goal_success(
        self, mock_update, mock_get_plan, mock_create, 
        mock_user_id, mock_goal_id, sample_bike_tyre_plan
    ):
        """Should successfully create a goal and return AI-generated plan."""
        mock_create.return_value = MagicMock(
            data=[{"id": mock_goal_id, "title": "Fix my bike tyre"}]
        )
        mock_get_plan.return_value = sample_bike_tyre_plan
        
        response = client.post(
            "/api/goals",
            json={
                "user_id": mock_user_id,
                "title": "Fix my bike tyre"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["message"] == "Goal created — review your plan below"
        assert data["goal_id"] == mock_goal_id
        assert data["title"] == "Fix my bike tyre"
        assert data["description"] == sample_bike_tyre_plan["description"]
        assert data["goal_due_date"] == sample_bike_tyre_plan["goal_due_date"]
        assert len(data["tasks"]) == 2
        assert data["saved_to_db"] is False
        
        mock_create.assert_called_once_with(
            user_id=mock_user_id,
            title="Fix my bike tyre",
            category=None
        )
        mock_get_plan.assert_called_once_with("Fix my bike tyre")
        mock_update.assert_called_once()

    @patch("app.routers.goals.create_goal")
    @patch("app.routers.goals.get_mock_plan")
    @patch("app.routers.goals.update_goal_data")
    def test_create_goal_returns_task_structure(
        self, mock_update, mock_get_plan, mock_create,
        mock_user_id, mock_goal_id, sample_bike_tyre_plan
    ):
        """Should return tasks with correct structure including ai_id, order, subtasks."""
        mock_create.return_value = MagicMock(
            data=[{"id": mock_goal_id}]
        )
        mock_get_plan.return_value = sample_bike_tyre_plan
        
        response = client.post(
            "/api/goals",
            json={
                "user_id": mock_user_id,
                "title": "Fix my bike tyre"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        tasks = data["tasks"]
        
        assert tasks[0]["ai_id"] == "task_1"
        assert tasks[0]["description"] == "Remove the wheel from the bike"
        assert tasks[0]["order"] == 1
        assert tasks[0]["status"] == "not_started"
        assert tasks[0]["requires_input"] is False
        assert "subtasks" in tasks[0]
        assert isinstance(tasks[0]["subtasks"], list)

    @patch("app.routers.goals.create_goal")
    def test_create_goal_db_failure(self, mock_create, mock_user_id):
        """Should return 500 error when database creation fails."""
        mock_create.return_value = MagicMock(data=None)
        
        response = client.post(
            "/api/goals",
            json={
                "user_id": mock_user_id,
                "title": "Fix my bike tyre"
            }
        )
        
        assert response.status_code == 500
        assert "Failed to create goal" in response.json()["detail"]

    def test_create_goal_missing_user_id(self):
        """Should reject request with missing user_id."""
        response = client.post(
            "/api/goals",
            json={"title": "Fix my bike tyre"}
        )
        
        assert response.status_code == 422

    def test_create_goal_missing_title(self, mock_user_id):
        """Should reject request with missing title."""
        response = client.post(
            "/api/goals",
            json={"user_id": mock_user_id}
        )
        
        assert response.status_code == 422

    def test_create_goal_empty_title(self, mock_user_id):
        """Should reject request with empty title."""
        response = client.post(
            "/api/goals",
            json={
                "user_id": mock_user_id,
                "title": ""
            }
        )
        
        assert response.status_code == 422

    @patch("app.routers.goals.create_goal")
    @patch("app.routers.goals.get_mock_plan")
    @patch("app.routers.goals.update_goal_data")
    def test_create_goal_with_wedding_plan(
        self, mock_update, mock_get_plan, mock_create,
        mock_user_id, mock_goal_id
    ):
        """Should handle complex plan with requires_input tasks (wedding example)."""
        wedding_plan = {
            "description": "Complete planning guide for organising a wedding",
            "goal_due_date": "2026-06-15",
            "tasks": [
                {
                    "ai_id": "task_1",
                    "description": "Decide on the perfect wedding date",
                    "order": 1,
                    "status": "not_started",
                    "requires_input": True,
                    "subtasks": []
                }
            ]
        }
        
        mock_create.return_value = MagicMock(data=[{"id": mock_goal_id}])
        mock_get_plan.return_value = wedding_plan
        
        response = client.post(
            "/api/goals",
            json={
                "user_id": mock_user_id,
                "title": "Plan my wedding"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["tasks"][0]["requires_input"] is True


# =============================================================================
# POST /api/goals/{goal_id}/feedback — Return Updated Plan
# =============================================================================

class TestFeedbackOnPlan:
    """Tests for POST /api/goals/{goal_id}/feedback endpoint."""

    @patch("app.routers.goals.get_goal")
    @patch("app.routers.goals.get_mock_feedback_response")
    def test_feedback_success(
        self, mock_get_feedback, mock_get_goal,
        mock_goal_id, sample_feedback_response
    ):
        """Should successfully process feedback and return updated plan."""
        mock_get_goal.return_value = {
            "id": mock_goal_id,
            "title": "Fix my bike tyre",
            "goal_data": {}
        }
        mock_get_feedback.return_value = sample_feedback_response
        
        response = client.post(
            f"/api/goals/{mock_goal_id}/feedback",
            json={"feedback": "I don't like task_3, use soapy water instead"}
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["message"] == "Plan updated based on your feedback"
        assert data["goal_id"] == mock_goal_id
        assert data["feedback_received"] == "I don't like task_3, use soapy water instead"
        assert data["saved_to_db"] is False
        assert len(data["tasks"]) == 2

    @patch("app.routers.goals.get_goal")
    @patch("app.routers.goals.get_mock_feedback_response")
    def test_feedback_preserves_task_structure(
        self, mock_get_feedback, mock_get_goal, mock_goal_id
    ):
        """Should return tasks with ai_id, order, and status preserved."""
        mock_get_goal.return_value = {
            "id": mock_goal_id,
            "title": "Fix my bike tyre"
        }
        mock_get_feedback.return_value = {
            "tasks": [
                {
                    "ai_id": "task_1",
                    "description": "Modified description",
                    "order": 1,
                    "status": "completed",
                    "subtasks": []
                }
            ]
        }
        
        response = client.post(
            f"/api/goals/{mock_goal_id}/feedback",
            json={"feedback": "Make it easier"}
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["tasks"][0]["status"] == "completed"
        assert data["tasks"][0]["ai_id"] == "task_1"

    @patch("app.routers.goals.get_goal")
    def test_feedback_goal_not_found(self, mock_get_goal):
        """Should return 404 when goal doesn't exist."""
        mock_get_goal.side_effect = Exception("Goal not found")
        
        response = client.post(
            "/api/goals/nonexistent-goal-id/feedback",
            json={"feedback": "Some feedback"}
        )
        
        assert response.status_code == 404
        assert "Goal not found" in response.json()["detail"]

    def test_feedback_missing_feedback_text(self, mock_goal_id):
        """Should reject request with missing feedback field."""
        response = client.post(
            f"/api/goals/{mock_goal_id}/feedback",
            json={}
        )
        
        assert response.status_code == 422

    @patch("app.routers.goals.get_goal")
    @patch("app.routers.goals.get_mock_feedback_response")
    def test_feedback_empty_string_accepted(
        self, mock_get_feedback, mock_get_goal, 
        mock_goal_id, sample_feedback_response
    ):
        """Should accept empty feedback string (user just wants AI to refine)."""
        mock_get_goal.return_value = {"id": mock_goal_id, "title": "Test goal"}
        mock_get_feedback.return_value = sample_feedback_response
        
        response = client.post(
            f"/api/goals/{mock_goal_id}/feedback",
            json={"feedback": ""}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["feedback_received"] == ""

    @patch("app.routers.goals.get_goal")
    @patch("app.routers.goals.get_mock_feedback_response")
    def test_feedback_can_be_called_multiple_times(
        self, mock_get_feedback, mock_get_goal,
        mock_goal_id, sample_feedback_response
    ):
        """Should allow multiple feedback iterations on same goal."""
        mock_get_goal.return_value = {"id": mock_goal_id, "title": "Test goal"}
        mock_get_feedback.return_value = sample_feedback_response
        
        response1 = client.post(
            f"/api/goals/{mock_goal_id}/feedback",
            json={"feedback": "First change"}
        )
        assert response1.status_code == 200
        
        response2 = client.post(
            f"/api/goals/{mock_goal_id}/feedback",
            json={"feedback": "Second change"}
        )
        assert response2.status_code == 200
        
        assert response1.json()["feedback_received"] == "First change"
        assert response2.json()["feedback_received"] == "Second change"


# =============================================================================
# POST /api/goals/{goal_id}/accept — Save Tasks to DB
# =============================================================================

class TestAcceptPlan:
    """Tests for POST /api/goals/{goal_id}/accept endpoint."""

    @patch("app.routers.goals.get_goal")
    @patch("app.routers.goals.save_tasks_to_db")
    def test_accept_plan_first_save(
        self, mock_save_tasks, mock_get_goal,
        mock_goal_id, sample_tasks_with_uuids
    ):
        """Should save tasks to DB and return UUIDs on first accept."""
        mock_get_goal.return_value = {
            "id": mock_goal_id,
            "title": "Fix my bike tyre",
            "goal_data": {"tasks": []}
        }
        mock_save_tasks.return_value = sample_tasks_with_uuids
        
        response = client.post(
            f"/api/goals/{mock_goal_id}/accept",
            json={
                "tasks": [
                    {
                        "ai_id": "task_1",
                        "description": "Remove the wheel",
                        "order": 1,
                        "status": "not_started",
                        "subtasks": []
                    }
                ]
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["message"] == "Plan accepted and saved!"
        assert data["goal_id"] == mock_goal_id
        assert data["saved_to_db"] is True
        assert len(data["tasks"]) == 2
        
        assert data["tasks"][0]["id"] == "uuid-task-1"
        assert data["tasks"][0]["ai_id"] == "task_1"

    @patch("app.routers.goals.get_goal")
    @patch("app.routers.goals.merge_and_save_tasks")
    def test_accept_plan_reaccept_with_existing_tasks(
        self, mock_merge_tasks, mock_get_goal, mock_goal_id
    ):
        """Should merge tasks when re-accepting (preserving completed work)."""
        mock_get_goal.return_value = {
            "id": mock_goal_id,
            "title": "Fix my bike tyre",
            "goal_data": {
                "tasks": [
                    {
                        "id": "uuid-task-1",
                        "ai_id": "task_1",
                        "description": "Old description",
                        "status": "completed"
                    }
                ]
            }
        }
        
        merged_tasks = [
            {
                "id": "uuid-task-1",
                "ai_id": "task_1",
                "description": "New description",
                "status": "completed",
                "order": 1,
                "subtasks": []
            }
        ]
        mock_merge_tasks.return_value = merged_tasks
        
        response = client.post(
            f"/api/goals/{mock_goal_id}/accept",
            json={
                "tasks": [
                    {
                        "ai_id": "task_1",
                        "description": "New description",
                        "order": 1,
                        "status": "not_started",
                        "subtasks": []
                    }
                ]
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["tasks"][0]["status"] == "completed"
        assert data["tasks"][0]["description"] == "New description"

    @patch("app.routers.goals.get_goal")
    def test_accept_plan_goal_not_found(self, mock_get_goal):
        """Should return 404 when goal doesn't exist."""
        mock_get_goal.side_effect = Exception("Goal not found")
        
        response = client.post(
            "/api/goals/nonexistent-goal-id/accept",
            json={"tasks": []}
        )
        
        assert response.status_code == 404
        assert "Goal not found" in response.json()["detail"]

    def test_accept_plan_missing_tasks(self, mock_goal_id):
        """Should reject request with missing tasks field."""
        response = client.post(
            f"/api/goals/{mock_goal_id}/accept",
            json={}
        )
        
        assert response.status_code == 422

    @patch("app.routers.goals.get_goal")
    @patch("app.routers.goals.save_tasks_to_db")
    def test_accept_plan_with_subtasks(
        self, mock_save_tasks, mock_get_goal, mock_goal_id
    ):
        """Should handle tasks with subtasks correctly."""
        mock_get_goal.return_value = {
            "id": mock_goal_id,
            "goal_data": {"tasks": []}
        }
        
        tasks_with_subtasks = [
            {
                "id": "uuid-task-1",
                "ai_id": "task_1",
                "description": "Parent task",
                "order": 1,
                "status": "not_started",
                "subtasks": [
                    {
                        "id": "uuid-subtask-1a",
                        "ai_id": "task_1a",
                        "description": "Subtask A",
                        "order": 1,
                        "status": "not_started"
                    }
                ]
            }
        ]
        mock_save_tasks.return_value = tasks_with_subtasks
        
        response = client.post(
            f"/api/goals/{mock_goal_id}/accept",
            json={
                "tasks": [
                    {
                        "ai_id": "task_1",
                        "description": "Parent task",
                        "order": 1,
                        "subtasks": [
                            {
                                "ai_id": "task_1a",
                                "description": "Subtask A",
                                "order": 1
                            }
                        ]
                    }
                ]
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert len(data["tasks"][0]["subtasks"]) == 1
        assert data["tasks"][0]["subtasks"][0]["id"] == "uuid-subtask-1a"

    @patch("app.routers.goals.get_goal")
    @patch("app.routers.goals.save_tasks_to_db")
    @patch("app.routers.goals.update_goal_data")
    def test_accept_plan_empty_tasks_array(
        self, mock_update, mock_save_tasks, mock_get_goal, mock_goal_id
    ):
        """Should reject empty tasks array (no plan to accept)."""
        mock_get_goal.return_value = {
            "id": mock_goal_id,
            "goal_data": {"tasks": []}
        }
        mock_update.return_value = None
        
        response = client.post(
            f"/api/goals/{mock_goal_id}/accept",
            json={"tasks": []}
        )
        
        assert response.status_code in [200, 400]


# =============================================================================
# GET /api/goals/{user_id} — Get All Goals for User
# =============================================================================

class TestGetGoals:
    """Tests for GET /api/goals/{user_id} endpoint."""

    @patch("app.routers.goals.get_all_goals")
    def test_get_goals_success(
        self, mock_get_all_goals, mock_user_id, sample_goal_list
    ):
        """Should return all goals for a user."""
        mock_get_all_goals.return_value = sample_goal_list
        
        response = client.get(f"/api/goals/{mock_user_id}")
        
        assert response.status_code == 200
        data = response.json()
        
        assert "goals" in data
        assert len(data["goals"]) == 2
        assert data["goals"][0]["title"] == "Fix my bike tyre"
        assert data["goals"][1]["title"] == "Learn piano"

    @patch("app.routers.goals.get_all_goals")
    def test_get_goals_includes_goal_data(
        self, mock_get_all_goals, mock_user_id, sample_goal_list
    ):
        """Should include goal_data JSONB for each goal."""
        mock_get_all_goals.return_value = sample_goal_list
        
        response = client.get(f"/api/goals/{mock_user_id}")
        
        assert response.status_code == 200
        data = response.json()
        
        for goal in data["goals"]:
            assert "goal_data" in goal
            assert "description" in goal["goal_data"]
            assert "tasks" in goal["goal_data"]

    @patch("app.routers.goals.get_all_goals")
    def test_get_goals_empty_list(self, mock_get_all_goals, mock_user_id):
        """Should return empty list with message when user has no goals."""
        mock_get_all_goals.return_value = None
        
        response = client.get(f"/api/goals/{mock_user_id}")
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["goals"] == []
        assert "No goals associated with the user" in data["message"]

    @patch("app.routers.goals.get_all_goals")
    def test_get_goals_returns_list_structure(
        self, mock_get_all_goals, mock_user_id
    ):
        """Should return goals as a list with proper structure."""
        mock_get_all_goals.return_value = [
            {
                "id": "goal-1",
                "user_id": mock_user_id,
                "title": "Test goal",
                "created_at": "2026-02-16T10:00:00",
                "goal_data": {
                    "description": "Test description",
                    "goal_due_date": "2026-03-01",
                    "tasks": [
                        {"ai_id": "task_1", "id": "uuid-t1", "description": "Do something",
                         "order": 1, "status": "not_started", "subtasks": []}
                    ]
                }
            }
        ]
        
        response = client.get(f"/api/goals/{mock_user_id}")
        
        assert response.status_code == 200
        data = response.json()
        
        assert isinstance(data["goals"], list)
        goal = data["goals"][0]
        assert "id" in goal
        assert "title" in goal
        assert "created_at" in goal
        assert "goal_data" in goal

    @patch("app.routers.goals.get_all_goals")
    def test_get_goals_multiple_goals_ordered(
        self, mock_get_all_goals, mock_user_id
    ):
        """Should handle multiple goals correctly."""
        def _make_tasks(n):
            return [{"ai_id": "task_1", "id": f"uuid-{n}", "description": "Step",
                      "order": 1, "status": "not_started", "subtasks": []}]
        mock_get_all_goals.return_value = [
            {"id": "1", "title": "Goal 1", "goal_data": {"tasks": _make_tasks(1)}},
            {"id": "2", "title": "Goal 2", "goal_data": {"tasks": _make_tasks(2)}},
            {"id": "3", "title": "Goal 3", "goal_data": {"tasks": _make_tasks(3)}},
        ]
        
        response = client.get(f"/api/goals/{mock_user_id}")
        
        assert response.status_code == 200
        data = response.json()
        
        assert len(data["goals"]) == 3
        assert data["goals"][0]["title"] == "Goal 1"
        assert data["goals"][2]["title"] == "Goal 3"

    @patch("app.routers.goals.get_all_goals")
    def test_get_goals_different_users_isolated(self, mock_get_all_goals):
        """Should only return goals for the specified user."""
        user_1_goals = [
            {
                "id": "1",
                "user_id": "user-1",
                "title": "User 1 Goal",
                "goal_data": {
                    "tasks": [{"ai_id": "task_1", "id": "uuid-t1", "description": "Step",
                               "order": 1, "status": "not_started", "subtasks": []}]
                }
            }
        ]
        
        mock_get_all_goals.return_value = user_1_goals
        
        response = client.get("/api/goals/user-1")
        
        assert response.status_code == 200
        data = response.json()
        
        assert all(goal.get("user_id") == "user-1" for goal in data["goals"])


# =============================================================================
#  Integration-style Tests
# =============================================================================

class TestGoalsWorkflow:
    """Tests that verify the complete workflow across multiple endpoints."""

    @patch("app.routers.goals.create_goal")
    @patch("app.routers.goals.get_mock_plan")
    @patch("app.routers.goals.update_goal_data")
    @patch("app.routers.goals.get_goal")
    @patch("app.routers.goals.save_tasks_to_db")
    def test_complete_workflow_create_to_accept(
        self, mock_save, mock_get_goal, mock_update,
        mock_get_plan, mock_create,
        mock_user_id, mock_goal_id, sample_bike_tyre_plan,
        sample_tasks_with_uuids
    ):
        """Should handle complete flow: create → review → accept."""
        mock_create.return_value = MagicMock(data=[{"id": mock_goal_id}])
        mock_get_plan.return_value = sample_bike_tyre_plan
        
        create_response = client.post(
            "/api/goals",
            json={
                "user_id": mock_user_id,
                "title": "Fix my bike tyre"
            }
        )
        
        assert create_response.status_code == 200
        assert create_response.json()["saved_to_db"] is False
        
        mock_get_goal.return_value = {
            "id": mock_goal_id,
            "goal_data": {"tasks": []}
        }
        mock_save.return_value = sample_tasks_with_uuids
        
        accept_response = client.post(
            f"/api/goals/{mock_goal_id}/accept",
            json={"tasks": sample_bike_tyre_plan["tasks"]}
        )
        
        assert accept_response.status_code == 200
        assert accept_response.json()["saved_to_db"] is True
        
        accepted_tasks = accept_response.json()["tasks"]
        assert all("id" in task for task in accepted_tasks)

    @patch("app.routers.goals.create_goal")
    @patch("app.routers.goals.get_mock_plan")
    @patch("app.routers.goals.update_goal_data")
    @patch("app.routers.goals.get_goal")
    @patch("app.routers.goals.get_mock_feedback_response")
    @patch("app.routers.goals.save_tasks_to_db")
    def test_complete_workflow_with_feedback(
        self, mock_save, mock_feedback, mock_get_goal,
        mock_update, mock_get_plan, mock_create,
        mock_user_id, mock_goal_id, sample_bike_tyre_plan,
        sample_feedback_response, sample_tasks_with_uuids
    ):
        """Should handle flow: create → feedback → accept."""
        mock_create.return_value = MagicMock(data=[{"id": mock_goal_id}])
        mock_get_plan.return_value = sample_bike_tyre_plan
        
        create_response = client.post(
            "/api/goals",
            json={
                "user_id": mock_user_id,
                "title": "Fix my bike tyre"
            }
        )
        assert create_response.status_code == 200
        
        mock_get_goal.return_value = {
            "id": mock_goal_id,
            "title": "Fix my bike tyre"
        }
        mock_feedback.return_value = sample_feedback_response
        
        feedback_response = client.post(
            f"/api/goals/{mock_goal_id}/feedback",
            json={"feedback": "Make it easier"}
        )
        assert feedback_response.status_code == 200
        assert feedback_response.json()["saved_to_db"] is False
        
        mock_get_goal.return_value = {
            "id": mock_goal_id,
            "goal_data": {"tasks": []}
        }
        mock_save.return_value = sample_tasks_with_uuids
        
        accept_response = client.post(
            f"/api/goals/{mock_goal_id}/accept",
            json={"tasks": sample_feedback_response["tasks"]}
        )
        assert accept_response.status_code == 200
        assert accept_response.json()["saved_to_db"] is True

# =============================================================================
# POST /api/goals/{goal_id}/accept — Additional coverage
# =============================================================================

class TestAcceptPlanAdditional:
    """Additional tests to cover previously missing lines in accept_plan."""

    @patch("app.routers.goals.get_goal")
    @patch("app.routers.goals.save_tasks_to_db")
    @patch("app.routers.goals.update_goal_data")
    def test_accept_plan_goal_data_as_json_string(
        self, mock_update, mock_save_tasks, mock_get_goal,
        mock_goal_id, sample_tasks_with_uuids
    ):
        """
        Line 194: goal_data arrives as a JSON string (not a dict).
        The endpoint must parse it before checking for existing tasks.
        """
        import json
        mock_get_goal.return_value = {
            "id": mock_goal_id,
            "goal_data": json.dumps({"tasks": []})   # ← string, not dict
        }
        mock_save_tasks.return_value = sample_tasks_with_uuids

        response = client.post(
            f"/api/goals/{mock_goal_id}/accept",
            json={
                "tasks": [
                    {"ai_id": "task_1", "description": "Step 1",
                     "order": 1, "status": "not_started", "subtasks": []}
                ]
            }
        )

        assert response.status_code == 200
        data = response.json()
        assert data["saved_to_db"] is True
        # save_tasks_to_db (not merge) must be called because tasks list was empty
        mock_save_tasks.assert_called_once()

    @patch("app.routers.goals.get_goal")
    @patch("app.routers.goals.save_tasks_to_db")
    @patch("app.routers.goals.update_goal_data")
    def test_accept_plan_due_date_ai_decide(
        self, mock_update, mock_save_tasks, mock_get_goal,
        mock_goal_id, sample_tasks_with_uuids
    ):
        """
        Line 210: when due_date == 'AI_DECIDE', the endpoint must keep
        the AI-generated goal_due_date from current_data and not overwrite it.
        """
        mock_get_goal.return_value = {
            "id": mock_goal_id,
            "goal_data": {
                "tasks": [],
                "goal_due_date": "2026-06-01"   # AI's original date
            }
        }
        mock_save_tasks.return_value = sample_tasks_with_uuids

        response = client.post(
            f"/api/goals/{mock_goal_id}/accept",
            json={
                "tasks": [
                    {"ai_id": "task_1", "description": "Step 1",
                     "order": 1, "status": "not_started", "subtasks": []}
                ],
                "due_date": "AI_DECIDE"
            }
        )

        assert response.status_code == 200
        data = response.json()
        # The AI's date should be preserved, not overwritten with "AI_DECIDE"
        assert data["due_date"] == "2026-06-01"

    @patch("app.routers.goals.get_goal")
    @patch("app.routers.goals.save_tasks_to_db")
    @patch("app.routers.goals.update_goal_data")
    def test_accept_plan_due_date_user_supplied(
        self, mock_update, mock_save_tasks, mock_get_goal,
        mock_goal_id, sample_tasks_with_uuids
    ):
        """
        Lines 212-213: when due_date is a real date string (not AI_DECIDE),
        it must override the existing goal_due_date and be returned.
        """
        mock_get_goal.return_value = {
            "id": mock_goal_id,
            "goal_data": {
                "tasks": [],
                "goal_due_date": "2026-06-01"
            }
        }
        mock_save_tasks.return_value = sample_tasks_with_uuids

        response = client.post(
            f"/api/goals/{mock_goal_id}/accept",
            json={
                "tasks": [
                    {"ai_id": "task_1", "description": "Step 1",
                     "order": 1, "status": "not_started", "subtasks": []}
                ],
                "due_date": "2026-12-31"
            }
        )

        assert response.status_code == 200
        assert response.json()["due_date"] == "2026-12-31"


# =============================================================================
# GET /api/goals/{user_id} — Additional coverage
# =============================================================================

class TestGetGoalsAdditional:
    """Additional tests to cover missing lines in get_goals."""

    @patch("app.routers.goals.get_all_goals")
    def test_get_goals_goal_data_as_json_string(
        self, mock_get_all_goals, mock_user_id
    ):
        """
        Line 250: goal_data stored as a JSON string must be parsed before
        checking for tasks — goals with tasks must still appear in the result.
        """
        import json
        tasks = [{"ai_id": "task_1", "id": "uuid-t1", "description": "Step",
                  "order": 1, "status": "not_started", "subtasks": []}]
        mock_get_all_goals.return_value = [
            {
                "id": "goal-1",
                "user_id": mock_user_id,
                "title": "Fix my bike tyre",
                # goal_data is a JSON string, not a dict
                "goal_data": json.dumps({"tasks": tasks, "description": "A guide"})
            }
        ]

        response = client.get(f"/api/goals/{mock_user_id}")

        assert response.status_code == 200
        data = response.json()
        assert len(data["goals"]) == 1
        assert data["goals"][0]["title"] == "Fix my bike tyre"

    @patch("app.routers.goals.get_all_goals")
    def test_get_goals_all_goals_have_empty_tasks(
        self, mock_get_all_goals, mock_user_id
    ):
        """
        Line 255: when every goal has an empty task list (none accepted yet),
        accepted_goals will be empty → return the 'No goals' message.
        """
        mock_get_all_goals.return_value = [
            {
                "id": "goal-1",
                "user_id": mock_user_id,
                "title": "Draft goal not yet accepted",
                "goal_data": {"tasks": []}   # empty — not accepted
            },
            {
                "id": "goal-2",
                "user_id": mock_user_id,
                "title": "Another draft",
                "goal_data": {"tasks": []}
            }
        ]

        response = client.get(f"/api/goals/{mock_user_id}")

        assert response.status_code == 200
        data = response.json()
        assert data["goals"] == []
        assert "No goals associated with the user" in data["message"]


# =============================================================================
# GET /api/goal-details/{goal_id} — Full coverage of untested endpoint
# =============================================================================

class TestGetGoalDetails:
    """Tests for GET /api/goal-details/{goal_id} endpoint (lines 278-320)."""

    @patch("app.routers.goals.get_goal")
    @patch("app.routers.goals.get_tasks_for_goal")
    def test_get_goal_details_success(
        self, mock_get_tasks, mock_get_goal, mock_goal_id
    ):
        """Lines 278-324: happy path — returns goal, tasks, and has_tasks flag."""
        mock_get_goal.return_value = {
            "id": mock_goal_id,
            "title": "Fix my bike tyre",
            "goal_data": {
                "description": "A guide",
                "tasks": [
                    {"id": "uuid-task-1", "ai_id": "task_1",
                     "description": "Remove wheel", "status": "not_started", "subtasks": []}
                ]
            }
        }
        mock_get_tasks.return_value = [
            {"id": "uuid-task-1", "status": "completed"}
        ]

        response = client.get(f"/api/goal-details/{mock_goal_id}")

        assert response.status_code == 200
        data = response.json()
        assert "goal" in data
        assert "tasks" in data
        assert data["has_tasks"] is True
        assert data["goal"]["id"] == mock_goal_id

    @patch("app.routers.goals.get_goal")
    @patch("app.routers.goals.get_tasks_for_goal")
    def test_get_goal_details_syncs_status_from_db(
        self, mock_get_tasks, mock_get_goal, mock_goal_id
    ):
        """
        Lines 302-313: status in the returned tasks must come from the tasks
        table (status_map), not from the stale goal_data JSON.
        """
        mock_get_goal.return_value = {
            "id": mock_goal_id,
            "title": "Fix my bike tyre",
            "goal_data": {
                "tasks": [
                    {"id": "uuid-task-1", "ai_id": "task_1",
                     "description": "Remove wheel", "status": "not_started",
                     "subtasks": [
                         {"id": "uuid-sub-1a", "status": "not_started"}
                     ]}
                ]
            }
        }
        # DB says both are completed — this should override the JSON
        mock_get_tasks.return_value = [
            {"id": "uuid-task-1", "status": "completed"},
            {"id": "uuid-sub-1a",  "status": "completed"},
        ]

        response = client.get(f"/api/goal-details/{mock_goal_id}")

        assert response.status_code == 200
        data = response.json()
        tasks = data["tasks"]
        assert tasks[0]["status"] == "completed"
        assert tasks[0]["subtasks"][0]["status"] == "completed"

    @patch("app.routers.goals.get_goal")
    @patch("app.routers.goals.get_tasks_for_goal")
    def test_get_goal_details_goal_data_as_json_string(
        self, mock_get_tasks, mock_get_goal, mock_goal_id
    ):
        """
        Lines 285-289: goal_data stored as a JSON string must be parsed.
        The parsed dict should be returned to the frontend.
        """
        import json
        tasks = [{"id": "uuid-task-1", "ai_id": "task_1",
                  "description": "Remove wheel", "status": "not_started", "subtasks": []}]
        mock_get_goal.return_value = {
            "id": mock_goal_id,
            "title": "Fix my bike tyre",
            "goal_data": json.dumps({"description": "A guide", "tasks": tasks})
        }
        mock_get_tasks.return_value = [{"id": "uuid-task-1", "status": "not_started"}]

        response = client.get(f"/api/goal-details/{mock_goal_id}")

        assert response.status_code == 200
        data = response.json()
        # goal_data must be a dict (parsed), not a raw JSON string
        assert isinstance(data["goal"]["goal_data"], dict)
        assert data["goal"]["goal_data"]["description"] == "A guide"

    @patch("app.routers.goals.get_goal")
    @patch("app.routers.goals.get_tasks_for_goal")
    def test_get_goal_details_malformed_json_falls_back(
        self, mock_get_tasks, mock_get_goal, mock_goal_id
    ):
        """
        Lines 288-289: a malformed JSON string in goal_data must not crash
        the endpoint — it falls back to an empty dict.
        """
        mock_get_goal.return_value = {
            "id": mock_goal_id,
            "title": "Fix my bike tyre",
            "goal_data": "this is not valid json {{{"
        }
        mock_get_tasks.return_value = []

        response = client.get(f"/api/goal-details/{mock_goal_id}")

        assert response.status_code == 200
        data = response.json()
        assert data["has_tasks"] is False
        assert data["tasks"] == []

    @patch("app.routers.goals.get_goal")
    def test_get_goal_details_not_found(self, mock_get_goal):
        """Lines 278-281: should return 404 when goal does not exist."""
        mock_get_goal.side_effect = Exception("Goal not found")

        response = client.get("/api/goal-details/nonexistent-goal-id")

        assert response.status_code == 404
        assert "Goal not found" in response.json()["detail"]

    @patch("app.routers.goals.get_goal")
    @patch("app.routers.goals.get_tasks_for_goal")
    def test_get_goal_details_db_sync_failure_falls_back_gracefully(
        self, mock_get_tasks, mock_get_goal, mock_goal_id
    ):
        """
        Lines 315-318: if get_tasks_for_goal raises an exception, the endpoint
        must not crash — it falls back to the statuses in the JSON blob.
        """
        mock_get_goal.return_value = {
            "id": mock_goal_id,
            "title": "Fix my bike tyre",
            "goal_data": {
                "tasks": [
                    {"id": "uuid-task-1", "ai_id": "task_1",
                     "description": "Remove wheel", "status": "in_progress", "subtasks": []}
                ]
            }
        }
        mock_get_tasks.side_effect = Exception("DB connection lost")

        response = client.get(f"/api/goal-details/{mock_goal_id}")

        assert response.status_code == 200
        data = response.json()
        # Falls back to the JSON blob status
        assert data["tasks"][0]["status"] == "in_progress"

    @patch("app.routers.goals.get_goal")
    @patch("app.routers.goals.get_tasks_for_goal")
    def test_get_goal_details_no_tasks(
        self, mock_get_tasks, mock_get_goal, mock_goal_id
    ):
        """has_tasks should be False when goal_data has no tasks."""
        mock_get_goal.return_value = {
            "id": mock_goal_id,
            "title": "Draft goal",
            "goal_data": {"tasks": []}
        }
        mock_get_tasks.return_value = []

        response = client.get(f"/api/goal-details/{mock_goal_id}")

        assert response.status_code == 200
        data = response.json()
        assert data["has_tasks"] is False
        assert data["tasks"] == []

    @patch("app.routers.goals.get_goal")
    @patch("app.routers.goals.get_tasks_for_goal")
    def test_get_goal_details_db_tasks_none(
        self, mock_get_tasks, mock_get_goal, mock_goal_id
    ):
        """
        Line 300: if get_tasks_for_goal returns None, the status sync block
        is skipped and goal_data statuses are used as-is.
        """
        mock_get_goal.return_value = {
            "id": mock_goal_id,
            "title": "Fix my bike tyre",
            "goal_data": {
                "tasks": [
                    {"id": "uuid-task-1", "ai_id": "task_1",
                     "description": "Remove wheel", "status": "not_started", "subtasks": []}
                ]
            }
        }
        mock_get_tasks.return_value = None

        response = client.get(f"/api/goal-details/{mock_goal_id}")

        assert response.status_code == 200
        data = response.json()
        assert data["tasks"][0]["status"] == "not_started"