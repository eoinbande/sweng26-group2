from fastapi.testclient import TestClient
from app.main import app
from unittest.mock import patch, MagicMock

"""TEST FILE: test file for focus plant endpoints
This file tests the functionality of the focus garden endpoints
covering plant creation (alive/dead), invalid status rejection,
and garden retrieval.
MOCKING DATABASE for all tests."""

client = TestClient(app)

# ──────────────────────────────────────────────
# Sample mock data
# ──────────────────────────────────────────────

SAMPLE_PLANT_ALIVE = {
    "id": "plant-uuid-1",
    "user_id": "user-1",
    "goal_id": "goal-1",
    "goal_title": "Learn Python",
    "duration": 25,
    "completed": True,
    "deep_focus": False,
    "status": "alive",
    "created_at": "2026-03-10T12:00:00Z"
}

SAMPLE_PLANT_DEAD = {
    "id": "plant-uuid-2",
    "user_id": "user-1",
    "goal_id": "goal-2",
    "goal_title": "Read a book",
    "duration": 10,
    "completed": False,
    "deep_focus": True,
    "status": "dead",
    "created_at": "2026-03-11T09:00:00Z"
}

SAMPLE_PLANT_NO_TITLE = {
    "id": "plant-uuid-3",
    "user_id": "user-1",
    "goal_id": "goal-3",
    "goal_title": None,
    "duration": 50,
    "completed": True,
    "deep_focus": True,
    "status": "alive",
    "created_at": "2026-03-12T15:00:00Z"
}


def mock_supabase_insert(return_data):
    """Helper to mock a Supabase insert chain returning a single row."""
    mock_response = MagicMock()
    mock_response.data = [return_data]
    mock_chain = MagicMock()
    mock_chain.execute.return_value = mock_response
    mock_chain.insert.return_value = mock_chain
    return mock_chain


def mock_supabase_select(return_data):
    """Helper to mock a Supabase select/filter chain returning a list."""
    mock_response = MagicMock()
    mock_response.data = return_data
    mock_chain = MagicMock()
    mock_chain.execute.return_value = mock_response
    mock_chain.select.return_value = mock_chain
    mock_chain.eq.return_value = mock_chain
    mock_chain.order.return_value = mock_chain
    return mock_chain


