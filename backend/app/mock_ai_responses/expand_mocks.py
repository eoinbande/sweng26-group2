"""
Mock AI responses for expanding tasks into subtasks.

Used when a user clicks "I'm stuck" or "expand" on a task.
Each entry maps a task's ai_id to the subtasks AI would generate.

Add more expand mocks here as needed — one per task that has a
mocked expansion available.
"""

# User expands "task_5" (Reassemble the wheel) from the bike tyre goal
BIKE_EXPAND_TASK_5 = {
    "task_ai_id": "task_5",
    "subtasks": [
        {
            "ai_id": "task_5a",
            "description": "Put the inner tube back into the tyre",
            "order": 1,
            "status": "not_started",
            "guidance": "Start by tucking the valve through the rim hole, then work the tube in evenly so it's not twisted or pinched."
        },
        {
            "ai_id": "task_5b",
            "description": "Fit the tyre back onto the wheel rim",
            "order": 2,
            "status": "not_started",
            "guidance": "Start opposite the valve and push the tyre bead over the rim with your hands. Avoid using levers if possible — they can pinch the tube."
        },
        {
            "ai_id": "task_5c",
            "description": "Inflate to the recommended pressure (check tyre sidewall)",
            "order": 3,
            "status": "not_started",
            "guidance": "The recommended PSI range is printed on the tyre sidewall. Inflate to the middle of the range."
        },
        {
            "ai_id": "task_5d",
            "description": "Reattach the wheel to the bike frame",
            "order": 4,
            "status": "not_started",
            "guidance": "Slide the axle back into the dropouts, tighten the quick-release or nuts, and reconnect the brake if needed."
        }
    ]
}