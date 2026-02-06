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

    
# =============================================================================
# Edge Validation Tests
# =============================================================================

class TestEdge:
    """Tests for Edge validation."""

    def test_valid_edge(self):
        """Should accept valid edge."""
        edge = Edge(head="task_1", tail="task_2")
        assert edge.head == "task_1"
        assert edge.tail == "task_2"
        assert edge.edge_type is None

    def test_edge_with_type(self):
        """Should accept edge with explicit type."""
        edge = Edge(head="task_1", tail="task_2", edge_type=EdgeType.ORDERING)
        assert edge.edge_type == EdgeType.ORDERING

    def test_empty_head_rejected(self):
        """Should reject empty head ID."""
        with pytest.raises(ValueError):
            Edge(head="", tail="task_2")

    def test_empty_tail_rejected(self):
        """Should reject empty tail ID."""
        with pytest.raises(ValueError):
            Edge(head="task_1", tail="")

    def test_whitespace_head_rejected(self):
        """Should reject whitespace-only head ID."""
        with pytest.raises(ValueError):
            Edge(head="   ", tail="task_2")

    