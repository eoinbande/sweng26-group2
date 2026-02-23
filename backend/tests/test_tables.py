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

            result = create_goal(user_id="user-1", title="Fix my bike tyre", category=None)

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

            create_goal(user_id="user-1", title="My Goal", category=None)

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

    def test_preserves_existing_goal_data_feilds(self):
        #save_tasks_to_db must merge tasks into existing goal_data rather than overwriting fields like 'description' and 'goal_due_date'
        existing_data = {"tasks": [], "description": "Keep me", "goal_due_date": "2025-12-31"}
        tasks = [
            {"ai_id": "task_1", "description": "Step 1", "order": 1,
             "status": "not_started", "subtasks": []},
        ]
        captured_update_payload = {}

        def fake_update(payload):
            captured_update_payload.update(payload)
            m = MagicMock()
            m.eq.return_value.execute.return_value = MagicMock()
            return m

        with patch("app.Tables.supabase") as mock_sb, \
             patch("app.Tables.get_goal") as mock_get_goal:
            mock_get_goal.return_value = {"id": GOAL_ID, "goal_data": json.dumps(existing_data)}
            mock_sb.table.return_value.update.side_effect = fake_update
            mock_sb.table.return_value.upsert.return_value.execute.return_value = MagicMock()

            save_tasks_to_db(GOAL_ID, tasks)

        # The update payload should contain the saved goal_data JSON
        saved = json.loads(captured_update_payload["goal_data"])
        assert saved["description"] == "Keep me"
        assert saved["goal_due_date"] == "2025-12-31"
        assert len(saved["tasks"]) == 1
    
    def test_inserts_subtasks_with_correct_parent_id(self):
        """Subtask rows upserted into tasks table must have parent_id = parent task UUID."""
        parent_id = "parent-uuid-999"
        tasks = [
            {
                "ai_id": "task_1", "id": parent_id, "description": "Parent", "order": 1,
                "status": "not_started",
                "subtasks": [
                    {"ai_id": "task_1a", "description": "Child", "order": 1, "status": "not_started"}
                ]
            }
        ]

        upserted_rows = []
    
        def capture_upsert(row):
                upserted_rows.append(row)
                m = MagicMock()
                m.execute.return_value = MagicMock()
                return m

        with patch("app.Tables.supabase") as mock_sb, \
            patch("app.Tables.get_goal") as mock_get_goal:
            mock_get_goal.return_value = {"id": GOAL_ID, "goal_data": json.dumps({"tasks": []})}
            mock_sb.table.return_value.update.return_value.eq.return_value.execute.return_value = MagicMock()
            mock_sb.table.return_value.upsert.side_effect = capture_upsert

            save_tasks_to_db(GOAL_ID, tasks)

        # Second upserted row is the subtask
        subtask_row = upserted_rows[1]
        assert subtask_row["parent_id"] == parent_id
        assert subtask_row["ai_id"] == "task_1a"
    
    def test_returns_tasks_with_uuids(self):
        """Return value must be the same tasks list, now with UUIDs on every item."""
        tasks = [
            {"ai_id": "task_1", "description": "Step 1", "order": 1,
             "status": "not_started", "subtasks": [
                {"ai_id": "task_1a", "description": "Sub", "order": 1, "status": "not_started"}
             ]}
        ]

        with patch("app.Tables.supabase") as mock_sb, \
             patch("app.Tables.get_goal") as mock_get_goal:
            mock_get_goal.return_value = {"id": GOAL_ID, "goal_data": json.dumps({"tasks": []})}
            mock_sb.table.return_value.update.return_value.eq.return_value.execute.return_value = MagicMock()
            mock_sb.table.return_value.upsert.return_value.execute.return_value = MagicMock()

            result = save_tasks_to_db(GOAL_ID, tasks)

        assert "id" in result[0] and result[0]["id"]
        assert "id" in result[0]["subtasks"][0] and result[0]["subtasks"][0]["id"]


# merge and save tasks - preserves status(completed) and UUID

class TestMergeAndSaveTasks:

    def _existing_goal_data(self, tasks):
        return {"id": GOAL_ID, "goal_data": json.dumps({"tasks": tasks})}
    
    def test_preserves_completed_task_uuid_and_status(self):
        """A completed task must keep its UUID and 'completed' status after merge."""
        existing_tasks = [
            {"ai_id": "task_1", "id": TASK_1_ID, "description": "Old desc",
             "order": 1, "status": "completed", "subtasks": []},
        ]
        new_tasks = [
            {"ai_id": "task_1", "description": "Updated desc", "order": 1,
             "status": "not_started", "subtasks": []},
        ]

        with patch("app.Tables.supabase") as mock_sb, \
             patch("app.Tables.get_goal") as mock_get_goal:
            mock_get_goal.return_value = self._existing_goal_data(existing_tasks)
            mock_sb.table.return_value.delete.return_value.eq.return_value.neq.return_value.execute.return_value = MagicMock()
            mock_sb.table.return_value.update.return_value.eq.return_value.execute.return_value = MagicMock()
            mock_sb.table.return_value.upsert.return_value.execute.return_value = MagicMock()

            result = merge_and_save_tasks(GOAL_ID, new_tasks)

        assert result[0]["id"] == TASK_1_ID
        assert result[0]["status"] == "completed"

    def test_assigns_new_uuid_for_new_ai_id(self):
        """A task with a brand-new ai_id must receive a fresh UUID."""
        existing_tasks = [
            {"ai_id": "task_1", "id": TASK_1_ID, "description": "Old",
             "order": 1, "status": "not_started", "subtasks": []},
        ]
        new_tasks = [
            {"ai_id": "task_1", "description": "Old", "order": 1,
             "status": "not_started", "subtasks": []},
            {"ai_id": "task_new", "description": "Brand new task", "order": 2,
             "status": "not_started", "subtasks": []},
        ]

        with patch("app.Tables.supabase") as mock_sb, \
             patch("app.Tables.get_goal") as mock_get_goal:
            mock_get_goal.return_value = self._existing_goal_data(existing_tasks)
            mock_sb.table.return_value.delete.return_value.eq.return_value.neq.return_value.execute.return_value = MagicMock()
            mock_sb.table.return_value.update.return_value.eq.return_value.execute.return_value = MagicMock()
            mock_sb.table.return_value.upsert.return_value.execute.return_value = MagicMock()

            result = merge_and_save_tasks(GOAL_ID, new_tasks)

        new_task = next(t for t in result if t["ai_id"] == "task_new")
        assert new_task["id"] is not None
        assert new_task["id"] != TASK_1_ID

    def test_preserves_completed_subtask_status(self):
        """Completed subtasks must retain their UUID and 'completed' status."""
        existing_tasks = [
            {
                "ai_id": "task_2", "id": TASK_2_ID, "description": "Parent",
                "order": 2, "status": "not_started",
                "subtasks": [
                    {"ai_id": "task_2a", "id": SUB_1A_ID, "description": "Sub",
                     "order": 1, "status": "completed"}
                ]
            }
        ]
        new_tasks = [
            {
                "ai_id": "task_2", "description": "Parent", "order": 2,
                "status": "not_started",
                "subtasks": [
                    {"ai_id": "task_2a", "description": "Sub", "order": 1, "status": "not_started"}
                ]
            }
        ]

        with patch("app.Tables.supabase") as mock_sb, \
             patch("app.Tables.get_goal") as mock_get_goal:
            mock_get_goal.return_value = self._existing_goal_data(existing_tasks)
            mock_sb.table.return_value.delete.return_value.eq.return_value.neq.return_value.execute.return_value = MagicMock()
            mock_sb.table.return_value.update.return_value.eq.return_value.execute.return_value = MagicMock()
            mock_sb.table.return_value.upsert.return_value.execute.return_value = MagicMock()

            result = merge_and_save_tasks(GOAL_ID, new_tasks)

        sub = result[0]["subtasks"][0]
        assert sub["id"] == SUB_1A_ID
        assert sub["status"] == "completed"

class TestUpdateTaskStatus:

    def _fake_task(self, task_id, goal_id, parent_id = None):
        return{"id": task_id, "goal_id": goal_id, "parent_id": parent_id, "status": "not_started"}
    
    def _fake_goal_data(self, tasks):
        return {"id": GOAL_ID, "goal_data": json.dumps({"tasks": tasks})}
    
    def test_updates_task_status_in_tasks_table(self):
        #update_task_status must call UPDATE on the tasks table.
        fake_task = self._fake_task(TASK_1_ID, GOAL_ID)
        goal_data = self._fake_goal_data([
            {"id": TASK_1_ID, "ai_id": "task_1", "status": "not_started", "subtasks": []}
        ])

        with patch("app.Tables.supabase") as mock_sb, \
             patch("app.Tables.get_task") as mock_get_task, \
             patch("app.Tables.get_goal") as mock_get_goal:
            mock_get_task.return_value = fake_task
            mock_get_goal.return_value = goal_data
            mock_sb.table.return_value.update.return_value.eq.return_value.execute.return_value = MagicMock()

            update_task_status(TASK_1_ID, "completed")

        # The tasks table update must be called
        mock_sb.table.return_value.update.assert_called()

    def test_updates_status_in_goal_data_jsonb(self):
        #The task's status in goal_data JSON blob must also be updated.
        fake_task = self._fake_task(TASK_1_ID, GOAL_ID)
        goal_tasks = [{"id": TASK_1_ID, "ai_id": "task_1", "status": "not_started", "subtasks": []}]

        captured = {}

        def capture_update(payload):
            captured.update(payload)
            m = MagicMock()
            m.eq.return_value.execute.return_value = MagicMock()
            return m

        with patch("app.Tables.supabase") as mock_sb, \
             patch("app.Tables.get_task") as mock_get_task, \
             patch("app.Tables.get_goal") as mock_get_goal:
            mock_get_task.return_value = fake_task
            mock_get_goal.return_value = {"id": GOAL_ID, "goal_data": json.dumps({"tasks": goal_tasks})}
            mock_sb.table.return_value.update.side_effect = capture_update

            update_task_status(TASK_1_ID, "completed")

        # The last update call should have the updated goal_data JSON
        saved = json.loads(captured["goal_data"])
        updated_task = next(t for t in saved["tasks"] if t["id"] == TASK_1_ID)
        assert updated_task["status"] == "completed"

    def test_auto_completes_parent_when_all_subtasks_done(self):
        """
        If a subtask is completed and ALL siblings are now completed,
        the parent task should be auto-completed.
        """
        parent_id = "parent-uuid-9999"
        sub_id_a = "sub-uuid-aaaa"
        sub_id_b = "sub-uuid-bbbb"

        fake_subtask = {"id": sub_id_b, "goal_id": GOAL_ID, "parent_id": parent_id, "status": "not_started"}
        fake_siblings = [
            {"status": "completed"},  # sub_a already done
            {"status": "completed"},  # sub_b just completed
        ]
        goal_tasks = [
            {
                "id": parent_id, "ai_id": "task_1", "status": "not_started",
                "subtasks": [
                    {"id": sub_id_a, "status": "completed"},
                    {"id": sub_id_b, "status": "not_started"},
                ]
            }
        ]

        with patch("app.Tables.supabase") as mock_sb, \
             patch("app.Tables.get_task") as mock_get_task, \
             patch("app.Tables.get_goal") as mock_get_goal:
            mock_get_task.return_value = fake_subtask
            mock_get_goal.return_value = {"id": GOAL_ID, "goal_data": json.dumps({"tasks": goal_tasks})}
            # Siblings query returns both subtasks as completed
            mock_sb.table.return_value.select.return_value.eq.return_value.execute.return_value = MagicMock(data=fake_siblings)
            mock_sb.table.return_value.update.return_value.eq.return_value.execute.return_value = MagicMock()

            update_task_status(sub_id_b, "completed")

        # update() should have been called at least twice:
        # once for the subtask, once for the auto-completed parent
        assert mock_sb.table.return_value.update.call_count >= 2

    def test_returns_task_row(self):
        """update_task_status should return the task dict fetched from DB."""
        fake_task = self._fake_task(TASK_1_ID, GOAL_ID)
        goal_tasks = [{"id": TASK_1_ID, "ai_id": "task_1", "status": "not_started", "subtasks": []}]

        with patch("app.Tables.supabase") as mock_sb, \
             patch("app.Tables.get_task") as mock_get_task, \
             patch("app.Tables.get_goal") as mock_get_goal:
            mock_get_task.return_value = fake_task
            mock_get_goal.return_value = {"id": GOAL_ID, "goal_data": json.dumps({"tasks": goal_tasks})}
            mock_sb.table.return_value.update.return_value.eq.return_value.execute.return_value = MagicMock()

            result = update_task_status(TASK_1_ID, "in_progress")

        assert result == fake_task

# add_subtasks_to_task  assign UUID's and sets correct parent_id

class TestAddSubTasksToTask:

    def test_assigns_uuid_to_subtract(self):
        #Each subtask without an 'id' must receive a UUID.
        subtasks = [
            {"ai_id": "task_5a", "description": "Put tube back", "order": 1},
            {"ai_id": "task_5b", "description": "Fit tyre onto rim", "order": 2},
        ]
        goal_tasks = [{"id": TASK_1_ID, "ai_id": "task_5", "subtasks": []}]

        with patch("app.Tables.supabase") as mock_sb, \
             patch("app.Tables.get_goal") as mock_get_goal:
            mock_get_goal.return_value = {"id": GOAL_ID, "goal_data": json.dumps({"tasks": goal_tasks})}
            mock_sb.table.return_value.upsert.return_value.execute.return_value = MagicMock()
            mock_sb.table.return_value.update.return_value.eq.return_value.execute.return_value = MagicMock()

            result = add_subtasks_to_task(GOAL_ID, TASK_1_ID, subtasks)

        for sub in result:
            assert sub.get("id") is not None
            assert len(sub["id"]) > 0

    def test_sets_parent_id_on_upserted_rows(sefl):
        #rows inserted into task table need to have a parent id
        subtasks = [
            {"ai_id": "task_5a", "description": "Step A", "order": 1},
        ]
        goal_tasks = [{"id": TASK_1_ID, "ai_id": "task_5", "subtasks": []}]

        upserted_rows = []

        def capture_upsert(row):
            upserted_rows.append(row)
            m = MagicMock()
            m.execute.return_value = MagicMock()
            return m

        with patch("app.Tables.supabase") as mock_sb, \
             patch("app.Tables.get_goal") as mock_get_goal:
            mock_get_goal.return_value = {"id": GOAL_ID, "goal_data": json.dumps({"tasks": goal_tasks})}
            mock_sb.table.return_value.upsert.side_effect = capture_upsert
            mock_sb.table.return_value.update.return_value.eq.return_value.execute.return_value = MagicMock()

            add_subtasks_to_task(GOAL_ID, TASK_1_ID, subtasks)

        assert upserted_rows[0]["parent_id"] == TASK_1_ID
    
    def test_updates_goal_data_jsonb_with_subtasks(self):
        """The parent task's 'subtasks' in goal_data JSON must be updated."""
        subtasks = [
            {"ai_id": "task_5a", "description": "Step A", "order": 1},
        ]
        goal_tasks = [{"id": TASK_1_ID, "ai_id": "task_5", "status": "not_started", "subtasks": []}]

        captured = {}

        def capture_update(payload):
            captured.update(payload)
            m = MagicMock()
            m.eq.return_value.execute.return_value = MagicMock()
            return m

        with patch("app.Tables.supabase") as mock_sb, \
             patch("app.Tables.get_goal") as mock_get_goal:
            mock_get_goal.return_value = {"id": GOAL_ID, "goal_data": json.dumps({"tasks": goal_tasks})}
            mock_sb.table.return_value.upsert.return_value.execute.return_value = MagicMock()
            mock_sb.table.return_value.update.side_effect = capture_update

            add_subtasks_to_task(GOAL_ID, TASK_1_ID, subtasks)

        saved = json.loads(captured["goal_data"])
        parent = next(t for t in saved["tasks"] if t["id"] == TASK_1_ID)
        assert len(parent["subtasks"]) == 1
        assert parent["subtasks"][0]["ai_id"] == "task_5a"
    
    def test_returns_subtasks_with_uuids(self):
        """Return value should be the subtask list with UUIDs populated."""
        subtasks = [
            {"ai_id": "task_5a", "description": "Step A", "order": 1},
            {"ai_id": "task_5b", "description": "Step B", "order": 2},
        ]
        goal_tasks = [{"id": TASK_1_ID, "ai_id": "task_5", "subtasks": []}]

        with patch("app.Tables.supabase") as mock_sb, \
             patch("app.Tables.get_goal") as mock_get_goal:
            mock_get_goal.return_value = {"id": GOAL_ID, "goal_data": json.dumps({"tasks": goal_tasks})}
            mock_sb.table.return_value.upsert.return_value.execute.return_value = MagicMock()
            mock_sb.table.return_value.update.return_value.eq.return_value.execute.return_value = MagicMock()

            result = add_subtasks_to_task(GOAL_ID, TASK_1_ID, subtasks)

        assert len(result) == 2
        for sub in result:
            assert sub.get("id") is not None

# get_completed_task_count / get_total_task_count — return correct numbers

class TestTaskCountFunctions:

    def test_get_completed_task_count_returns_correct_number(self):
        """get_completed_task_count should return the count from Supabase."""
        with patch("app.Tables.supabase") as mock_sb:
            fake_result = MagicMock()
            fake_result.count = 3
            mock_sb.table.return_value.select.return_value.eq.return_value.eq.return_value.execute.return_value = fake_result

            count = get_completed_task_count(GOAL_ID)

        assert count == 3

    def test_get_completed_task_count_returns_zero_when_none(self):
        """get_completed_task_count should return 0 if count is None."""
        with patch("app.Tables.supabase") as mock_sb:
            fake_result = MagicMock()
            fake_result.count = None
            mock_sb.table.return_value.select.return_value.eq.return_value.eq.return_value.execute.return_value = fake_result

            count = get_completed_task_count(GOAL_ID)

        assert count == 0

    def test_get_total_task_count_returns_correct_number(self):
        """get_total_task_count should return total tasks + subtasks."""
        with patch("app.Tables.supabase") as mock_sb:
            fake_result = MagicMock()
            fake_result.count = 7
            mock_sb.table.return_value.select.return_value.eq.return_value.execute.return_value = fake_result

            count = get_total_task_count(GOAL_ID)
            

        assert count == 7

    def test_get_total_task_count_returns_zero_when_none(self):
        """get_total_task_count should return 0 if count is None."""
        with patch("app.Tables.supabase") as mock_sb:
            fake_result = MagicMock()
            fake_result.count = None
            mock_sb.table.return_value.select.return_value.eq.return_value.execute.return_value = fake_result

            count = get_total_task_count(GOAL_ID)

        assert count == 0

    def test_completed_count_is_subset_of_total(self):
        """Sanity check: completed count should never exceed total count."""
        with patch("app.Tables.supabase") as mock_sb:
            completed_result = MagicMock()
            completed_result.count = 2
            total_result = MagicMock()
            total_result.count = 5

            # Alternate return values for successive calls
            mock_sb.table.return_value.select.return_value.eq.return_value.eq.return_value.execute.return_value = completed_result
            mock_sb.table.return_value.select.return_value.eq.return_value.execute.return_value = total_result

            completed = get_completed_task_count(GOAL_ID)
            total = get_total_task_count(GOAL_ID)

        assert completed <= total