import pytest
from app.schemas import (
    Task, SubTask, TaskStatus,
    AIGeneratePlanResponse, AIFeedbackResponse, AIExpandTaskResponse
)
from app.mock_ai_responses import (
    get_mock_plan, get_mock_feedback_response,
    BIKE_TYRE_INITIAL, BIKE_TYRE_AFTER_FEEDBACK,
    BIKE_TYRE_FEEDBACK_AFTER_PROGRESS, BIKE_EXPAND_TASK_5,
    DRIVING_LICENCE_INITIAL, PASTA_INITIAL, DEFAULT_MOCK
)


# =============================================================================
# AIGeneratePlanResponse Tests
# =============================================================================

class TestAIGeneratePlanResponse:
    """Tests for AIGeneratePlanResponse schema."""

    def test_valid_response(self):
        """Should accept valid generate plan response with tasks."""
        response = AIGeneratePlanResponse(
            tasks=[Task(ai_id="task_1", description="Do something", order=1)]
        )
        assert len(response.tasks) == 1
        assert response.tasks[0].ai_id == "task_1"

    def test_response_with_subtasks(self):
        """Should accept response with tasks that have subtasks."""
        response = AIGeneratePlanResponse(
            tasks=[
                Task(
                    ai_id="task_1",
                    description="Parent task",
                    order=1,
                    subtasks=[
                        SubTask(ai_id="task_1a", description="Subtask A", order=1),
                        SubTask(ai_id="task_1b", description="Subtask B", order=2),
                    ]
                )
            ]
        )
        assert len(response.tasks[0].subtasks) == 2

    def test_empty_tasks_rejected(self):
        """Should reject response with empty tasks list."""
        with pytest.raises(ValueError):
            AIGeneratePlanResponse(tasks=[])

    def test_tasks_default_to_not_started(self):
        """New tasks should default to not_started status."""
        response = AIGeneratePlanResponse(
            tasks=[Task(ai_id="task_1", description="Do something", order=1)]
        )
        assert response.tasks[0].status == TaskStatus.NOT_STARTED

    def test_requires_input_defaults_false(self):
        """Tasks should default to requires_input=False."""
        response = AIGeneratePlanResponse(
            tasks=[Task(ai_id="task_1", description="Do something", order=1)]
        )
        assert response.tasks[0].requires_input is False

    def test_requires_input_can_be_true(self):
        """Should accept tasks with requires_input=True."""
        response = AIGeneratePlanResponse(
            tasks=[Task(ai_id="task_1", description="Check eligibility", order=1, requires_input=True)]
        )
        assert response.tasks[0].requires_input is True


# =============================================================================
# AIFeedbackResponse Tests
# =============================================================================

class TestAIFeedbackResponse:
    """Tests for AIFeedbackResponse schema (feedback on plan)."""

    def test_valid_response(self):
        """Should accept valid feedback response."""
        response = AIFeedbackResponse(
            tasks=[
                Task(ai_id="task_1", description="Unchanged task", order=1),
                Task(ai_id="task_2", description="Modified task", order=2),
            ]
        )
        assert len(response.tasks) == 2

    def test_preserves_completed_status(self):
        """Should accept tasks with completed status (preserved from before)."""
        response = AIFeedbackResponse(
            tasks=[
                Task(ai_id="task_1", description="Done task", order=1, status=TaskStatus.COMPLETED),
                Task(ai_id="task_2", description="New task", order=2, status=TaskStatus.NOT_STARTED),
            ]
        )
        assert response.tasks[0].status == TaskStatus.COMPLETED
        assert response.tasks[1].status == TaskStatus.NOT_STARTED

    def test_empty_tasks_rejected(self):
        """Should reject feedback response with empty tasks."""
        with pytest.raises(ValueError):
            AIFeedbackResponse(tasks=[])


# =============================================================================
# AIExpandTaskResponse Tests
# =============================================================================

class TestAIExpandTaskResponse:
    """Tests for AIExpandTaskResponse schema (expand/I'm stuck flow)."""

    def test_valid_response(self):
        """Should accept valid expand task response."""
        response = AIExpandTaskResponse(
            task_ai_id="task_5",
            subtasks=[
                SubTask(ai_id="task_5a", description="First subtask", order=1),
                SubTask(ai_id="task_5b", description="Second subtask", order=2),
            ]
        )
        assert response.task_ai_id == "task_5"
        assert len(response.subtasks) == 2

    def test_empty_subtasks_rejected(self):
        """Should reject expand response with empty subtasks."""
        with pytest.raises(ValueError):
            AIExpandTaskResponse(
                task_ai_id="task_5",
                subtasks=[]
            )

    def test_subtasks_have_correct_order(self):
        """Subtasks should maintain their order values."""
        response = AIExpandTaskResponse(
            task_ai_id="task_3",
            subtasks=[
                SubTask(ai_id="task_3a", description="Step 1", order=1),
                SubTask(ai_id="task_3b", description="Step 2", order=2),
                SubTask(ai_id="task_3c", description="Step 3", order=3),
            ]
        )
        for i, sub in enumerate(response.subtasks):
            assert sub.order == i + 1


# =============================================================================
# Mock Template Validation Tests
# =============================================================================

class TestMockTemplates:
    """Tests that all mock templates conform to the schemas."""

    def test_bike_tyre_initial_valid(self):
        """Bike tyre initial plan should match AIGeneratePlanResponse schema."""
        response = AIGeneratePlanResponse(**BIKE_TYRE_INITIAL)
        assert len(response.tasks) == 5
        # Check task_3 has subtasks
        task_3 = [t for t in response.tasks if t.ai_id == "task_3"][0]
        assert len(task_3.subtasks) == 2

    def test_bike_tyre_feedback_valid(self):
        """Bike tyre after-feedback plan should match AIFeedbackResponse schema."""
        response = AIFeedbackResponse(**BIKE_TYRE_AFTER_FEEDBACK)
        assert len(response.tasks) == 5
        # task_3 should now have 3 subtasks (added task_3c)
        task_3 = [t for t in response.tasks if t.ai_id == "task_3"][0]
        assert len(task_3.subtasks) == 3

    def test_bike_tyre_feedback_preserves_completed(self):
        """Feedback after progress should preserve completed status."""
        response = AIFeedbackResponse(**BIKE_TYRE_FEEDBACK_AFTER_PROGRESS)
        task_1 = [t for t in response.tasks if t.ai_id == "task_1"][0]
        task_2 = [t for t in response.tasks if t.ai_id == "task_2"][0]
        assert task_1.status == TaskStatus.COMPLETED
        assert task_2.status == TaskStatus.COMPLETED

    def test_driving_licence_valid(self):
        """Driving licence plan should match AIGeneratePlanResponse schema."""
        response = AIGeneratePlanResponse(**DRIVING_LICENCE_INITIAL)
        assert len(response.tasks) == 6
        # task_1 should require input
        task_1 = [t for t in response.tasks if t.ai_id == "task_1"][0]
        assert task_1.requires_input is True

    def test_pasta_valid(self):
        """Pasta plan should match AIGeneratePlanResponse schema."""
        response = AIGeneratePlanResponse(**PASTA_INITIAL)
        assert len(response.tasks) == 5

    def test_expand_task_valid(self):
        """Expand task mock should match AIExpandTaskResponse schema."""
        response = AIExpandTaskResponse(**BIKE_EXPAND_TASK_5)
        assert response.task_ai_id == "task_5"
        assert len(response.subtasks) == 4

    def test_default_mock_valid(self):
        """Default fallback mock should match AIGeneratePlanResponse schema."""
        response = AIGeneratePlanResponse(**DEFAULT_MOCK)
        assert len(response.tasks) >= 1

    def test_get_mock_plan_known_goal(self):
        """get_mock_plan should return correct mock for known goal."""
        plan = get_mock_plan("Fix my bike tyre")
        assert plan == BIKE_TYRE_INITIAL

    def test_get_mock_plan_unknown_goal(self):
        """get_mock_plan should return default for unknown goal."""
        plan = get_mock_plan("Build a spaceship")
        assert plan == DEFAULT_MOCK

    def test_get_mock_plan_case_insensitive(self):
        """get_mock_plan should be case-insensitive."""
        plan = get_mock_plan("FIX MY BIKE TYRE")
        assert plan == BIKE_TYRE_INITIAL

    def test_all_mock_tasks_have_ai_ids(self):
        """Every task and subtask in every mock should have an ai_id."""
        all_mocks = [
            BIKE_TYRE_INITIAL, BIKE_TYRE_AFTER_FEEDBACK,
            BIKE_TYRE_FEEDBACK_AFTER_PROGRESS,
            DRIVING_LICENCE_INITIAL, PASTA_INITIAL, DEFAULT_MOCK
        ]
        for mock in all_mocks:
            for task in mock["tasks"]:
                assert "ai_id" in task, f"Task missing ai_id: {task}"
                assert len(task["ai_id"]) > 0
                for sub in task.get("subtasks", []):
                    assert "ai_id" in sub, f"Subtask missing ai_id: {sub}"
                    assert len(sub["ai_id"]) > 0

    def test_all_mock_tasks_have_order(self):
        """Every task and subtask should have an order field."""
        all_mocks = [
            BIKE_TYRE_INITIAL, BIKE_TYRE_AFTER_FEEDBACK,
            DRIVING_LICENCE_INITIAL, PASTA_INITIAL
        ]
        for mock in all_mocks:
            for task in mock["tasks"]:
                assert "order" in task, f"Task missing order: {task}"
                for sub in task.get("subtasks", []):
                    assert "order" in sub, f"Subtask missing order: {sub}"