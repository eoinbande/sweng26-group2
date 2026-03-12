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