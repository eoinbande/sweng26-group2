from fastapi.testclient import TestClient
from app.main import app
from unittest.mock import patch
from datetime import datetime, timedelta
 
"""TEST FILE: test file for schedule endpoints
This file tests the functionality of the schedule endpoints
covering tasks by date, upcoming tasks, and upcoming goals.
MOCKING DATABASE for all tests."""
 
client = TestClient(app)

#sample mock data

TODAY = datetime.utcnow().strftime("%Y-%m-%d")
YESTERDAY = (datetime.utcnow() - timedelta(days=1)).strftime("%Y-%m-%d")
IN_7_DAYS = (datetime.utcnow() + timedelta(days=7)).strftime("%Y-%m-%d")
IN_14_DAYS = (datetime.utcnow() + timedelta(days=14)).strftime("%Y-%m-%d")
IN_20_DAYS = (datetime.utcnow() + timedelta(days=20)).strftime("%Y-%m-%d")
IN_35_DAYS = (datetime.utcnow() + timedelta(days=35)).strftime("%Y-%m-%d")