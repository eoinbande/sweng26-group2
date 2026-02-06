import pytest
from app.schemas.ai_responses import (
    TaskNode, Edge, GoalType, EdgeType,
    AIGeneratePlanResponse, AIExpandTaskResponse, AIAdaptTaskResponse
)


# =============================================================================
# AIGeneratePlanResponse Tests
# =============================================================================

class TestAIGeneratePlanResponse:
    """Tests for AIGeneratePlanResponse schema."""

    def test_valid_response(self):
        """Should accept valid generate plan response."""
        response = AIGeneratePlanResponse(
            goal_type=GoalType.SPECIFIC,
            nodes=[TaskNode(id="task_1", task="Do something")],
            edges=[]
        )
        assert response.goal_type == GoalType.SPECIFIC
        assert len(response.nodes) == 1

    def test_response_with_edges(self):
        """Should accept response with nodes and edges."""
        response = AIGeneratePlanResponse(
            goal_type=GoalType.SPECIFIC,
            nodes=[
                TaskNode(id="task_1", task="First"),
                TaskNode(id="task_2", task="Second"),
            ],
            edges=[Edge(head="task_1", tail="task_2")]
        )
        assert len(response.edges) == 1

    def test_empty_nodes_rejected(self):
        """Should reject response with empty nodes."""
        with pytest.raises(ValueError):
            AIGeneratePlanResponse(
                goal_type=GoalType.SPECIFIC,
                nodes=[],
                edges=[]
            )

    def test_all_goal_types_accepted(self):
        """Should accept all goal types."""
        for goal_type in [GoalType.SPECIFIC, GoalType.GENERAL, GoalType.HABIT]:
            response = AIGeneratePlanResponse(
                goal_type=goal_type,
                nodes=[TaskNode(id="task_1", task="Do something")],
                edges=[]
            )
            assert response.goal_type == goal_type


# =============================================================================
# AIExpandTaskResponse Tests
# =============================================================================

class TestAIExpandTaskResponse:
    """Tests for AIExpandTaskResponse schema (I'm stuck flow)."""

    def test_valid_response(self):
        """Should accept valid expand task response."""
        response = AIExpandTaskResponse(
            original_task_id="task_3",
            new_nodes=[TaskNode(id="task_6", task="Subtask")],
            new_edges=[Edge(head="task_3", tail="task_6")],
            edges_to_remove=[]
        )
        assert response.original_task_id == "task_3"
        assert len(response.new_nodes) == 1

    def test_response_with_edges_to_remove(self):
        """Should accept response with edges to remove."""
        response = AIExpandTaskResponse(
            original_task_id="task_3",
            new_nodes=[TaskNode(id="task_6", task="Subtask")],
            new_edges=[
                Edge(head="task_3", tail="task_6"),
                Edge(head="task_6", tail="task_4")  # reconnect to original next task
            ],
            edges_to_remove=[Edge(head="task_3", tail="task_4")]
        )
        assert len(response.edges_to_remove) == 1
        assert len(response.new_edges) == 2

    def test_empty_new_nodes_rejected(self):
        """Should reject response with empty new_nodes."""
        with pytest.raises(ValueError):
            AIExpandTaskResponse(
                original_task_id="task_3",
                new_nodes=[],
                new_edges=[]
            )