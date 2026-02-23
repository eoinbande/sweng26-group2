"""
Unit tests for Tables.py — database functions with mocked Supabase.

All Supabase calls are mocked so no real DB connection is needed.
The conftest.py already patches supabase.create_client globally, but
we patch app.Tables.supabase directly here for precise per-test control.
"""

import json
import pytest
from unittest.mock import MagicMock, patch, call