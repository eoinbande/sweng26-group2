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

# save_tasks_to_db , gives UUIDs to th=asks and subtasks

class TestSaveTasksToDb:

    def _fake_goal_with_data(self, tasks=None):
        #return a fake get_goals() response with goal_data
        return {
            "id": GOAL_ID,
            "goal_data": json.dumps({"tasks": tasks or [], "description": "A goal"})
        }
    
    def test_assigns_vvid_to_tasks_without_id(self):
        #tasks with no 'id' will get a UUID
        tasks = [
            {"ai_id": "task_1", "description": "Step 1", "order": 1, "status": "not_started",
             "subtasks": []},
        ]

        with patch("app.Tables.supabase") as mock_sb, \
             patch("app.Tables.get_goal") as mock_get_goal:
            mock_get_goal.return_value = self._fake_goal_with_data()
            mock_sb.table.return_value.update.return_value.eq.return_value.execute.return_value = MagicMock()
            mock_sb.table.return_value.upsert.return_value.execute.return_value = MagicMock()

            result = save_tasks_to_db(GOAL_ID, tasks)

        assert result[0]["id"] is not None
        assert len(result[0]["id"]) > 0
    
    def test_assigns_vvid_to_subtasks_without_id(self):
        #subtasks with no id will be given one
        tasks = [
            {
                "ai_id": "task_1", "description": "Step 1", "order": 1,
                "status": "not_started",
                "subtasks": [
                    {"ai_id": "task_1a", "description": "Sub step", "order": 1, "status": "not_started"}
                ]
            }
        ]

        with patch("app.Tables.supabase") as mock_sb, \
             patch("app.Tables.get_goal") as mock_get_goal:
            mock_get_goal.return_value = self._fake_goal_with_data()
            mock_sb.table.return_value.update.return_value.eq.return_value.execute.return_value = MagicMock()
            mock_sb.table.return_value.upsert.return_value.execute.return_value = MagicMock()

            result = save_tasks_to_db(GOAL_ID, tasks)

        assert result[0]["subtasks"][0]["id"] is not None

    def test_preseves_existing_ids(self):
        #tasks with ids must keep them 
        tasks = [
            {"ai_id": "task_1", "id": TASK_1_ID, "description": "Step 1",
             "order": 1, "status": "not_started", "subtasks": []},
        ]

        with patch("app.Tables.supabase") as mock_sb, \
             patch("app.Tables.get_goal") as mock_get_goal:
            mock_get_goal.return_value = self._fake_goal_with_data()
            mock_sb.table.return_value.update.return_value.eq.return_value.execute.return_value = MagicMock()
            mock_sb.table.return_value.upsert.return_value.execute.return_value = MagicMock()

            result = save_tasks_to_db(GOAL_ID, tasks)

        assert result[0]["id"] == TASK_1_ID