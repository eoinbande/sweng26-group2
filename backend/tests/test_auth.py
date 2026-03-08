from fastapi.testclient import TestClient
from app.main import app
from unittest.mock import patch

client = TestClient(app)

#TEST AUTHENTICATION: (AT LEAST 4 TESTS) try to get full coverage in profile creation


#We will run the test by mocking the DB

#Test: check if we can successfully create an user
@patch("app.routers.auth.create_user")
def test_user_creation(mock_create_user):
    mock_create_user.return_value.data = [
        {
            "user_id": "123",
            "name": "Alex",
            "email": "alex@test.com"
        }
    ]

    response = client.post("/api/profiles", json = {
        "user_id": "123",
        "name": "Alex",
        "email": "alex@test.com"
    })

    assert response.status_code == 200 #check if we get the correct code
    assert response.json()["message"] == "User successfully created"
    assert response.json()["user"][0]["email"] == "alex@test.com"

#Test: check if user fails to sign up if they do not provide email
def test_no_email():
    response = client.post("/api/profiles", json= {
        "user_id": "123",
        "name": "Alex"
    })

    assert response.status_code == 422 #missing email, invalid!

#Test: check if user fails to sign up if they do not provide user
@patch("app.routers.auth.create_user")
def test_empty_name(mock_create_user):
    response = client.post("/api/profiles", json = {
        "user_id": "123",
        "name": "",
        "email": "alex@test.com"
    }) 

    assert response.status_code == 422 #check if we get the correct code


#Test: Database failure
@patch("app.routers.auth.create_user")
def test_create_db_failure(mock_create_user):
    mock_create_user.side_effect = Exception("DB Error")

    response = client.post("/api/profiles", json = {
        "user_id": "123",
        "name": "Alex",
        "email": "alex@test.com"
    })

    assert response.status_code == 500 #check if we get the correct code!


