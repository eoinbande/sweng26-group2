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

    #── 404 — category not found ──────────────────────────────────────────────
 
    @patch("app.routers.goals.supabase")
    def test_delete_category_not_found(self, mock_sb, mock_user_id):
        """Should return 404 when the category does not exist for this user."""
        mock_sb.table.return_value = _mock_supabase_chain([])  # empty → not found
 
        response = client.delete(f"/api/categories/{mock_user_id}/NonExistentCategory")
 
        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()
 
    @patch("app.routers.goals.supabase")
    def test_delete_default_category_returns_404(self, mock_sb, mock_user_id):
        """
        System default categories (Health, Work, etc.) are not stored per-user
        in the categories table, so the SELECT returns nothing → 404.
        """
        mock_sb.table.return_value = _mock_supabase_chain([])
 
        response = client.delete(f"/api/categories/{mock_user_id}/Health")
 
        assert response.status_code == 404
 
    @patch("app.routers.goals.supabase") 
    def test_delete_category_wrong_user_returns_404(self, mock_sb, mock_category_name):
        """
        A category belonging to a different user should not be found
        (the SELECT filters by both user_id and name).
        """
        mock_sb.table.return_value = _mock_supabase_chain([])
 
        response = client.delete(f"/api/categories/wrong-user-id/{mock_category_name}")
 
        assert response.status_code == 404
 
    # ── Goals are nulled out, not deleted ────────────────────────────────────
 
    @patch("app.routers.goals.supabase")
    def test_delete_category_nulls_goals_not_deletes_them(
        self, mock_sb, mock_user_id, mock_category_name
    ):
        """
        Deleting a category must null the category field on affected goals,
        NOT delete the goals themselves.
        Verified by confirming UPDATE is called on the goals table.
        """
        existing_category = [{"id": "cat-1", "user_id": mock_user_id, "name": mock_category_name}]
 
        # Track which tables are touched
        tables_called = []
 
        def table_side_effect(table_name):
            tables_called.append(table_name)
            return _mock_supabase_chain(existing_category)
 
        mock_sb.table.side_effect = table_side_effect
 
        response = client.delete(f"/api/categories/{mock_user_id}/{mock_category_name}")
 
        assert response.status_code == 200
        # goals table must be touched (for the UPDATE) and categories for the DELETE
        assert "goals" in tables_called
        assert "categories" in tables_called
 
    @patch("app.routers.goals.supabase")
    def test_delete_category_calls_supabase_three_times(
        self, mock_sb, mock_user_id, mock_category_name
    ):
        """
        The endpoint should make exactly 3 Supabase calls:
        1. SELECT  — confirm the category exists
        2. UPDATE  — null out goals using this category
        3. DELETE  — remove the category row
        """
        existing_category = [{"id": "cat-1", "user_id": mock_user_id, "name": mock_category_name}]
        mock_sb.table.return_value = _mock_supabase_chain(existing_category)
 
        client.delete(f"/api/categories/{mock_user_id}/{mock_category_name}")
 
        assert mock_sb.table.call_count == 3
 
    # ── Category name in path ────────────────────────────────────────────────
 
    @patch("app.routers.goals.supabase")
    def test_delete_category_name_with_spaces(self, mock_sb, mock_user_id):
        """Should handle category names that contain spaces (URL-encoded by the client)."""
        category_name = "My Custom Goal"
        existing_category = [{"id": "cat-2", "user_id": mock_user_id, "name": category_name}]
        mock_sb.table.return_value = _mock_supabase_chain(existing_category)
 
        response = client.delete(f"/api/categories/{mock_user_id}/My%20Custom%20Goal")
 
        assert response.status_code == 200
        assert response.json()["category"] == category_name
 
    @patch("app.routers.goals.supabase")
    def test_delete_category_name_returned_in_response(
        self, mock_sb, mock_user_id, mock_category_name
    ):
        """The deleted category name should be echoed back in the response."""
        existing_category = [{"id": "cat-1", "user_id": mock_user_id, "name": mock_category_name}]
        mock_sb.table.return_value = _mock_supabase_chain(existing_category)
 
        response = client.delete(f"/api/categories/{mock_user_id}/{mock_category_name}")
 
        assert response.json()["category"] == mock_category_name