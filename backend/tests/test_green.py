from fastapi.testclient import TestClient
from app.main import app
from unittest.mock import patch, MagicMock

"""TEST FILE: test file for green computing endpoints
This file tests the functionality of the green computing endpoints
covering stats retrieval, per-goal carbon tracking, monthly stats,
carbon offset payment, and offset summary.
MOCKING DATABASE for all tests."""

client = TestClient(app)

# ──────────────────────────────────────────────
# Sample mock data
# ──────────────────────────────────────────────

SAMPLE_LOGS = [
    {
        "user_id": "user-1",
        "goal_id": "goal-1",
        "endpoint_type": "generate_plan",
        "tokens_used": 2500,
        "carbon_footprint": 0.002,
        "timestamp": "2026-03-10T12:00:00Z"
    },
    {
        "user_id": "user-1",
        "goal_id": "goal-1",
        "endpoint_type": "revise_plan",
        "tokens_used": 1800,
        "carbon_footprint": 0.00144,
        "timestamp": "2026-03-15T14:30:00Z"
    },
    {
        "user_id": "user-1",
        "goal_id": "goal-2",
        "endpoint_type": "generate_plan",
        "tokens_used": 3000,
        "carbon_footprint": 0.0024,
        "timestamp": "2026-02-20T09:00:00Z"
    }
]

SAMPLE_OFFSETS = [
    {
        "user_id": "user-1",
        "carbon_offset": 0.002,
        "amount_paid": 0.00002,
        "timestamp": "2026-03-20T10:00:00Z",
        "month": "2026-03"
    }
]


def mock_supabase_response(data):
    """Helper to create a mock Supabase response with chained methods."""
    mock_response = MagicMock()
    mock_response.data = data
    mock_chain = MagicMock()
    mock_chain.execute.return_value = mock_response
    mock_chain.eq.return_value = mock_chain
    mock_chain.select.return_value = mock_chain
    return mock_chain


# ──────────────────────────────────────────────
# GET /green/stats/{user_id} — overall stats
# ──────────────────────────────────────────────

def test_get_green_stats_with_data():
    """Test that green stats returns correct totals for a user with AI usage."""
    with patch("app.routers.green.supabase") as mock_sb:
        mock_sb.table.return_value = mock_supabase_response(SAMPLE_LOGS)
        response = client.get("/api/green/stats/user-1")

    assert response.status_code == 200
    data = response.json()
    assert data["total_ai_calls"] == 3
    assert data["total_tokens"] == 7300
    assert data["total_carbon"] == round(0.002 + 0.00144 + 0.0024, 6)


def test_get_green_stats_empty():
    """Test that green stats returns zeros when no AI usage exists."""
    with patch("app.routers.green.supabase") as mock_sb:
        mock_sb.table.return_value = mock_supabase_response([])
        response = client.get("/api/green/stats/user-1")

    assert response.status_code == 200
    data = response.json()
    assert data["total_ai_calls"] == 0
    assert data["total_tokens"] == 0
    assert data["total_carbon"] == 0


# ──────────────────────────────────────────────
# GET /green/goals/{user_id} — carbon per goal
# ──────────────────────────────────────────────

def test_carbon_per_goal_with_data():
    """Test that carbon per goal correctly groups logs by goal_id."""
    with patch("app.routers.green.supabase") as mock_sb:
        mock_sb.table.return_value = mock_supabase_response(SAMPLE_LOGS)
        response = client.get("/api/green/goals/user-1")

    assert response.status_code == 200
    data = response.json()
    assert "goal-1" in data
    assert "goal-2" in data
    assert data["goal-1"]["ai_calls"] == 2
    assert data["goal-1"]["tokens_used"] == 4300
    assert data["goal-2"]["ai_calls"] == 1
    assert data["goal-2"]["tokens_used"] == 3000


def test_carbon_per_goal_empty():
    """Test that carbon per goal returns empty dict when no logs exist."""
    with patch("app.routers.green.supabase") as mock_sb:
        mock_sb.table.return_value = mock_supabase_response([])
        response = client.get("/api/green/goals/user-1")

    assert response.status_code == 200
    data = response.json()
    assert data == {}


def test_carbon_per_goal_single_goal():
    """Test carbon per goal with all logs belonging to one goal."""
    single_goal_logs = [log for log in SAMPLE_LOGS if log["goal_id"] == "goal-1"]
    with patch("app.routers.green.supabase") as mock_sb:
        mock_sb.table.return_value = mock_supabase_response(single_goal_logs)
        response = client.get("/api/green/goals/user-1")

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert "goal-1" in data
    assert data["goal-1"]["carbon_footprint"] == round(0.002 + 0.00144, 6)


# ──────────────────────────────────────────────
# GET /green/stats/monthly/{user_id} — monthly stats
# ──────────────────────────────────────────────

def test_monthly_stats_with_data():
    """Test that monthly stats correctly groups logs by month."""
    with patch("app.routers.green.supabase") as mock_sb:
        mock_sb.table.return_value = mock_supabase_response(SAMPLE_LOGS)
        response = client.get("/api/green/stats/monthly/user-1")

    assert response.status_code == 200
    data = response.json()
    assert "2026-03" in data
    assert "2026-02" in data
    assert data["2026-03"]["ai_calls"] == 2
    assert data["2026-03"]["tokens_used"] == 4300
    assert data["2026-02"]["ai_calls"] == 1
    assert data["2026-02"]["tokens_used"] == 3000


def test_monthly_stats_empty():
    """Test that monthly stats returns empty dict when no logs exist."""
    with patch("app.routers.green.supabase") as mock_sb:
        mock_sb.table.return_value = mock_supabase_response([])
        response = client.get("/api/green/stats/monthly/user-1")

    assert response.status_code == 200
    data = response.json()
    assert data == {}


def test_monthly_stats_single_month():
    """Test monthly stats when all logs are from the same month."""
    same_month_logs = [log for log in SAMPLE_LOGS if "2026-03" in log["timestamp"]]
    with patch("app.routers.green.supabase") as mock_sb:
        mock_sb.table.return_value = mock_supabase_response(same_month_logs)
        response = client.get("/api/green/stats/monthly/user-1")

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert "2026-03" in data


# ──────────────────────────────────────────────
# POST /green/offset/pay — pay carbon offset
# ──────────────────────────────────────────────

def test_pay_offset_with_data():
    """Test that paying offset calculates correct carbon and cost."""
    march_logs = [log for log in SAMPLE_LOGS if "2026-03" in log["timestamp"]]
    with patch("app.routers.green.supabase") as mock_sb:
        mock_table = mock_supabase_response(march_logs)
        mock_insert_chain = MagicMock()
        mock_insert_chain.execute.return_value = MagicMock()
        mock_table.insert.return_value = mock_insert_chain
        mock_sb.table.return_value = mock_table
        response = client.post("/api/green/offset/pay?user_id=user-1&month=2026-03")

    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "Offset successfull"
    expected_carbon = round(0.002 + 0.00144, 6)
    assert data["carbon_offset"] == expected_carbon
    assert data["amount_paid"] == round(expected_carbon * 0.01, 6)


def test_pay_offset_no_logs():
    """Test that paying offset with no logs returns zero values."""
    with patch("app.routers.green.supabase") as mock_sb:
        mock_table = mock_supabase_response([])
        mock_insert_chain = MagicMock()
        mock_insert_chain.execute.return_value = MagicMock()
        mock_table.insert.return_value = mock_insert_chain
        mock_sb.table.return_value = mock_table
        response = client.post("/api/green/offset/pay?user_id=user-1&month=2026-03")

    assert response.status_code == 200
    data = response.json()
    assert data["carbon_offset"] == 0
    assert data["amount_paid"] == 0


def test_pay_offset_wrong_month():
    """Test that paying offset for a month with no logs returns zero."""
    with patch("app.routers.green.supabase") as mock_sb:
        mock_table = mock_supabase_response(SAMPLE_LOGS)
        mock_insert_chain = MagicMock()
        mock_insert_chain.execute.return_value = MagicMock()
        mock_table.insert.return_value = mock_insert_chain
        mock_sb.table.return_value = mock_table
        response = client.post("/api/green/offset/pay?user_id=user-1&month=2026-01")

    assert response.status_code == 200
    data = response.json()
    assert data["carbon_offset"] == 0
    assert data["amount_paid"] == 0


# ──────────────────────────────────────────────
# GET /green/offset/{user_id} — carbon offset summary
# ──────────────────────────────────────────────

def test_get_carbon_offset_with_data():
    """Test offset summary shows generated, paid, and remaining carbon."""
    with patch("app.routers.green.supabase") as mock_sb:
        call_count = [0]
        def table_side_effect(table_name):
            call_count[0] += 1
            if call_count[0] == 1:
                return mock_supabase_response(SAMPLE_LOGS)
            else:
                return mock_supabase_response(SAMPLE_OFFSETS)
        mock_sb.table.side_effect = table_side_effect
        response = client.get("/api/green/offset/user-1")

    assert response.status_code == 200
    data = response.json()
    assert "2026-03" in data
    march = data["2026-03"]
    assert march["generated_carbon"] == round(0.002 + 0.00144, 6)
    assert march["offset_paid"] == 0.002
    assert march["remaining_carbon"] >= 0


def test_get_carbon_offset_empty():
    """Test offset summary with no logs and no offsets."""
    with patch("app.routers.green.supabase") as mock_sb:
        mock_sb.table.return_value = mock_supabase_response([])
        response = client.get("/api/green/offset/user-1")

    assert response.status_code == 200
    data = response.json()
    assert data == {}


def test_get_carbon_offset_no_offsets_paid():
    """Test offset summary when user has logs but no offsets paid."""
    with patch("app.routers.green.supabase") as mock_sb:
        call_count = [0]
        def table_side_effect(table_name):
            call_count[0] += 1
            if call_count[0] == 1:
                return mock_supabase_response(SAMPLE_LOGS)
            else:
                return mock_supabase_response([])
        mock_sb.table.side_effect = table_side_effect
        response = client.get("/api/green/offset/user-1")

    assert response.status_code == 200
    data = response.json()
    assert "2026-03" in data
    assert data["2026-03"]["offset_paid"] == 0
    assert data["2026-03"]["remaining_carbon"] == data["2026-03"]["generated_carbon"]


def test_get_carbon_offset_fully_offset():
    """Test offset summary when user has fully offset their carbon."""
    logs = [SAMPLE_LOGS[0]]  # single log: 0.002 carbon
    offsets = [{"user_id": "user-1", "carbon_offset": 0.002, "month": "2026-03"}]
    with patch("app.routers.green.supabase") as mock_sb:
        call_count = [0]
        def table_side_effect(table_name):
            call_count[0] += 1
            if call_count[0] == 1:
                return mock_supabase_response(logs)
            else:
                return mock_supabase_response(offsets)
        mock_sb.table.side_effect = table_side_effect
        response = client.get("/api/green/offset/user-1")

    assert response.status_code == 200
    data = response.json()
    assert data["2026-03"]["remaining_carbon"] == 0
    assert data["2026-03"]["offset_cost_eur"] == 0


# ──────────────────────────────────────────────
# Edge cases and rounding
# ──────────────────────────────────────────────

def test_carbon_rounding():
    """Test that carbon values are properly rounded to 6 decimal places."""
    logs = [{
        "user_id": "user-1",
        "goal_id": "goal-1",
        "endpoint_type": "generate_plan",
        "tokens_used": 1000,
        "carbon_footprint": 0.00123456789,
        "timestamp": "2026-03-10T12:00:00Z"
    }]
    with patch("app.routers.green.supabase") as mock_sb:
        mock_sb.table.return_value = mock_supabase_response(logs)
        response = client.get("/api/green/stats/user-1")

    assert response.status_code == 200
    data = response.json()
    carbon_str = str(data["total_carbon"])
    decimal_places = len(carbon_str.split(".")[1]) if "." in carbon_str else 0
    assert decimal_places <= 6


def test_multiple_goals_carbon_isolation():
    """Test that carbon per goal correctly isolates data between goals."""
    with patch("app.routers.green.supabase") as mock_sb:
        mock_sb.table.return_value = mock_supabase_response(SAMPLE_LOGS)
        response = client.get("/api/green/goals/user-1")

    assert response.status_code == 200
    data = response.json()
    goal1_carbon = data["goal-1"]["carbon_footprint"]
    goal2_carbon = data["goal-2"]["carbon_footprint"]
    total_carbon = round(goal1_carbon + goal2_carbon, 6)
    expected_total = round(sum(log["carbon_footprint"] for log in SAMPLE_LOGS), 6)
    assert total_carbon == expected_total