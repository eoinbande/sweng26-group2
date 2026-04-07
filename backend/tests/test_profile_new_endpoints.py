"""
Additional tests for app/routers/profile.py
covering gaps left by the original test suite.

Run alongside the existing file:
    pytest test_profile_endpoints.py test_profile_endpoints_extra.py -v
"""

import json
import pytest
from datetime import datetime, timedelta, timezone
from unittest.mock import patch

from fastapi.testclient import TestClient

from app.main import app
from app.routers.profile import _parse_date, _is_goal_completed

client = TestClient(app)


# =============================================================================
# Fixtures (mirrors original file so this file can run standalone too)
# =============================================================================

@pytest.fixture
def uid():
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


# =============================================================================
# _parse_date – extra branches
# =============================================================================

class TestParseDateExtra:

    def test_microseconds_no_timezone_gets_utc(self):
        """Naive datetime with microseconds should be made UTC-aware."""
        dt = _parse_date("2025-06-15T10:30:00.654321")
        assert dt is not None
        assert dt.tzinfo == timezone.utc
        assert dt.microsecond == 654321

    def test_whitespace_string_returns_none(self):
        """A string that is all whitespace is not a valid date."""
        assert _parse_date("   ") is None

    def test_partial_date_string_returns_none(self):
        """Partial / malformed strings should not parse."""
        assert _parse_date("2025-06") is None


# =============================================================================
# _is_goal_completed – extra branches
# =============================================================================

class TestIsGoalCompletedExtra:

    @patch("app.routers.profile.supabase")
    def test_returns_false_when_data_is_none(self, mock_supabase):
        """Supabase returning None instead of [] should be treated as no tasks."""
        mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value.data = None
        assert _is_goal_completed("goal-x") is False

    @patch("app.routers.profile.supabase")
    def test_single_completed_task_returns_true(self, mock_supabase):
        mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value.data = [
            {"status": "completed"}
        ]
        assert _is_goal_completed("goal-x") is True

    @patch("app.routers.profile.supabase")
    def test_single_pending_task_returns_false(self, mock_supabase):
        mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value.data = [
            {"status": "pending"}
        ]
        assert _is_goal_completed("goal-x") is False


# =============================================================================
# GET /api/profile/{user_id}/streak – extra branches
# =============================================================================

class TestGetStreakExtra:

    @patch("app.routers.profile._get_all_tasks_for_user")
    def test_tasks_with_null_updated_at_are_ignored(self, mock_tasks, uid):
        """Tasks missing updated_at must not crash and must not inflate the streak."""
        mock_tasks.return_value = [
            {"status": "completed", "updated_at": None},
            {"status": "completed", "updated_at": None},
        ]
        response = client.get(f"/api/profile/{uid}/streak")
        assert response.status_code == 200
        assert response.json()["current_streak"] == 0

    @patch("app.routers.profile._get_all_tasks_for_user")
    def test_streak_only_from_yesterday_is_one(self, mock_tasks, uid, yesterday_str):
        """Activity only on yesterday still counts as a streak of 1."""
        mock_tasks.return_value = [{"status": "completed", "updated_at": yesterday_str}]
        response = client.get(f"/api/profile/{uid}/streak")
        assert response.json()["current_streak"] == 1

    @patch("app.routers.profile._get_all_tasks_for_user")
    def test_long_consecutive_streak(self, mock_tasks, uid):
        """Streak spanning 7 consecutive days ending today should be 7."""
        now = datetime.now(timezone.utc)
        tasks = [
            {
                "status": "completed",
                "updated_at": (now - timedelta(days=i)).strftime("%Y-%m-%dT%H:%M:%S+00:00"),
            }
            for i in range(7)
        ]
        mock_tasks.return_value = tasks
        response = client.get(f"/api/profile/{uid}/streak")
        assert response.json()["current_streak"] == 7

    @patch("app.routers.profile._get_all_tasks_for_user")
    def test_non_completed_tasks_do_not_extend_streak(self, mock_tasks, uid, today_str, yesterday_str):
        """in_progress tasks on yesterday must not extend a today-only streak."""
        mock_tasks.return_value = [
            {"status": "completed",   "updated_at": today_str},
            {"status": "in_progress", "updated_at": yesterday_str},
        ]
        response = client.get(f"/api/profile/{uid}/streak")
        assert response.json()["current_streak"] == 1


# =============================================================================
# GET /api/profile/{user_id}/goals-completed – extra branch
# =============================================================================

class TestGetGoalsCompletedExtra:

    @patch("app.routers.profile.get_all_goals")
    @patch("app.routers.profile._is_goal_completed")
    def test_returns_correct_user_id(self, mock_completed, mock_get_goals, uid):
        mock_get_goals.return_value = []
        mock_completed.return_value = False
        response = client.get(f"/api/profile/{uid}/goals-completed")
        assert response.json()["user_id"] == uid


