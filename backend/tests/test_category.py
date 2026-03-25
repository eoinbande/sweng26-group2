import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
from app.main import app
 
 
client = TestClient(app)
 
 
# =============================================================================
# Fixtures
# =============================================================================
 
@pytest.fixture
def mock_user_id():
    """Standard test user ID."""
    return "test-user-123"
 
 
@pytest.fixture
def mock_category_name():
    """Standard custom category name."""
    return "Fitness"

def _mock_supabase_chain(data):
    """
    Helper that builds a mock Supabase fluent chain ending in .execute().
    Covers .select().eq().eq().execute() and similar patterns.
    """
    mock_response = MagicMock()
    mock_response.data = data
 
    chain = MagicMock()
    chain.execute.return_value = mock_response
    chain.select.return_value = chain
    chain.eq.return_value = chain
    chain.update.return_value = chain
    chain.delete.return_value = chain
    return chain

class TestDeleteCategory:
    """Tests for DELETE /api/categories/{user_id}/{category_name}."""
 
    # ── Success ───────────────────────────────────────────────────────────────
 
    @patch("app.routers.goals.supabase")
    def test_delete_category_success(self, mock_sb, mock_user_id, mock_category_name):
        """Should delete an existing category and return a success message."""
        # First supabase call: SELECT to confirm the category exists
        # Subsequent calls: UPDATE goals, DELETE category
        existing_category = [{"id": "cat-1", "user_id": mock_user_id, "name": mock_category_name}]
        mock_sb.table.return_value = _mock_supabase_chain(existing_category)
 
        response = client.delete(f"/api/categories/{mock_user_id}/{mock_category_name}")
 
        assert response.status_code == 200
        data = response.json()
        assert data["message"] == f"Category '{mock_category_name}' deleted successfully"
        assert data["user_id"] == mock_user_id
        assert data["category"] == mock_category_name
 
    @patch("app.routers.goals.supabase")
    def test_delete_category_response_shape(self, mock_sb, mock_user_id, mock_category_name):
        """Response should always include message, user_id, and category keys."""
        existing_category = [{"id": "cat-1", "user_id": mock_user_id, "name": mock_category_name}]
        mock_sb.table.return_value = _mock_supabase_chain(existing_category)
 
        response = client.delete(f"/api/categories/{mock_user_id}/{mock_category_name}")
 
        data = response.json()
        assert "message" in data
        assert "user_id" in data
        assert "category" in data