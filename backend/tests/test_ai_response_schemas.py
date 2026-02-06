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