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