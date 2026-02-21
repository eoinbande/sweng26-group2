from fastapi.testclient import TestClient
from app.main import app
from unittest.mock import patch

client = TestClient(app)

#TEST AUTHENTICATION: (AT LEAST 5 TESTS) try to get full coverage in profile creation

#We will run the test by mocking the DB

#Test: check if we can successfully create an user
def test_user_creation(mock_create_user):
    mock_create_user.return_value.data = [
        {
            "user_id": "123",
            "name": "Alex",
            "email": "alex@test.com"
        }
    ]

    response = client.post("/profiles", json = {
        "user_id": "123",
        "name": "Alex",
        "email": "alex@test.com"
    })

    assert response.status_code == 200 #check if we get the correct code
    assert response.json()["message"] == "User successfully created"
    assert response.json()["user"][0]["email"] == "alex@test.com"
