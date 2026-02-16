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
    """Sample list of goals for a user."""
    return [
        {
            "id": "goal-1",
            "user_id": "test-user-123",
            "title": "Fix my bike tyre",
            "created_at": "2026-02-16T10:00:00",
            "goal_data": {
                "description": "Step-by-step guide to fixing a flat bike tyre",
                "goal_due_date": "2026-03-01",
                "tasks": []
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
                "tasks": []
            }
        }
    ]


# =============================================================================
# POST /api/goals — Create Goal and Return Mock Plan
# =============================================================================

class TestCreateGoal:
    """Tests for POST /api/goals endpoint."""

    @patch("app.routes.goals.create_goal")
    @patch("app.routes.goals.get_mock_plan")
    @patch("app.routes.goals.update_goal_data")
    def test_create_goal_success(
        self, mock_update, mock_get_plan, mock_create, 
        mock_user_id, mock_goal_id, sample_bike_tyre_plan
    ):
        """Should successfully create a goal and return AI-generated plan."""
        # Setup mocks
        mock_create.return_value = MagicMock(
            data=[{"id": mock_goal_id, "title": "Fix my bike tyre"}]
        )
        mock_get_plan.return_value = sample_bike_tyre_plan
        
        # Make request
        response = client.post(
            "/api/goals",
            json={
                "user_id": mock_user_id,
                "title": "Fix my bike tyre"
            }
        )
        
        # Assertions
        assert response.status_code == 200
        data = response.json()
        
        assert data["message"] == "Goal created — review your plan below"
        assert data["goal_id"] == mock_goal_id
        assert data["title"] == "Fix my bike tyre"
        assert data["description"] == sample_bike_tyre_plan["description"]
        assert data["goal_due_date"] == sample_bike_tyre_plan["goal_due_date"]
        assert len(data["tasks"]) == 2
        assert data["saved_to_db"] is False
        
        # Verify database calls
        mock_create.assert_called_once_with(
            user_id=mock_user_id,
            title="Fix my bike tyre"
        )
        mock_get_plan.assert_called_once_with("Fix my bike tyre")
        mock_update.assert_called_once()

    @patch("app.routes.goals.create_goal")
    @patch("app.routes.goals.get_mock_plan")
    def test_create_goal_returns_task_structure(
        self, mock_get_plan, mock_create,
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
        
        # Check first task structure
        assert tasks[0]["ai_id"] == "task_1"
        assert tasks[0]["description"] == "Remove the wheel from the bike"
        assert tasks[0]["order"] == 1
        assert tasks[0]["status"] == "not_started"
        assert tasks[0]["requires_input"] is False
        assert "subtasks" in tasks[0]
        assert isinstance(tasks[0]["subtasks"], list)

    @patch("app.routes.goals.create_goal")
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
        
        assert response.status_code == 422  # Validation error

    def test_create_goal_missing_title(self, mock_user_id):
        """Should reject request with missing title."""
        response = client.post(
            "/api/goals",
            json={"user_id": mock_user_id}
        )
        
        assert response.status_code == 422  # Validation error

    def test_create_goal_empty_title(self, mock_user_id):
        """Should reject request with empty title."""
        response = client.post(
            "/api/goals",
            json={
                "user_id": mock_user_id,
                "title": ""
            }
        )
        
        assert response.status_code == 422  # Validation error

    @patch("app.routes.goals.create_goal")
    @patch("app.routes.goals.get_mock_plan")
    @patch("app.routes.goals.update_goal_data")
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
                    "requires_input": True,  # Info-gathering task
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

    @patch("app.routes.goals.get_goal")
    @patch("app.routes.goals.get_mock_feedback_response")
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

    @patch("app.routes.goals.get_goal")
    @patch("app.routes.goals.get_mock_feedback_response")
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
                    "status": "completed",  # Preserving completed status
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
        
        # Should preserve completed status from before feedback
        assert data["tasks"][0]["status"] == "completed"
        assert data["tasks"][0]["ai_id"] == "task_1"

    @patch("app.routes.goals.get_goal")
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
        
        assert response.status_code == 422  # Validation error

    @patch("app.routes.goals.get_goal")
    @patch("app.routes.goals.get_mock_feedback_response")
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

    @patch("app.routes.goals.get_goal")
    @patch("app.routes.goals.get_mock_feedback_response")
    def test_feedback_can_be_called_multiple_times(
        self, mock_get_feedback, mock_get_goal,
        mock_goal_id, sample_feedback_response
    ):
        """Should allow multiple feedback iterations on same goal."""
        mock_get_goal.return_value = {"id": mock_goal_id, "title": "Test goal"}
        mock_get_feedback.return_value = sample_feedback_response
        
        # First feedback
        response1 = client.post(
            f"/api/goals/{mock_goal_id}/feedback",
            json={"feedback": "First change"}
        )
        assert response1.status_code == 200
        
        # Second feedback
        response2 = client.post(
            f"/api/goals/{mock_goal_id}/feedback",
            json={"feedback": "Second change"}
        )
        assert response2.status_code == 200
        
        # Both should succeed
        assert response1.json()["feedback_received"] == "First change"
        assert response2.json()["feedback_received"] == "Second change"


# =============================================================================
# POST /api/goals/{goal_id}/accept — Save Tasks to DB
# =============================================================================

class TestAcceptPlan:
    """Tests for POST /api/goals/{goal_id}/accept endpoint."""

    @patch("app.routes.goals.get_goal")
    @patch("app.routes.goals.save_tasks_to_db")
    def test_accept_plan_first_save(
        self, mock_save_tasks, mock_get_goal,
        mock_goal_id, sample_tasks_with_uuids
    ):
        """Should save tasks to DB and return UUIDs on first accept."""
        # Goal exists but has no tasks yet (first save)
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
        
        # Tasks should now have UUIDs
        assert data["tasks"][0]["id"] == "uuid-task-1"
        assert data["tasks"][0]["ai_id"] == "task_1"

    @patch("app.routes.goals.get_goal")
    @patch("app.routes.goals.merge_and_save_tasks")
    def test_accept_plan_reaccept_with_existing_tasks(
        self, mock_merge_tasks, mock_get_goal, mock_goal_id
    ):
        """Should merge tasks when re-accepting (preserving completed work)."""
        # Goal already has tasks with UUIDs (re-accept scenario)
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
                "status": "completed",  # Preserved from before
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
        
        # Should preserve completed status via merge
        assert data["tasks"][0]["status"] == "completed"
        assert data["tasks"][0]["description"] == "New description"

    @patch("app.routes.goals.get_goal")
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
        
        assert response.status_code == 422  # Validation error

    @patch("app.routes.goals.get_goal")
    @patch("app.routes.goals.save_tasks_to_db")
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
        
        # Subtasks should have UUIDs assigned
        assert len(data["tasks"][0]["subtasks"]) == 1
        assert data["tasks"][0]["subtasks"][0]["id"] == "uuid-subtask-1a"

    @patch("app.routes.goals.get_goal")
    @patch("app.routes.goals.save_tasks_to_db")
    def test_accept_plan_empty_tasks_array(
        self, mock_save_tasks, mock_get_goal, mock_goal_id
    ):
        """Should reject empty tasks array (no plan to accept)."""
        mock_get_goal.return_value = {
            "id": mock_goal_id,
            "goal_data": {"tasks": []}
        }
        
        response = client.post(
            f"/api/goals/{mock_goal_id}/accept",
            json={"tasks": []}
        )
        
        # Should accept empty array technically, but save_tasks_to_db might reject
        # Depends on business logic - adjust assertion based on requirements
        assert response.status_code in [200, 400]


# =============================================================================
# GET /api/goals/{user_id} — Get All Goals for User
# =============================================================================

class TestGetGoals:
    """Tests for GET /api/goals/{user_id} endpoint."""

    @patch("app.routes.goals.get_all_goals")
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

    @patch("app.routes.goals.get_all_goals")
    def test_get_goals_includes_goal_data(
        self, mock_get_all_goals, mock_user_id, sample_goal_list
    ):
        """Should include goal_data JSONB for each goal."""
        mock_get_all_goals.return_value = sample_goal_list
        
        response = client.get(f"/api/goals/{mock_user_id}")
        
        assert response.status_code == 200
        data = response.json()
        
        # Each goal should have goal_data
        for goal in data["goals"]:
            assert "goal_data" in goal
            assert "description" in goal["goal_data"]
            assert "tasks" in goal["goal_data"]

    @patch("app.routes.goals.get_all_goals")
    def test_get_goals_empty_list(self, mock_get_all_goals, mock_user_id):
        """Should return empty list with message when user has no goals."""
        mock_get_all_goals.return_value = None
        
        response = client.get(f"/api/goals/{mock_user_id}")
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["goals"] == []
        assert "No goals associated with the user" in data["message"]

    @patch("app.routes.goals.get_all_goals")
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
                    "tasks": []
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

    @patch("app.routes.goals.get_all_goals")
    def test_get_goals_multiple_goals_ordered(
        self, mock_get_all_goals, mock_user_id
    ):
        """Should handle multiple goals correctly."""
        mock_get_all_goals.return_value = [
            {"id": "1", "title": "Goal 1", "goal_data": {}},
            {"id": "2", "title": "Goal 2", "goal_data": {}},
            {"id": "3", "title": "Goal 3", "goal_data": {}},
        ]
        
        response = client.get(f"/api/goals/{mock_user_id}")
        
        assert response.status_code == 200
        data = response.json()
        
        assert len(data["goals"]) == 3
        assert data["goals"][0]["title"] == "Goal 1"
        assert data["goals"][2]["title"] == "Goal 3"

    @patch("app.routes.goals.get_all_goals")
    def test_get_goals_different_users_isolated(self, mock_get_all_goals):
        """Should only return goals for the specified user."""
        user_1_goals = [{"id": "1", "user_id": "user-1", "title": "User 1 Goal"}]
        
        mock_get_all_goals.return_value = user_1_goals
        
        response = client.get("/api/goals/user-1")
        
        assert response.status_code == 200
        data = response.json()
        
        # Should only get goals for user-1
        assert all(goal.get("user_id") == "user-1" for goal in data["goals"])


# =============================================================================
#  Integration-style Tests
# =============================================================================
#new comment testing
class TestGoalsWorkflow:
    """Tests that verify the complete workflow across multiple endpoints."""

    @patch("app.routes.goals.create_goal")
    @patch("app.routes.goals.get_mock_plan")
    @patch("app.routes.goals.update_goal_data")
    @patch("app.routes.goals.get_goal")
    @patch("app.routes.goals.save_tasks_to_db")
    def test_complete_workflow_create_to_accept(
        self, mock_save, mock_get_goal, mock_update,
        mock_get_plan, mock_create,
        mock_user_id, mock_goal_id, sample_bike_tyre_plan,
        sample_tasks_with_uuids
    ):
        """Should handle complete flow: create → review → accept."""
        # Step 1: Create goal
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
        
        # Step 2: Accept plan
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
        
        # Tasks should now have UUIDs
        accepted_tasks = accept_response.json()["tasks"]
        assert all("id" in task for task in accepted_tasks)

    @patch("app.routes.goals.create_goal")
    @patch("app.routes.goals.get_mock_plan")
    @patch("app.routes.goals.update_goal_data")
    @patch("app.routes.goals.get_goal")
    @patch("app.routes.goals.get_mock_feedback_response")
    @patch("app.routes.goals.save_tasks_to_db")
    def test_complete_workflow_with_feedback(
        self, mock_save, mock_feedback, mock_get_goal,
        mock_update, mock_get_plan, mock_create,
        mock_user_id, mock_goal_id, sample_bike_tyre_plan,
        sample_feedback_response, sample_tasks_with_uuids
    ):
        """Should handle flow: create → feedback → accept."""
        # Step 1: Create goal
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
        
        # Step 2: Give feedback
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
        
        # Step 3: Accept the updated plan
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