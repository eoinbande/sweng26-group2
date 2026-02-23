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

#shared fixtures

GOAL_ID = "goal-uuid-1234"
TASK_1_ID = "task-uuid-0001"
TASK_2_ID = "task-uuid-0002"
SUB_1A_ID = "sub-uuid-001a"

def _create_mock_supabase():
    """Returns a new MagicMock that mimics a supabase client"""
    return MagicMock()

def _chain(return_value):
    """
    Helper: every chained method (table/select/eq/…/execute) returns
    a mock whose .execute() gives back ``return_value``.
    """
    m = MagicMock()
    m.return_value = m
    m.execute.return_value == return_value
    return m

# create_goal - return correct structure

class TestCreateGoal:

    def test_create_goal_returns_supabase_response(self):
        #should call supabase.table('goals').insert(...).exacute() and return whats in the db
        fake_result = MagicMock()
        fake_result.data = [{"id": GOAL_ID, "user_id": "user-1", "title": "Fix my bike tyre"}]

        with patch("app.Tables.supabase") as mock_sb:
            mock_sb.table.return_value.insert.return_value.execute.return_value = fake_result

            result = create_goal(user_id="user-1", title="Fix my bike tyre")

        assert result is fake_result
        inserted_data = mock_sb.table.return_value.insert.call_args[0][0]
        assert inserted_data["user_id"] == "user-1"
        assert inserted_data["title"] == "Fix my bike tyre"

    def test_create_goal_stores_empty_task_list(self):
        """create_goal must store goal_data with an empty tasks list."""
        fake_result = MagicMock()
        fake_result.data = [{"id": GOAL_ID}]

        with patch("app.Tables.supabase") as mock_sb:
            mock_sb.table.return_value.insert.return_value.execute.return_value = fake_result

            create_goal(user_id="user-1", title="My Goal")

        inserted_data = mock_sb.table.return_value.insert.call_args[0][0]
        goal_data = json.loads(inserted_data["goal_data"])
        assert goal_data["tasks"] == []