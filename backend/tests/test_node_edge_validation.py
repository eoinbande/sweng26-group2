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


# =============================================================================
# GoalData Graph Validation Tests
# =============================================================================

class TestGoalDataValidation:
    """Tests for GoalData.validate_graph() method."""

    def test_valid_graph(self):
        """Should return no issues for valid graph."""
        goal = GoalData(
            user_id="user_123",
            title="Test goal",
            nodes=[
                TaskNode(id="task_1", task="First task"),
                TaskNode(id="task_2", task="Second task"),
            ],
            edges=[
                Edge(head="task_1", tail="task_2")
            ]
        )
        issues = goal.validate_graph()
        assert issues == []

    def test_duplicate_node_ids(self):
        """Should detect duplicate node IDs."""
        goal = GoalData(
            user_id="user_123",
            title="Test goal",
            nodes=[
                TaskNode(id="task_1", task="First task"),
                TaskNode(id="task_1", task="Duplicate ID"),
            ],
            edges=[]
        )
        issues = goal.validate_graph()
        assert "Duplicate node IDs found" in issues

    def test_edge_references_nonexistent_head(self):
        """Should detect edge referencing non-existent head node."""
        goal = GoalData(
            user_id="user_123",
            title="Test goal",
            nodes=[
                TaskNode(id="task_1", task="First task"),
            ],
            edges=[
                Edge(head="task_999", tail="task_1")
            ]
        )
        issues = goal.validate_graph()
        assert any("non-existent head" in issue for issue in issues)

    def test_edge_references_nonexistent_tail(self):
        """Should detect edge referencing non-existent tail node."""
        goal = GoalData(
            user_id="user_123",
            title="Test goal",
            nodes=[
                TaskNode(id="task_1", task="First task"),
            ],
            edges=[
                Edge(head="task_1", tail="task_999")
            ]
        )
        issues = goal.validate_graph()
        assert any("non-existent tail" in issue for issue in issues)

    def test_self_loop_detected(self):
        """Should detect self-loop (edge pointing to itself)."""
        goal = GoalData(
            user_id="user_123",
            title="Test goal",
            nodes=[
                TaskNode(id="task_1", task="First task"),
            ],
            edges=[
                Edge(head="task_1", tail="task_1")
            ]
        )
        issues = goal.validate_graph()
        assert any("Self-loop" in issue for issue in issues)

    