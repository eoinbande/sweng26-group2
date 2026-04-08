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


# ──────────────────────────────────────────────
# POST /focus/plants — save a plant
# ──────────────────────────────────────────────

def test_save_alive_plant():
    """Test that a successfully completed session saves an alive plant."""
    payload = {
        "user_id": "user-1",
        "goal_id": "goal-1",
        "goal_title": "Learn Python",
        "duration": 25,
        "completed": True,
        "deep_focus": False,
        "status": "alive"
    }
    with patch("app.routers.focus.supabase") as mock_sb:
        mock_sb.table.return_value = mock_supabase_insert(SAMPLE_PLANT_ALIVE)
        response = client.post("/api/focus/plants", json=payload)

    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "alive"
    assert data["user_id"] == "user-1"
    assert data["goal_id"] == "goal-1"
    assert data["completed"] is True


def test_save_dead_plant():
    """Test that an abandoned deep focus session saves a dead plant."""
    payload = {
        "user_id": "user-1",
        "goal_id": "goal-2",
        "goal_title": "Read a book",
        "duration": 10,
        "completed": False,
        "deep_focus": True,
        "status": "dead"
    }
    with patch("app.routers.focus.supabase") as mock_sb:
        mock_sb.table.return_value = mock_supabase_insert(SAMPLE_PLANT_DEAD)
        response = client.post("/api/focus/plants", json=payload)

    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "dead"
    assert data["completed"] is False
    assert data["deep_focus"] is True


def test_save_plant_without_goal_title():
    """Test that goal_title is optional and can be omitted."""
    payload = {
        "user_id": "user-1",
        "goal_id": "goal-3",
        "duration": 50,
        "completed": True,
        "deep_focus": True,
        "status": "alive"
    }
    with patch("app.routers.focus.supabase") as mock_sb:
        mock_sb.table.return_value = mock_supabase_insert(SAMPLE_PLANT_NO_TITLE)
        response = client.post("/api/focus/plants", json=payload)

    assert response.status_code == 200
    data = response.json()
    assert data["goal_title"] is None
    assert data["status"] == "alive"


def test_save_plant_invalid_status():
    """Test that an invalid status value returns a 400 error."""
    payload = {
        "user_id": "user-1",
        "goal_id": "goal-1",
        "duration": 25,
        "completed": True,
        "deep_focus": False,
        "status": "wilting"  # invalid
    }
    with patch("app.routers.focus.supabase"):
        response = client.post("/api/focus/plants", json=payload)

    assert response.status_code == 400
    assert response.json()["detail"] == "status must be 'alive' or 'dead'"


def test_save_plant_empty_status():
    """Test that an empty status string returns a 400 error."""
    payload = {
        "user_id": "user-1",
        "goal_id": "goal-1",
        "duration": 25,
        "completed": True,
        "deep_focus": False,
        "status": ""
    }
    with patch("app.routers.focus.supabase"):
        response = client.post("/api/focus/plants", json=payload)

    assert response.status_code == 400
    assert response.json()["detail"] == "status must be 'alive' or 'dead'"


def test_save_plant_missing_required_fields():
    """Test that omitting required fields returns a 422 validation error."""
    payload = {
        "user_id": "user-1",
        # goal_id, duration, completed, deep_focus, status all missing
    }
    response = client.post("/api/focus/plants", json=payload)
    assert response.status_code == 422


# ──────────────────────────────────────────────
# GET /focus/plants/{user_id} — get garden
# ──────────────────────────────────────────────

def test_get_plants_with_data():
    """Test that a user's garden returns all plants newest first."""
    plants = [SAMPLE_PLANT_DEAD, SAMPLE_PLANT_ALIVE]  # newest first
    with patch("app.routers.focus.supabase") as mock_sb:
        mock_sb.table.return_value = mock_supabase_select(plants)
        response = client.get("/api/focus/plants/user-1")

    assert response.status_code == 200
    data = response.json()
    assert "plants" in data
    assert len(data["plants"]) == 2
    assert data["plants"][0]["id"] == "plant-uuid-2"  # newest first
    assert data["plants"][1]["id"] == "plant-uuid-1"


def test_get_plants_empty_garden():
    """Test that a user with no plants returns an empty list."""
    with patch("app.routers.focus.supabase") as mock_sb:
        mock_sb.table.return_value = mock_supabase_select([])
        response = client.get("/api/focus/plants/user-1")

    assert response.status_code == 200
    data = response.json()
    assert "plants" in data
    assert data["plants"] == []


def test_get_plants_single_plant():
    """Test that a garden with one plant returns a list of one."""
    with patch("app.routers.focus.supabase") as mock_sb:
        mock_sb.table.return_value = mock_supabase_select([SAMPLE_PLANT_ALIVE])
        response = client.get("/api/focus/plants/user-1")

    assert response.status_code == 200
    data = response.json()
    assert len(data["plants"]) == 1
    assert data["plants"][0]["status"] == "alive"


def test_get_plants_different_user():
    """Test that fetching plants for a different user returns their own garden."""
    other_plant = {**SAMPLE_PLANT_ALIVE, "user_id": "user-2", "id": "plant-uuid-99"}
    with patch("app.routers.focus.supabase") as mock_sb:
        mock_sb.table.return_value = mock_supabase_select([other_plant])
        response = client.get("/api/focus/plants/user-2")

    assert response.status_code == 200
    data = response.json()
    assert data["plants"][0]["user_id"] == "user-2"


def test_get_plants_contains_alive_and_dead():
    """Test that a garden can contain both alive and dead plants."""
    plants = [SAMPLE_PLANT_ALIVE, SAMPLE_PLANT_DEAD, SAMPLE_PLANT_NO_TITLE]
    with patch("app.routers.focus.supabase") as mock_sb:
        mock_sb.table.return_value = mock_supabase_select(plants)
        response = client.get("/api/focus/plants/user-1")

    assert response.status_code == 200
    data = response.json()
    statuses = {p["status"] for p in data["plants"]}
    assert "alive" in statuses
    assert "dead" in statuses
    assert len(data["plants"]) == 3