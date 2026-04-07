"""
Additional tests for app/routers/profile.py
covering gaps left by the original test suite.

Run alongside the existing file:
    pytest test_profile_endpoints.py test_profile_endpoints_extra.py -v
"""

import json
import pytest
from datetime import datetime, timedelta, timezone
from unittest.mock import patch

from fastapi.testclient import TestClient

from app.main import app
from app.routers.profile import _parse_date, _is_goal_completed

client = TestClient(app)


