import pytest
import json
from datetime import datetime, timedelta, timezone
from fastapi.testclient import TestClient
from unittest.mock import MagicMock
 
from app.main import app
from app.routers.profile import _parse_date, _is_goal_completed, _get_all_tasks_for_user
 
client = TestClient(app)
USER_ID = "user-123"
 
 
# =============================================================================
# FIXTURES
# =============================================================================
 
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
def completed_task_today(today_str):
    return {"status": "completed", "updated_at": today_str, "due_date": None}
 
@pytest.fixture
def mock_supabase(monkeypatch):
    mock = MagicMock()
    monkeypatch.setattr("app.routers.profile.supabase", mock)
    return mock
 
@pytest.fixture
def mock_get_goals(monkeypatch):
    def _set(return_value):
        monkeypatch.setattr("app.routers.profile.get_all_goals", lambda _: return_value)
    return _set
 
@pytest.fixture
def mock_get_tasks(monkeypatch):
    def _set(return_value):
        monkeypatch.setattr("app.routers.profile._get_all_tasks_for_user", lambda _: return_value)
    return _set
 
@pytest.fixture
def mock_is_completed(monkeypatch):
    def _set(return_value):
        monkeypatch.setattr("app.routers.profile._is_goal_completed", lambda _: return_value)
    return _set