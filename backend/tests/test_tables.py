"""
Unit tests for Tables.py — database functions with mocked Supabase.

All Supabase calls are mocked so no real DB connection is needed.
The conftest.py already patches supabase.create_client globally, but
we patch app.Tables.supabase directly here for precise per-test control.
"""

import json
import pytest
from unittest.mock import MagicMock, patch, call

from app.Tables import(
    create_goal,
    save_tasks_to_db,
    merge_and_save_tasks,
    update_task_status,
    add_subtasks_to_task,
    get_completed_task_count,
    get_total_task_count,
    get_goal,
    get_tasks_for_goal 
    
)

