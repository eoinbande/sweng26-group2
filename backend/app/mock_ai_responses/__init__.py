"""
Mock AI responses package.

Provides mock data for all endpoints while AI integration is in progress.
Each goal has its own file for easy navigation and separate ownership.

Usage in routers/tests:
    from app.mock_ai_responses import get_mock_plan, get_mock_feedback_response
    from app.mock_ai_responses import BIKE_TYRE_INITIAL, WEDDING_INITIAL, etc.
"""

# Import all mocks from individual files
from .bike_tyre import (
    BIKE_TYRE_INITIAL,
    BIKE_TYRE_AFTER_FEEDBACK,
    BIKE_TYRE_FEEDBACK_AFTER_PROGRESS
)
from .wedding import WEDDING_INITIAL, WEDDING_AFTER_FEEDBACK
from .piano import PIANO_INITIAL
from .expand_mocks import BIKE_EXPAND_TASK_5
from .default import DEFAULT_MOCK


# =============================================================================
# LOOKUP: Map goal titles to mock responses
# =============================================================================
# Add new entries here when you create a new mock file.
# Keys are lowercase — get_mock_plan() lowercases the input before lookup.
# =============================================================================

MOCK_GOALS = {
    # Bike tyre variants
    "fix my bike tyre": BIKE_TYRE_INITIAL,
    "fix my bike tire": BIKE_TYRE_INITIAL,
    "fix a flat bike tyre": BIKE_TYRE_INITIAL,
    "fix a flat bike tire": BIKE_TYRE_INITIAL,
    "fixed flat bike tyre": BIKE_TYRE_INITIAL,

    # Wedding variants
    "plan a wedding": WEDDING_INITIAL,
    "plan my friend's wedding": WEDDING_INITIAL,
    "help me plan my friend's wedding": WEDDING_INITIAL,
    "help me plan my sister's wedding": WEDDING_INITIAL,
    "help me plan a wedding": WEDDING_INITIAL,
    "i want to plan a wedding": WEDDING_INITIAL,

    # Piano variants
    "learn piano": PIANO_INITIAL,
    "learn to play piano": PIANO_INITIAL,
    "learn the piano": PIANO_INITIAL,
    "i want to learn piano": PIANO_INITIAL,
}


def get_mock_plan(goal_title: str) -> dict:
    """
    Get a mock AI plan for a given goal title.
    Falls back to DEFAULT_MOCK for unrecognised goals.
    """
    return MOCK_GOALS.get(goal_title.lower().strip(), DEFAULT_MOCK)


def get_mock_feedback_response(goal_title: str) -> dict:
    """
    Get a mock AI response after user feedback.
    """
    title = goal_title.lower()
    if "bike" in title and ("tyre" in title or "tire" in title):
        return BIKE_TYRE_AFTER_FEEDBACK
    if "wedding" in title:
        return WEDDING_AFTER_FEEDBACK
    return get_mock_plan(goal_title)