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