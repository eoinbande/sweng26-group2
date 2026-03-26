import pytest
import json
from datetime import datetime, timedelta, timezone
from fastapi.testclient import TestClient
from unittest.mock import patch

from app.main import app
from app.routers.profile import _parse_date, _is_goal_completed, _get_all_tasks_for_user

client = TestClient(app)


# =============================================================================
# Fixtures
# =============================================================================

@pytest.fixture
def mock_user_id():
    return "test-user-123"


@pytest.fixture
def today_str():
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S+00:00")


@pytest.fixture
def yesterday_str():
    return (datetime.now(timezone.utc) - timedelta(days=1)).strftime("%Y-%m-%dT%H:%M:%S+00:00")


@pytest.fixture
def two_days_ago_str():
    return (datetime.now(timezone.utc) - timedelta(days=2)).strftime("%Y-%m-%dT%H:%M:%S+00:00")


@pytest.fixture
def sample_completed_tasks(today_str, yesterday_str, two_days_ago_str):
    """Three tasks completed on three consecutive days."""
    return [
        {"status": "completed", "updated_at": today_str,        "due_date": "2025-06-30", "goal_id": "goal-1"},
        {"status": "completed", "updated_at": yesterday_str,    "due_date": "2025-06-30", "goal_id": "goal-1"},
        {"status": "completed", "updated_at": two_days_ago_str, "due_date": "2025-06-30", "goal_id": "goal-1"},
    ]


@pytest.fixture
def sample_goals():
    return [
        {
            "id": "goal-1",
            "goal_data": {"goal_due_date": "2025-06-30"}
        },
        {
            "id": "goal-2",
            "goal_data": {"goal_due_date": "2025-12-31"}
        },
    ]


# =============================================================================
# Helper: _parse_date
# =============================================================================

class TestParseDate:

    def test_returns_none_for_none(self):
        assert _parse_date(None) is None

    def test_returns_none_for_empty_string(self):
        assert _parse_date("") is None

    def test_returns_none_for_invalid_string(self):
        assert _parse_date("not-a-date") is None

    def test_parses_date_only(self):
        dt = _parse_date("2025-06-15")
        assert dt is not None
        assert dt.year == 2025
        assert dt.month == 6
        assert dt.day == 15

    def test_parses_datetime_no_timezone(self):
        dt = _parse_date("2025-06-15T10:30:00")
        assert dt is not None
        assert dt.tzinfo == timezone.utc

    def test_parses_datetime_with_timezone(self):
        dt = _parse_date("2025-06-15T10:30:00+00:00")
        assert dt is not None
        assert dt.hour == 10

    def test_parses_datetime_with_microseconds(self):
        dt = _parse_date("2025-06-15T10:30:00.123456+00:00")
        assert dt is not None
        assert dt.microsecond == 123456


# =============================================================================
# Helper: _is_goal_completed
# =============================================================================

class TestIsGoalCompleted:

    @patch("app.routers.profile.supabase")
    def test_returns_false_when_no_tasks(self, mock_supabase):
        mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value.data = []
        assert _is_goal_completed("goal-1") is False

    @patch("app.routers.profile.supabase")
    def test_returns_true_when_all_completed(self, mock_supabase):
        mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value.data = [
            {"status": "completed"}, {"status": "completed"}
        ]
        assert _is_goal_completed("goal-1") is True

    @patch("app.routers.profile.supabase")
    def test_returns_false_when_one_not_started(self, mock_supabase):
        mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value.data = [
            {"status": "completed"}, {"status": "not_started"}
        ]
        assert _is_goal_completed("goal-1") is False

    @patch("app.routers.profile.supabase")
    def test_returns_false_when_one_in_progress(self, mock_supabase):
        mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value.data = [
            {"status": "completed"}, {"status": "in_progress"}
        ]
        assert _is_goal_completed("goal-1") is False


# =============================================================================
# Helper: _get_all_tasks_for_user
# =============================================================================

class TestGetAllTasksForUser:

    @patch("app.routers.profile.get_all_goals")
    def test_returns_empty_when_no_goals(self, mock_get_goals):
        mock_get_goals.return_value = []
        assert _get_all_tasks_for_user("user-1") == []

    @patch("app.routers.profile.get_all_goals")
    def test_returns_empty_when_goals_none(self, mock_get_goals):
        mock_get_goals.return_value = None
        assert _get_all_tasks_for_user("user-1") == []

    @patch("app.routers.profile.get_all_goals")
    @patch("app.routers.profile.supabase")
    def test_aggregates_tasks_across_goals(self, mock_supabase, mock_get_goals):
        mock_get_goals.return_value = [{"id": "goal-1"}, {"id": "goal-2"}]

        tasks_g1 = [{"id": "t1", "goal_id": "goal-1"}]
        tasks_g2 = [{"id": "t2", "goal_id": "goal-2"}, {"id": "t3", "goal_id": "goal-2"}]

        mock_supabase.table.return_value.select.return_value.eq.return_value.execute.side_effect = [
            type("R", (), {"data": tasks_g1})(),
            type("R", (), {"data": tasks_g2})(),
        ]

        result = _get_all_tasks_for_user("user-1")
        assert len(result) == 3


# =============================================================================
# GET /api/profile/{user_id}/streak
# =============================================================================

class TestGetStreak:

    @patch("app.routers.profile._get_all_tasks_for_user")
    def test_streak_zero_no_tasks(self, mock_tasks, mock_user_id):
        mock_tasks.return_value = []
        response = client.get(f"/api/profile/{mock_user_id}/streak")
        assert response.status_code == 200
        assert response.json()["current_streak"] == 0
        assert response.json()["user_id"] == mock_user_id

    @patch("app.routers.profile._get_all_tasks_for_user")
    def test_streak_zero_no_completed_tasks(self, mock_tasks, mock_user_id, today_str):
        mock_tasks.return_value = [{"status": "not_started", "updated_at": today_str}]
        response = client.get(f"/api/profile/{mock_user_id}/streak")
        assert response.json()["current_streak"] == 0

    @patch("app.routers.profile._get_all_tasks_for_user")
    def test_streak_one_completed_today(self, mock_tasks, mock_user_id, today_str):
        mock_tasks.return_value = [{"status": "completed", "updated_at": today_str}]
        response = client.get(f"/api/profile/{mock_user_id}/streak")
        assert response.json()["current_streak"] == 1

    @patch("app.routers.profile._get_all_tasks_for_user")
    def test_streak_one_completed_yesterday(self, mock_tasks, mock_user_id, yesterday_str):
        mock_tasks.return_value = [{"status": "completed", "updated_at": yesterday_str}]
        response = client.get(f"/api/profile/{mock_user_id}/streak")
        assert response.json()["current_streak"] == 1

    @patch("app.routers.profile._get_all_tasks_for_user")
    def test_streak_zero_last_completion_two_days_ago(self, mock_tasks, mock_user_id, two_days_ago_str):
        mock_tasks.return_value = [{"status": "completed", "updated_at": two_days_ago_str}]
        response = client.get(f"/api/profile/{mock_user_id}/streak")
        assert response.json()["current_streak"] == 0

    @patch("app.routers.profile._get_all_tasks_for_user")
    def test_streak_three_consecutive_days(self, mock_tasks, mock_user_id, sample_completed_tasks):
        mock_tasks.return_value = sample_completed_tasks
        response = client.get(f"/api/profile/{mock_user_id}/streak")
        assert response.json()["current_streak"] == 3

    @patch("app.routers.profile._get_all_tasks_for_user")
    def test_streak_breaks_on_gap(self, mock_tasks, mock_user_id, today_str, two_days_ago_str):
        mock_tasks.return_value = [
            {"status": "completed", "updated_at": today_str},
            {"status": "completed", "updated_at": two_days_ago_str},  # yesterday missing
        ]
        response = client.get(f"/api/profile/{mock_user_id}/streak")
        assert response.json()["current_streak"] == 1

    @patch("app.routers.profile._get_all_tasks_for_user")
    def test_streak_multiple_completions_same_day_count_once(self, mock_tasks, mock_user_id, today_str):
        mock_tasks.return_value = [
            {"status": "completed", "updated_at": today_str},
            {"status": "completed", "updated_at": today_str},
            {"status": "completed", "updated_at": today_str},
        ]
        response = client.get(f"/api/profile/{mock_user_id}/streak")
        assert response.json()["current_streak"] == 1


# =============================================================================
# GET /api/profile/{user_id}/goals-completed
# =============================================================================

class TestGetGoalsCompleted:

    @patch("app.routers.profile.get_all_goals")
    def test_zero_when_no_goals(self, mock_get_goals, mock_user_id):
        mock_get_goals.return_value = []
        response = client.get(f"/api/profile/{mock_user_id}/goals-completed")
        assert response.status_code == 200
        assert response.json()["goals_completed"] == 0

    @patch("app.routers.profile.get_all_goals")
    def test_zero_when_goals_none(self, mock_get_goals, mock_user_id):
        mock_get_goals.return_value = None
        response = client.get(f"/api/profile/{mock_user_id}/goals-completed")
        assert response.json()["goals_completed"] == 0

    @patch("app.routers.profile.get_all_goals")
    @patch("app.routers.profile._is_goal_completed")
    def test_counts_only_fully_completed_goals(self, mock_completed, mock_get_goals, mock_user_id):
        mock_get_goals.return_value = [{"id": "goal-1"}, {"id": "goal-2"}, {"id": "goal-3"}]
        mock_completed.side_effect = lambda gid: gid in ("goal-1", "goal-3")
        response = client.get(f"/api/profile/{mock_user_id}/goals-completed")
        assert response.json()["goals_completed"] == 2

    @patch("app.routers.profile.get_all_goals")
    @patch("app.routers.profile._is_goal_completed")
    def test_all_goals_completed(self, mock_completed, mock_get_goals, mock_user_id):
        mock_get_goals.return_value = [{"id": "goal-1"}, {"id": "goal-2"}]
        mock_completed.return_value = True
        response = client.get(f"/api/profile/{mock_user_id}/goals-completed")
        assert response.json()["goals_completed"] == 2

    @patch("app.routers.profile.get_all_goals")
    @patch("app.routers.profile._is_goal_completed")
    def test_no_goals_completed(self, mock_completed, mock_get_goals, mock_user_id):
        mock_get_goals.return_value = [{"id": "goal-1"}, {"id": "goal-2"}]
        mock_completed.return_value = False
        response = client.get(f"/api/profile/{mock_user_id}/goals-completed")
        assert response.json()["goals_completed"] == 0


# =============================================================================
# GET /api/profile/{user_id}/tasks-completed
# =============================================================================

class TestGetTasksCompleted:

    @patch("app.routers.profile._get_all_tasks_for_user")
    def test_zero_when_no_tasks(self, mock_tasks, mock_user_id):
        mock_tasks.return_value = []
        response = client.get(f"/api/profile/{mock_user_id}/tasks-completed")
        assert response.status_code == 200
        assert response.json()["tasks_completed"] == 0

    @patch("app.routers.profile._get_all_tasks_for_user")
    def test_counts_only_completed_status(self, mock_tasks, mock_user_id):
        mock_tasks.return_value = [
            {"status": "completed"},
            {"status": "completed"},
            {"status": "not_started"},
            {"status": "in_progress"},
        ]
        response = client.get(f"/api/profile/{mock_user_id}/tasks-completed")
        assert response.json()["tasks_completed"] == 2

    @patch("app.routers.profile._get_all_tasks_for_user")
    def test_includes_subtask_rows(self, mock_tasks, mock_user_id):
        # subtasks are plain rows in the tasks table, so they count the same
        mock_tasks.return_value = [
            {"status": "completed"},
            {"status": "completed"},
            {"status": "completed"},
        ]
        response = client.get(f"/api/profile/{mock_user_id}/tasks-completed")
        assert response.json()["tasks_completed"] == 3

    @patch("app.routers.profile._get_all_tasks_for_user")
    def test_returns_correct_user_id(self, mock_tasks, mock_user_id):
        mock_tasks.return_value = []
        response = client.get(f"/api/profile/{mock_user_id}/tasks-completed")
        assert response.json()["user_id"] == mock_user_id


# =============================================================================
# GET /api/profile/{user_id}/goals-completed-on-time
# =============================================================================

class TestGetGoalsCompletedOnTime:

    @patch("app.routers.profile.get_all_goals")
    @patch("app.routers.profile._get_all_tasks_for_user")
    def test_zero_when_no_goals(self, mock_tasks, mock_get_goals, mock_user_id):
        mock_get_goals.return_value = []
        mock_tasks.return_value = []
        response = client.get(f"/api/profile/{mock_user_id}/goals-completed-on-time")
        assert response.status_code == 200
        assert response.json()["goals_completed_on_time"] == 0

    @patch("app.routers.profile.get_all_goals")
    @patch("app.routers.profile._get_all_tasks_for_user")
    @patch("app.routers.profile._is_goal_completed")
    def test_skips_incomplete_goals(self, mock_completed, mock_tasks, mock_get_goals, mock_user_id):
        mock_get_goals.return_value = [{"id": "goal-1", "goal_data": {"goal_due_date": "2025-06-01"}}]
        mock_tasks.return_value = []
        mock_completed.return_value = False
        response = client.get(f"/api/profile/{mock_user_id}/goals-completed-on-time")
        assert response.json()["goals_completed_on_time"] == 0

    @patch("app.routers.profile.get_all_goals")
    @patch("app.routers.profile._get_all_tasks_for_user")
    @patch("app.routers.profile._is_goal_completed")
    def test_skips_goals_without_due_date(self, mock_completed, mock_tasks, mock_get_goals, mock_user_id):
        mock_get_goals.return_value = [{"id": "goal-1", "goal_data": {}}]
        mock_tasks.return_value = [{"goal_id": "goal-1", "status": "completed", "updated_at": "2025-06-01T10:00:00"}]
        mock_completed.return_value = True
        response = client.get(f"/api/profile/{mock_user_id}/goals-completed-on-time")
        assert response.json()["goals_completed_on_time"] == 0

    @patch("app.routers.profile.get_all_goals")
    @patch("app.routers.profile._get_all_tasks_for_user")
    @patch("app.routers.profile._is_goal_completed")
    def test_counts_goal_completed_before_due_date(self, mock_completed, mock_tasks, mock_get_goals, mock_user_id):
        mock_get_goals.return_value = [{"id": "goal-1", "goal_data": {"goal_due_date": "2025-06-30"}}]
        mock_tasks.return_value = [{"goal_id": "goal-1", "status": "completed", "updated_at": "2025-06-15T10:00:00"}]
        mock_completed.return_value = True
        response = client.get(f"/api/profile/{mock_user_id}/goals-completed-on-time")
        assert response.json()["goals_completed_on_time"] == 1

    @patch("app.routers.profile.get_all_goals")
    @patch("app.routers.profile._get_all_tasks_for_user")
    @patch("app.routers.profile._is_goal_completed")
    def test_counts_goal_completed_on_due_date(self, mock_completed, mock_tasks, mock_get_goals, mock_user_id):
        mock_get_goals.return_value = [{"id": "goal-1", "goal_data": {"goal_due_date": "2025-06-15"}}]
        mock_tasks.return_value = [{"goal_id": "goal-1", "status": "completed", "updated_at": "2025-06-15T23:59:00"}]
        mock_completed.return_value = True
        response = client.get(f"/api/profile/{mock_user_id}/goals-completed-on-time")
        assert response.json()["goals_completed_on_time"] == 1

    @patch("app.routers.profile.get_all_goals")
    @patch("app.routers.profile._get_all_tasks_for_user")
    @patch("app.routers.profile._is_goal_completed")
    def test_does_not_count_goal_completed_late(self, mock_completed, mock_tasks, mock_get_goals, mock_user_id):
        mock_get_goals.return_value = [{"id": "goal-1", "goal_data": {"goal_due_date": "2025-06-01"}}]
        mock_tasks.return_value = [{"goal_id": "goal-1", "status": "completed", "updated_at": "2025-06-15T10:00:00"}]
        mock_completed.return_value = True
        response = client.get(f"/api/profile/{mock_user_id}/goals-completed-on-time")
        assert response.json()["goals_completed_on_time"] == 0

    @patch("app.routers.profile.get_all_goals")
    @patch("app.routers.profile._get_all_tasks_for_user")
    @patch("app.routers.profile._is_goal_completed")
    def test_goal_data_stored_as_json_string(self, mock_completed, mock_tasks, mock_get_goals, mock_user_id):
        """goal_data stored as a JSON string should still be parsed correctly."""
        mock_get_goals.return_value = [{"id": "goal-1", "goal_data": json.dumps({"goal_due_date": "2025-06-30"})}]
        mock_tasks.return_value = [{"goal_id": "goal-1", "status": "completed", "updated_at": "2025-06-10T10:00:00"}]
        mock_completed.return_value = True
        response = client.get(f"/api/profile/{mock_user_id}/goals-completed-on-time")
        assert response.json()["goals_completed_on_time"] == 1

    @patch("app.routers.profile.get_all_goals")
    @patch("app.routers.profile._get_all_tasks_for_user")
    @patch("app.routers.profile._is_goal_completed")
    def test_uses_latest_task_date_as_completion_date(self, mock_completed, mock_tasks, mock_get_goals, mock_user_id):
        """The latest updated_at across all tasks determines whether the goal was on time."""
        mock_get_goals.return_value = [{"id": "goal-1", "goal_data": {"goal_due_date": "2025-06-10"}}]
        mock_tasks.return_value = [
            {"goal_id": "goal-1", "status": "completed", "updated_at": "2025-06-05T10:00:00"},
            {"goal_id": "goal-1", "status": "completed", "updated_at": "2025-06-20T10:00:00"},  # latest is after due date
        ]
        mock_completed.return_value = True
        response = client.get(f"/api/profile/{mock_user_id}/goals-completed-on-time")
        assert response.json()["goals_completed_on_time"] == 0


# =============================================================================
# GET /api/profile/{user_id}/tasks-completed-on-time
# =============================================================================

class TestGetTasksCompletedOnTime:

    @patch("app.routers.profile._get_all_tasks_for_user")
    def test_zero_when_no_tasks(self, mock_tasks, mock_user_id):
        mock_tasks.return_value = []
        response = client.get(f"/api/profile/{mock_user_id}/tasks-completed-on-time")
        assert response.status_code == 200
        assert response.json()["tasks_completed_on_time"] == 0

    @patch("app.routers.profile._get_all_tasks_for_user")
    def test_skips_tasks_without_due_date(self, mock_tasks, mock_user_id):
        mock_tasks.return_value = [{"status": "completed", "updated_at": "2025-06-01T10:00:00", "due_date": None}]
        response = client.get(f"/api/profile/{mock_user_id}/tasks-completed-on-time")
        assert response.json()["tasks_completed_on_time"] == 0

    @patch("app.routers.profile._get_all_tasks_for_user")
    def test_skips_incomplete_tasks(self, mock_tasks, mock_user_id):
        mock_tasks.return_value = [{"status": "not_started", "updated_at": "2025-06-01T10:00:00", "due_date": "2025-06-30"}]
        response = client.get(f"/api/profile/{mock_user_id}/tasks-completed-on-time")
        assert response.json()["tasks_completed_on_time"] == 0

    @patch("app.routers.profile._get_all_tasks_for_user")
    def test_counts_task_completed_before_due_date(self, mock_tasks, mock_user_id):
        mock_tasks.return_value = [{"status": "completed", "updated_at": "2025-06-01T10:00:00", "due_date": "2025-06-30"}]
        response = client.get(f"/api/profile/{mock_user_id}/tasks-completed-on-time")
        assert response.json()["tasks_completed_on_time"] == 1

    @patch("app.routers.profile._get_all_tasks_for_user")
    def test_counts_task_completed_on_due_date(self, mock_tasks, mock_user_id):
        mock_tasks.return_value = [{"status": "completed", "updated_at": "2025-06-15T23:00:00", "due_date": "2025-06-15"}]
        response = client.get(f"/api/profile/{mock_user_id}/tasks-completed-on-time")
        assert response.json()["tasks_completed_on_time"] == 1

    @patch("app.routers.profile._get_all_tasks_for_user")
    def test_does_not_count_task_completed_late(self, mock_tasks, mock_user_id):
        mock_tasks.return_value = [{"status": "completed", "updated_at": "2025-07-01T10:00:00", "due_date": "2025-06-15"}]
        response = client.get(f"/api/profile/{mock_user_id}/tasks-completed-on-time")
        assert response.json()["tasks_completed_on_time"] == 0

    @patch("app.routers.profile._get_all_tasks_for_user")
    def test_mixed_tasks_counted_correctly(self, mock_tasks, mock_user_id):
        mock_tasks.return_value = [
            {"status": "completed", "updated_at": "2025-06-01T10:00:00", "due_date": "2025-06-30"},  # on time
            {"status": "completed", "updated_at": "2025-07-01T10:00:00", "due_date": "2025-06-15"},  # late
            {"status": "completed", "updated_at": "2025-06-15T10:00:00", "due_date": "2025-06-15"},  # on time (same day)
            {"status": "not_started", "updated_at": "2025-06-01T10:00:00", "due_date": "2025-06-30"}, # not done
            {"status": "completed", "updated_at": "2025-06-01T10:00:00", "due_date": None},           # no due date
        ]
        response = client.get(f"/api/profile/{mock_user_id}/tasks-completed-on-time")
        assert response.json()["tasks_completed_on_time"] == 2

    @patch("app.routers.profile._get_all_tasks_for_user")
    def test_returns_correct_user_id(self, mock_tasks, mock_user_id):
        mock_tasks.return_value = []
        response = client.get(f"/api/profile/{mock_user_id}/tasks-completed-on-time")
        assert response.json()["user_id"] == mock_user_id