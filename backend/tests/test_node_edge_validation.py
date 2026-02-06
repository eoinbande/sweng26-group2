import pytest 
from app.schemas.ai_responses import (
    TaskNode, Edge, GoalData, TaskStatus, EdgeType
)

# =============================================================================
# TaskNode Validation Tests
# =============================================================================

class TestTaskNode:
    """Tests for TaskNode validation."""

    def test_valid_task_node(self):
        """Should accept valid task node."""
        node = TaskNode(id="task_1", task="Do something")
        assert node.id == "task_1"
        assert node.task == "Do something"
        assert node.status == TaskStatus.NOT_STARTED

    def test_task_node_with_all_fields(self):
        """Should accept task node with all optional fields."""
        node = TaskNode(
            id="task_1",
            task="Do something",
            status=TaskStatus.IN_PROGRESS,
            est_time=30,
            due_date="2026-02-10"
        )
        assert node.est_time == 30
        assert node.due_date == "2026-02-10"

    def test_empty_id_rejected(self):
        """Should reject empty task ID."""
        with pytest.raises(ValueError):
            TaskNode(id="", task="Do something")

    def test_whitespace_id_rejected(self):
        """Should reject whitespace-only task ID."""
        with pytest.raises(ValueError):
            TaskNode(id="   ", task="Do something")

    def test_id_whitespace_trimmed(self):
        """Should trim whitespace from task ID."""
        node = TaskNode(id="  task_1  ", task="Do something")
        assert node.id == "task_1"

    