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