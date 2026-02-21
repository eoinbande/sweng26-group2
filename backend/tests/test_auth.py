from fastapi.testclient import TestClient
from app.main import app
from unittest.mock import patch

client = TestClient(app)

#TEST AUTHENTICATION: (AT LEAST 5 TESTS) try to get full coverage in profile creation


#Test: check if we can successfully create an user
def test_user_creation():

