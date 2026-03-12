from fastapi.testclient import TestClient
from app.main import app
from unittest.mock import patch
from datetime import datetime, timedelta, timezone
 
from app.routers.profile import _parse_date, _is_goal_completed, _get_all_tasks_for_user
 
client = TestClient(app)
 
USER_ID = "user-123"
 