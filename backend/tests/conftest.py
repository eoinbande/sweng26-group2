"""
Pytest configuration for Goal Tracker Backend tests.

IMPORTANT: This file is loaded by pytest BEFORE any test files are imported.
We mock the Supabase client here so database.py never tries to make a real connection.
"""

import os
import sys
from pathlib import Path
from unittest.mock import MagicMock, patch

# ── 1. Set env vars first ────────────────────────────────────────────────────
os.environ["TESTING"] = "True"
os.environ["SUPABASE_URL"] = "https://test.supabase.co"
os.environ["SUPABASE_KEY"] = "test-key-12345"

# ── 2. Fix the Python path so `app` is importable ───────────────────────────
backend_dir = Path(__file__).parent.parent   # .../backend/
sys.path.insert(0, str(backend_dir))

# ── 3. Mock `supabase.create_client` BEFORE app.database is ever imported ───
#    This stops database.py line 6 from calling the real Supabase constructor.
mock_supabase_client = MagicMock()
sys.modules["supabase"] = MagicMock(
    create_client=MagicMock(return_value=mock_supabase_client),
    Client=MagicMock,
)

# ── 4. Mock `openai` BEFORE aicalls.py is ever imported ─────────────────────
#    pytest runs on Anaconda Python 3.11, but pip installed openai into
#    Python 3.14 — so the package isn't available to the test runner.
#    All tests that touch AI mock at the service layer anyway, so this is safe.
sys.modules["openai"] = MagicMock()

# ── 5. Now it is safe to import pytest fixtures etc. ────────────────────────
import pytest