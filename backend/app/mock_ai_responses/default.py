"""
Default fallback mock for any goal we don't have a specific mock for.

This gets returned when a user types a goal like "learn to juggle"
that doesn't match any of our specific mocks.

Once real AI is integrated, this won't be needed anymore.
"""

DEFAULT_MOCK = {
    "description": "AI-generated plan to help you reach your goal",
    "goal_due_date": "",
    "tasks": [
        {
            "ai_id": "task_1",
            "description": "Research what's involved in achieving this goal",
            "order": 1,
            "status": "not_started",
            "due_date": "",
            "requires_input": False,
            "guidance": "Spend some time understanding the full scope of what this goal involves. Look for guides, tutorials, or people who have done it before.",
            "subtasks": []
        },
        {
            "ai_id": "task_2",
            "description": "Create a plan and gather any materials needed",
            "order": 2,
            "status": "not_started",
            "due_date": "",
            "requires_input": False,
            "guidance": "Based on your research, list out what you need (tools, accounts, skills, etc.) and get them ready.",
            "subtasks": []
        },
        {
            "ai_id": "task_3",
            "description": "Start working on the first actionable step",
            "order": 3,
            "status": "not_started",
            "due_date": "",
            "requires_input": False,
            "guidance": "Don't overthink it — pick the smallest, easiest first step and just do it. Momentum matters.",
            "subtasks": []
        },
        {
            "ai_id": "task_4",
            "description": "Review your progress and adjust if needed",
            "order": 4,
            "status": "not_started",
            "due_date": "",
            "requires_input": False,
            "guidance": "After making some progress, take a step back and assess. Are you on track? Does the plan need adjusting?",
            "subtasks": []
        }
    ]
}