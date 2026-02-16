import pytest
from app.schemas import (
    Task, SubTask, GoalData, TaskStatus
)


# =============================================================================
# Task Validation Tests
# =============================================================================

class TestTask:
    """Tests for Task validation."""

    def test_valid_task(self):
        """Should accept valid task with required fields."""
        task = Task(ai_id="task_1", description="Do something", order=1)
        assert task.ai_id == "task_1"
        assert task.description == "Do something"
        assert task.order == 1
        assert task.status == TaskStatus.NOT_STARTED

    def test_task_with_all_fields(self):
        """Should accept task with all optional fields populated."""
        task = Task(
            ai_id="task_1",
            description="Do something",
            order=1,
            status=TaskStatus.IN_PROGRESS,
            requires_input=True,
            subtasks=[
                SubTask(ai_id="task_1a", description="Sub step", order=1)
            ]
        )
        assert task.requires_input is True
        assert len(task.subtasks) == 1

    def test_empty_ai_id_rejected(self):
        """Should reject empty ai_id."""
        with pytest.raises(ValueError):
            Task(ai_id="", description="Do something", order=1)

    def test_whitespace_ai_id_rejected(self):
        """Should reject whitespace-only ai_id."""
        with pytest.raises(ValueError):
            Task(ai_id="   ", description="Do something", order=1)

    def test_ai_id_whitespace_trimmed(self):
        """Should trim whitespace from ai_id."""
        task = Task(ai_id="  task_1  ", description="Do something", order=1)
        assert task.ai_id == "task_1"

    def test_id_is_none_before_save(self):
        """UUID id should be None before saving to database."""
        task = Task(ai_id="task_1", description="Do something", order=1)
        assert task.id is None

    def test_id_can_be_set(self):
        """UUID id should be settable (for after database save)."""
        task = Task(ai_id="task_1", id="550e8400-uuid", description="Do something", order=1)
        assert task.id == "550e8400-uuid"

    def test_subtasks_default_empty(self):
        """Subtasks should default to empty list."""
        task = Task(ai_id="task_1", description="Do something", order=1)
        assert task.subtasks == []

    def test_all_statuses_accepted(self):
        """Should accept all valid status values."""
        for status in [TaskStatus.NOT_STARTED, TaskStatus.IN_PROGRESS, TaskStatus.COMPLETED]:
            task = Task(ai_id="task_1", description="Do something", order=1, status=status)
            assert task.status == status


# =============================================================================
# SubTask Validation Tests
# =============================================================================

class TestSubTask:
    """Tests for SubTask validation."""

    def test_valid_subtask(self):
        """Should accept valid subtask."""
        sub = SubTask(ai_id="task_1a", description="Sub step", order=1)
        assert sub.ai_id == "task_1a"
        assert sub.description == "Sub step"
        assert sub.order == 1
        assert sub.status == TaskStatus.NOT_STARTED

    def test_empty_ai_id_rejected(self):
        """Should reject empty ai_id."""
        with pytest.raises(ValueError):
            SubTask(ai_id="", description="Sub step", order=1)

    def test_whitespace_ai_id_rejected(self):
        """Should reject whitespace-only ai_id."""
        with pytest.raises(ValueError):
            SubTask(ai_id="   ", description="Sub step", order=1)

    def test_ai_id_whitespace_trimmed(self):
        """Should trim whitespace from ai_id."""
        sub = SubTask(ai_id="  task_1a  ", description="Sub step", order=1)
        assert sub.ai_id == "task_1a"

    def test_id_is_none_before_save(self):
        """UUID id should be None before saving to database."""
        sub = SubTask(ai_id="task_1a", description="Sub step", order=1)
        assert sub.id is None


# =============================================================================
# GoalData Validation Tests
# =============================================================================

class TestGoalData:
    """Tests for GoalData structure and helper methods."""

    def _make_goal(self, tasks=None):
        """Helper to create a GoalData with sensible defaults."""
        if tasks is None:
            tasks = [
                Task(ai_id="task_1", id="uuid-1", description="First task", order=1),
                Task(ai_id="task_2", id="uuid-2", description="Second task", order=2),
            ]
        return GoalData(
            user_id="user_123",
            title="Test goal",
            tasks=tasks
        )

    def test_valid_goal(self):
        """Should accept valid goal with tasks."""
        goal = self._make_goal()
        assert goal.title == "Test goal"
        assert len(goal.tasks) == 2

    def test_goal_with_empty_tasks(self):
        """Should accept goal with empty task list (before plan generated)."""
        goal = GoalData(
            user_id="user_123",
            title="New goal",
            tasks=[]
        )
        assert goal.tasks == []

    def test_goal_auto_generates_id(self):
        """Goal should auto-generate a UUID if not provided."""
        goal = self._make_goal()
        assert goal.goal_id is not None
        assert len(goal.goal_id) > 0

    # -------------------------------------------------------------------------
    # Helper method tests
    # -------------------------------------------------------------------------

    def test_get_task_by_id(self):
        """Should find task by UUID."""
        goal = self._make_goal()
        task = goal.get_task_by_id("uuid-1")
        assert task is not None
        assert task.ai_id == "task_1"

    def test_get_task_by_id_not_found(self):
        """Should return None for non-existent UUID."""
        goal = self._make_goal()
        assert goal.get_task_by_id("nonexistent") is None

    def test_get_task_by_ai_id(self):
        """Should find task by ai_id."""
        goal = self._make_goal()
        task = goal.get_task_by_ai_id("task_1")
        assert task is not None
        assert task.id == "uuid-1"

    def test_get_task_by_ai_id_not_found(self):
        """Should return None for non-existent ai_id."""
        goal = self._make_goal()
        assert goal.get_task_by_ai_id("task_999") is None

    def test_get_subtask_by_id(self):
        """Should find subtask by UUID and return (parent, subtask) tuple."""
        goal = self._make_goal(tasks=[
            Task(
                ai_id="task_1", id="uuid-1", description="Parent", order=1,
                subtasks=[
                    SubTask(ai_id="task_1a", id="uuid-1a", description="Child", order=1)
                ]
            )
        ])
        result = goal.get_subtask_by_id("uuid-1a")
        assert result is not None
        parent, subtask = result
        assert parent.ai_id == "task_1"
        assert subtask.ai_id == "task_1a"

    def test_get_subtask_by_id_not_found(self):
        """Should return None for non-existent subtask UUID."""
        goal = self._make_goal()
        assert goal.get_subtask_by_id("nonexistent") is None

    # -------------------------------------------------------------------------
    # Progress tracking tests
    # -------------------------------------------------------------------------

    def test_get_completed_count_none(self):
        """Should return 0 when no tasks are completed."""
        goal = self._make_goal()
        assert goal.get_completed_count() == 0

    def test_get_completed_count_with_completed(self):
        """Should count completed tasks and subtasks."""
        goal = self._make_goal(tasks=[
            Task(ai_id="task_1", id="uuid-1", description="Done", order=1,
                 status=TaskStatus.COMPLETED),
            Task(ai_id="task_2", id="uuid-2", description="Not done", order=2,
                 status=TaskStatus.NOT_STARTED,
                 subtasks=[
                     SubTask(ai_id="task_2a", id="uuid-2a", description="Done sub",
                             order=1, status=TaskStatus.COMPLETED),
                     SubTask(ai_id="task_2b", id="uuid-2b", description="Not done sub",
                             order=2, status=TaskStatus.NOT_STARTED),
                 ]),
        ])
        # task_1 completed + task_2a completed = 2
        assert goal.get_completed_count() == 2

    def test_get_total_count(self):
        """Should count all tasks and subtasks."""
        goal = self._make_goal(tasks=[
            Task(ai_id="task_1", id="uuid-1", description="Task", order=1),
            Task(ai_id="task_2", id="uuid-2", description="Task with subs", order=2,
                 subtasks=[
                     SubTask(ai_id="task_2a", id="uuid-2a", description="Sub", order=1),
                     SubTask(ai_id="task_2b", id="uuid-2b", description="Sub", order=2),
                 ]),
        ])
        # 2 tasks + 2 subtasks = 4
        assert goal.get_total_count() == 4

    def test_is_complete_false(self):
        """Should return False when not all tasks are completed."""
        goal = self._make_goal()
        assert goal.is_complete() is False

    def test_is_complete_true(self):
        """Should return True when all tasks and subtasks are completed."""
        goal = self._make_goal(tasks=[
            Task(ai_id="task_1", id="uuid-1", description="Done", order=1,
                 status=TaskStatus.COMPLETED),
            Task(ai_id="task_2", id="uuid-2", description="Done", order=2,
                 status=TaskStatus.COMPLETED,
                 subtasks=[
                     SubTask(ai_id="task_2a", id="uuid-2a", description="Done sub",
                             order=1, status=TaskStatus.COMPLETED),
                 ]),
        ])
        assert goal.is_complete() is True

    def test_is_complete_false_with_incomplete_subtask(self):
        """Should return False if any subtask is not completed."""
        goal = self._make_goal(tasks=[
            Task(ai_id="task_1", id="uuid-1", description="Done", order=1,
                 status=TaskStatus.COMPLETED,
                 subtasks=[
                     SubTask(ai_id="task_1a", id="uuid-1a", description="Not done",
                             order=1, status=TaskStatus.NOT_STARTED),
                 ]),
        ])
        assert goal.is_complete() is False