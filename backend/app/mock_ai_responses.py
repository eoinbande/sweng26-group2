"""
Mock AI responses for development.

These simulate what the AI would return for different goals and feedback scenarios.
Frontend can connect to endpoints that return these while AI integration is in progress.

Each mock follows the exact schema from Tables.py (AIGeneratePlanResponse, AIFeedbackResponse, etc.)
"""

# =============================================================================
# MOCK 1: "Fix my bike tyre" — Simple linear goal
# =============================================================================

BIKE_TYRE_INITIAL = {
    "tasks": [
        {
            "ai_id": "task_1",
            "description": "Remove the wheel from the bike",
            "order": 1,
            "status": "not_started",
            "requires_input": False,
            "subtasks": []
        },
        {
            "ai_id": "task_2",
            "description": "Take out the inner tube",
            "order": 2,
            "status": "not_started",
            "requires_input": False,
            "subtasks": []
        },
        {
            "ai_id": "task_3",
            "description": "Find the puncture",
            "order": 3,
            "status": "not_started",
            "requires_input": False,
            "subtasks": [
                {
                    "ai_id": "task_3a",
                    "description": "Inflate the tube slightly",
                    "order": 1,
                    "status": "not_started"
                },
                {
                    "ai_id": "task_3b",
                    "description": "Submerge in water to see bubbles",
                    "order": 2,
                    "status": "not_started"
                }
            ]
        },
        {
            "ai_id": "task_4",
            "description": "Apply the puncture repair patch",
            "order": 4,
            "status": "not_started",
            "requires_input": False,
            "subtasks": [
                {
                    "ai_id": "task_4a",
                    "description": "Roughen the area around the puncture with sandpaper",
                    "order": 1,
                    "status": "not_started"
                },
                {
                    "ai_id": "task_4b",
                    "description": "Apply rubber cement and wait 2 minutes",
                    "order": 2,
                    "status": "not_started"
                },
                {
                    "ai_id": "task_4c",
                    "description": "Press the patch firmly over the puncture",
                    "order": 3,
                    "status": "not_started"
                }
            ]
        },
        {
            "ai_id": "task_5",
            "description": "Reassemble the wheel and inflate the tyre",
            "order": 5,
            "status": "not_started",
            "requires_input": False,
            "subtasks": []
        }
    ]
}

# After user feedback: "I don't like task_3, use soapy water instead"
BIKE_TYRE_AFTER_FEEDBACK = {
    "tasks": [
        {
            "ai_id": "task_1",
            "description": "Remove the wheel from the bike",
            "order": 1,
            "status": "not_started",
            "requires_input": False,
            "subtasks": []
        },
        {
            "ai_id": "task_2",
            "description": "Take out the inner tube",
            "order": 2,
            "status": "not_started",
            "requires_input": False,
            "subtasks": []
        },
        {
            "ai_id": "task_3",
            "description": "Find puncture with soapy water",
            "order": 3,
            "status": "not_started",
            "requires_input": False,
            "subtasks": [
                {
                    "ai_id": "task_3a",
                    "description": "Mix soap with water in a bowl",
                    "order": 1,
                    "status": "not_started"
                },
                {
                    "ai_id": "task_3b",
                    "description": "Apply soapy water to the tube",
                    "order": 2,
                    "status": "not_started"
                },
                {
                    "ai_id": "task_3c",
                    "description": "Look for bubbles forming",
                    "order": 3,
                    "status": "not_started"
                }
            ]
        },
        {
            "ai_id": "task_4",
            "description": "Apply the puncture repair patch",
            "order": 4,
            "status": "not_started",
            "requires_input": False,
            "subtasks": [
                {
                    "ai_id": "task_4a",
                    "description": "Roughen the area around the puncture with sandpaper",
                    "order": 1,
                    "status": "not_started"
                },
                {
                    "ai_id": "task_4b",
                    "description": "Apply rubber cement and wait 2 minutes",
                    "order": 2,
                    "status": "not_started"
                },
                {
                    "ai_id": "task_4c",
                    "description": "Press the patch firmly over the puncture",
                    "order": 3,
                    "status": "not_started"
                }
            ]
        },
        {
            "ai_id": "task_5",
            "description": "Reassemble the wheel and inflate the tyre",
            "order": 5,
            "status": "not_started",
            "requires_input": False,
            "subtasks": []
        }
    ]
}

# After tasks 1 & 2 completed, user says "Make task_3 easier"
BIKE_TYRE_FEEDBACK_AFTER_PROGRESS = {
    "tasks": [
        {
            "ai_id": "task_1",
            "description": "Remove the wheel from the bike",
            "order": 1,
            "status": "completed",
            "requires_input": False,
            "subtasks": []
        },
        {
            "ai_id": "task_2",
            "description": "Take out the inner tube",
            "order": 2,
            "status": "completed",
            "requires_input": False,
            "subtasks": []
        },
        {
            "ai_id": "task_3",
            "description": "Find puncture — simplified method",
            "order": 3,
            "status": "not_started",
            "requires_input": False,
            "subtasks": [
                {
                    "ai_id": "task_3a_new",
                    "description": "Just use your fingers to feel for escaping air",
                    "order": 1,
                    "status": "not_started"
                }
            ]
        },
        {
            "ai_id": "task_4",
            "description": "Apply the puncture repair patch",
            "order": 4,
            "status": "not_started",
            "requires_input": False,
            "subtasks": [
                {
                    "ai_id": "task_4a",
                    "description": "Roughen the area around the puncture with sandpaper",
                    "order": 1,
                    "status": "not_started"
                },
                {
                    "ai_id": "task_4b",
                    "description": "Apply rubber cement and wait 2 minutes",
                    "order": 2,
                    "status": "not_started"
                },
                {
                    "ai_id": "task_4c",
                    "description": "Press the patch firmly over the puncture",
                    "order": 3,
                    "status": "not_started"
                }
            ]
        },
        {
            "ai_id": "task_5",
            "description": "Reassemble the wheel and inflate the tyre",
            "order": 5,
            "status": "not_started",
            "requires_input": False,
            "subtasks": []
        }
    ]
}


# =============================================================================
# MOCK 2: "Get my driving licence" — Goal with requires_input
# =============================================================================

DRIVING_LICENCE_INITIAL = {
    "tasks": [
        {
            "ai_id": "task_1",
            "description": "Check eligibility requirements for your country",
            "order": 1,
            "status": "not_started",
            "requires_input": True,
            "subtasks": []
        },
        {
            "ai_id": "task_2",
            "description": "Apply for a provisional/learner's licence",
            "order": 2,
            "status": "not_started",
            "requires_input": False,
            "subtasks": [
                {
                    "ai_id": "task_2a",
                    "description": "Gather required documents (ID, proof of address, passport photo)",
                    "order": 1,
                    "status": "not_started"
                },
                {
                    "ai_id": "task_2b",
                    "description": "Fill in the application form online or at your local office",
                    "order": 2,
                    "status": "not_started"
                },
                {
                    "ai_id": "task_2c",
                    "description": "Pay the application fee",
                    "order": 3,
                    "status": "not_started"
                }
            ]
        },
        {
            "ai_id": "task_3",
            "description": "Study for and pass the theory test",
            "order": 3,
            "status": "not_started",
            "requires_input": False,
            "subtasks": [
                {
                    "ai_id": "task_3a",
                    "description": "Get the official theory test study material",
                    "order": 1,
                    "status": "not_started"
                },
                {
                    "ai_id": "task_3b",
                    "description": "Practice with mock tests until consistently passing",
                    "order": 2,
                    "status": "not_started"
                },
                {
                    "ai_id": "task_3c",
                    "description": "Book and attend the theory test",
                    "order": 3,
                    "status": "not_started"
                }
            ]
        },
        {
            "ai_id": "task_4",
            "description": "Take driving lessons",
            "order": 4,
            "status": "not_started",
            "requires_input": False,
            "subtasks": [
                {
                    "ai_id": "task_4a",
                    "description": "Find a qualified driving instructor",
                    "order": 1,
                    "status": "not_started"
                },
                {
                    "ai_id": "task_4b",
                    "description": "Complete at least 10-20 hours of professional lessons",
                    "order": 2,
                    "status": "not_started"
                },
                {
                    "ai_id": "task_4c",
                    "description": "Practice with a supervising driver between lessons",
                    "order": 3,
                    "status": "not_started"
                }
            ]
        },
        {
            "ai_id": "task_5",
            "description": "Book and pass the practical driving test",
            "order": 5,
            "status": "not_started",
            "requires_input": False,
            "subtasks": [
                {
                    "ai_id": "task_5a",
                    "description": "Book the test when your instructor says you're ready",
                    "order": 1,
                    "status": "not_started"
                },
                {
                    "ai_id": "task_5b",
                    "description": "Do a mock test on the test route area",
                    "order": 2,
                    "status": "not_started"
                },
                {
                    "ai_id": "task_5c",
                    "description": "Attend and pass the practical test",
                    "order": 3,
                    "status": "not_started"
                }
            ]
        },
        {
            "ai_id": "task_6",
            "description": "Receive your full driving licence",
            "order": 6,
            "status": "not_started",
            "requires_input": False,
            "subtasks": []
        }
    ]
}


# =============================================================================
# MOCK 3: "Learn to cook pasta from scratch" — Simpler goal
# =============================================================================

PASTA_INITIAL = {
    "tasks": [
        {
            "ai_id": "task_1",
            "description": "Buy the ingredients",
            "order": 1,
            "status": "not_started",
            "requires_input": False,
            "subtasks": [
                {
                    "ai_id": "task_1a",
                    "description": "Get 200g '00' flour (or plain flour)",
                    "order": 1,
                    "status": "not_started"
                },
                {
                    "ai_id": "task_1b",
                    "description": "Get 2 large eggs",
                    "order": 2,
                    "status": "not_started"
                },
                {
                    "ai_id": "task_1c",
                    "description": "Get olive oil and salt",
                    "order": 3,
                    "status": "not_started"
                }
            ]
        },
        {
            "ai_id": "task_2",
            "description": "Make the pasta dough",
            "order": 2,
            "status": "not_started",
            "requires_input": False,
            "subtasks": [
                {
                    "ai_id": "task_2a",
                    "description": "Mound flour on a clean surface and create a well in the centre",
                    "order": 1,
                    "status": "not_started"
                },
                {
                    "ai_id": "task_2b",
                    "description": "Crack eggs into the well and mix with a fork",
                    "order": 2,
                    "status": "not_started"
                },
                {
                    "ai_id": "task_2c",
                    "description": "Knead the dough for 8-10 minutes until smooth",
                    "order": 3,
                    "status": "not_started"
                }
            ]
        },
        {
            "ai_id": "task_3",
            "description": "Rest the dough",
            "order": 3,
            "status": "not_started",
            "requires_input": False,
            "subtasks": [
                {
                    "ai_id": "task_3a",
                    "description": "Wrap dough in cling film and rest for 30 minutes",
                    "order": 1,
                    "status": "not_started"
                }
            ]
        },
        {
            "ai_id": "task_4",
            "description": "Roll and cut the pasta",
            "order": 4,
            "status": "not_started",
            "requires_input": False,
            "subtasks": [
                {
                    "ai_id": "task_4a",
                    "description": "Divide dough into 4 pieces",
                    "order": 1,
                    "status": "not_started"
                },
                {
                    "ai_id": "task_4b",
                    "description": "Roll each piece thin with a rolling pin or pasta machine",
                    "order": 2,
                    "status": "not_started"
                },
                {
                    "ai_id": "task_4c",
                    "description": "Cut into desired shape (tagliatelle, fettuccine, etc.)",
                    "order": 3,
                    "status": "not_started"
                }
            ]
        },
        {
            "ai_id": "task_5",
            "description": "Cook the pasta",
            "order": 5,
            "status": "not_started",
            "requires_input": False,
            "subtasks": [
                {
                    "ai_id": "task_5a",
                    "description": "Boil a large pot of salted water",
                    "order": 1,
                    "status": "not_started"
                },
                {
                    "ai_id": "task_5b",
                    "description": "Cook fresh pasta for 2-3 minutes (it cooks fast!)",
                    "order": 2,
                    "status": "not_started"
                },
                {
                    "ai_id": "task_5c",
                    "description": "Drain and toss with your favourite sauce",
                    "order": 3,
                    "status": "not_started"
                }
            ]
        }
    ]
}


# =============================================================================
# EXPAND TASK MOCKS — for when user clicks "I'm stuck" / expand
# =============================================================================

# User expands "task_5" (Reassemble the wheel) from the bike tyre goal
BIKE_EXPAND_TASK_5 = {
    "task_ai_id": "task_5",
    "subtasks": [
        {
            "ai_id": "task_5a",
            "description": "Put the inner tube back into the tyre",
            "order": 1,
            "status": "not_started"
        },
        {
            "ai_id": "task_5b",
            "description": "Fit the tyre back onto the wheel rim",
            "order": 2,
            "status": "not_started"
        },
        {
            "ai_id": "task_5c",
            "description": "Inflate to the recommended pressure (check tyre sidewall)",
            "order": 3,
            "status": "not_started"
        },
        {
            "ai_id": "task_5d",
            "description": "Reattach the wheel to the bike frame",
            "order": 4,
            "status": "not_started"
        }
    ]
}


# =============================================================================
# LOOKUP: Map goal titles to mock responses
# =============================================================================

MOCK_GOALS = {
    "fix my bike tyre": BIKE_TYRE_INITIAL,
    "fix my bike tire": BIKE_TYRE_INITIAL,
    "get my driving licence": DRIVING_LICENCE_INITIAL,
    "get my driving license": DRIVING_LICENCE_INITIAL,
    "get my drivers licence": DRIVING_LICENCE_INITIAL,
    "get my drivers license": DRIVING_LICENCE_INITIAL,
    "learn to cook pasta from scratch": PASTA_INITIAL,
    "learn to cook pasta": PASTA_INITIAL,
}

# Default fallback for any unrecognised goal
DEFAULT_MOCK = {
    "tasks": [
        {
            "ai_id": "task_1",
            "description": "Research what's involved in achieving this goal",
            "order": 1,
            "status": "not_started",
            "requires_input": False,
            "subtasks": []
        },
        {
            "ai_id": "task_2",
            "description": "Create a plan and gather any materials needed",
            "order": 2,
            "status": "not_started",
            "requires_input": False,
            "subtasks": []
        },
        {
            "ai_id": "task_3",
            "description": "Start working on the first actionable step",
            "order": 3,
            "status": "not_started",
            "requires_input": False,
            "subtasks": []
        },
        {
            "ai_id": "task_4",
            "description": "Review your progress and adjust if needed",
            "order": 4,
            "status": "not_started",
            "requires_input": False,
            "subtasks": []
        }
    ]
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
    For now, returns the soapy water variant for bike tyre, otherwise the initial plan.
    """
    if "bike" in goal_title.lower() and "tyre" in goal_title.lower():
        return BIKE_TYRE_AFTER_FEEDBACK
    if "bike" in goal_title.lower() and "tire" in goal_title.lower():
        return BIKE_TYRE_AFTER_FEEDBACK
    return get_mock_plan(goal_title)