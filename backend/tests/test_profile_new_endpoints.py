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


