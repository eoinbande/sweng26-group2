from fastapi.testclient import TestClient
from app.main import app
from unittest.mock import patch
from datetime import datetime, timedelta, timezone
 
from app.routers.profile import _parse_date, _is_goal_completed, _get_all_tasks_for_user
 
client = TestClient(app)
 
USER_ID = "user-123"
 

class TestParseDate:
 
    def test_returns_none_for_none(self):
        assert _parse_date(None) is None
 
    def test_returns_none_for_empty_string(self):
        assert _parse_date("") is None
 
    def test_returns_none_for_invalid_string(self):
        assert _parse_date("not-a-date") is None

    def test_parse_date_only(self):
        dt =_parse_date("2025-06-15")
        assert dt is not None
        assert dt.year == 2025
        assert dt.month == 6
        assert dt.day == 15

    def test_parses_datetime_without_timezone(self):
        dt = _parse_date("2025-06-15T10:30:00")
        assert dt is not None
        assert dt.tzinfo == timezone.utc  # should be filled in as UTC

    def test_parses_datetime_with_timezones(self):
        dt = _parse_date("2025-06-15T10:30:00+00:00")
        assert dt is not None
        assert dt.hour == 10
    
    def test_parses_datetime_with_microseconds(self):
        dt = _parse_date("2025-06-15T10:30:00.123456+00:00")
        assert dt is not None
        assert dt.microsecond == 123456