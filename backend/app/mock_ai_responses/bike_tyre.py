"""
Mock AI responses for goal: "Fix my bike tyre"

Simple linear goal — tasks are sequential, no info-gathering needed.

Includes:
- BIKE_TYRE_INITIAL: First plan generated
- BIKE_TYRE_AFTER_FEEDBACK: After user says "use soapy water instead"
- BIKE_TYRE_FEEDBACK_AFTER_PROGRESS: After tasks 1 & 2 completed, user says "make task_3 easier"
"""

# =============================================================================
# Initial plan
# =============================================================================

BIKE_TYRE_INITIAL = {
    "tasks": [
        {
            "ai_id": "task_1",
            "description": "Remove the wheel from the bike",
            "order": 1,
            "status": "not_started",
            "requires_input": False,
            "guidance": "Flip the bike upside down so it rests on the handlebars and seat. Release the brake if needed, then open the quick-release lever or loosen the axle nuts to remove the wheel.",
            "subtasks": []
        },
        {
            "ai_id": "task_2",
            "description": "Take out the inner tube",
            "order": 2,
            "status": "not_started",
            "requires_input": False,
            "guidance": "Use tyre levers to pry one side of the tyre off the rim. Slide the lever around the rim to unseat the tyre, then pull the inner tube out carefully.",
            "subtasks": []
        },
        {
            "ai_id": "task_3",
            "description": "Find the puncture",
            "order": 3,
            "status": "not_started",
            "requires_input": False,
            "guidance": "Inflate the tube and listen or feel for escaping air. If you can't find it by feel, try one of the subtask methods below.",
            "subtasks": [
                {
                    "ai_id": "task_3a",
                    "description": "Inflate the tube slightly",
                    "order": 1,
                    "status": "not_started",
                    "guidance": "Pump just enough air so the tube holds its shape — don't over-inflate."
                },
                {
                    "ai_id": "task_3b",
                    "description": "Submerge in water to see bubbles",
                    "order": 2,
                    "status": "not_started",
                    "guidance": "Hold the inflated tube underwater section by section. Bubbles will appear where the hole is. Mark the spot."
                }
            ]
        },
        {
            "ai_id": "task_4",
            "description": "Apply the puncture repair patch",
            "order": 4,
            "status": "not_started",
            "requires_input": False,
            "guidance": "Use a standard puncture repair kit. Make sure the area is clean and dry before applying.",
            "subtasks": [
                {
                    "ai_id": "task_4a",
                    "description": "Roughen the area around the puncture with sandpaper",
                    "order": 1,
                    "status": "not_started",
                    "guidance": "This helps the glue bond to the rubber. Roughen an area slightly larger than the patch."
                },
                {
                    "ai_id": "task_4b",
                    "description": "Apply rubber cement and wait 2 minutes",
                    "order": 2,
                    "status": "not_started",
                    "guidance": "Spread a thin, even layer over the roughened area. Wait until it becomes tacky — don't rush this step."
                },
                {
                    "ai_id": "task_4c",
                    "description": "Press the patch firmly over the puncture",
                    "order": 3,
                    "status": "not_started",
                    "guidance": "Peel the backing off the patch, centre it over the hole, and press hard for 30 seconds. Roll a pen over it to ensure good contact."
                }
            ]
        },
        {
            "ai_id": "task_5",
            "description": "Reassemble the wheel and inflate the tyre",
            "order": 5,
            "status": "not_started",
            "requires_input": False,
            "guidance": "Put the tube back in, reseat the tyre on the rim, reattach the wheel, and inflate to the pressure shown on the tyre sidewall.",
            "subtasks": []
        }
    ]
}


# =============================================================================
# After feedback: "I don't like task_3, use soapy water instead"
# task_3 description changed, subtasks replaced, task_3c added
# =============================================================================

BIKE_TYRE_AFTER_FEEDBACK = {
    "tasks": [
        {
            "ai_id": "task_1",
            "description": "Remove the wheel from the bike",
            "order": 1,
            "status": "not_started",
            "requires_input": False,
            "guidance": "Flip the bike upside down so it rests on the handlebars and seat. Release the brake if needed, then open the quick-release lever or loosen the axle nuts to remove the wheel.",
            "subtasks": []
        },
        {
            "ai_id": "task_2",
            "description": "Take out the inner tube",
            "order": 2,
            "status": "not_started",
            "requires_input": False,
            "guidance": "Use tyre levers to pry one side of the tyre off the rim. Slide the lever around the rim to unseat the tyre, then pull the inner tube out carefully.",
            "subtasks": []
        },
        {
            "ai_id": "task_3",
            "description": "Find puncture with soapy water",
            "order": 3,
            "status": "not_started",
            "requires_input": False,
            "guidance": "The soapy water method is reliable and easy — bubbles form exactly where the air escapes.",
            "subtasks": [
                {
                    "ai_id": "task_3a",
                    "description": "Mix soap with water in a bowl",
                    "order": 1,
                    "status": "not_started",
                    "guidance": "A few drops of washing-up liquid in warm water works perfectly."
                },
                {
                    "ai_id": "task_3b",
                    "description": "Apply soapy water to the tube",
                    "order": 2,
                    "status": "not_started",
                    "guidance": "Use a sponge or cloth to coat sections of the inflated tube with the soapy water."
                },
                {
                    "ai_id": "task_3c",
                    "description": "Look for bubbles forming",
                    "order": 3,
                    "status": "not_started",
                    "guidance": "Watch closely — bubbles will appear at the puncture site. Mark it with a pen or chalk."
                }
            ]
        },
        {
            "ai_id": "task_4",
            "description": "Apply the puncture repair patch",
            "order": 4,
            "status": "not_started",
            "requires_input": False,
            "guidance": "Use a standard puncture repair kit. Make sure the area is clean and dry before applying.",
            "subtasks": [
                {
                    "ai_id": "task_4a",
                    "description": "Roughen the area around the puncture with sandpaper",
                    "order": 1,
                    "status": "not_started",
                    "guidance": "This helps the glue bond to the rubber. Roughen an area slightly larger than the patch."
                },
                {
                    "ai_id": "task_4b",
                    "description": "Apply rubber cement and wait 2 minutes",
                    "order": 2,
                    "status": "not_started",
                    "guidance": "Spread a thin, even layer over the roughened area. Wait until it becomes tacky."
                },
                {
                    "ai_id": "task_4c",
                    "description": "Press the patch firmly over the puncture",
                    "order": 3,
                    "status": "not_started",
                    "guidance": "Peel the backing off the patch, centre it over the hole, and press hard for 30 seconds."
                }
            ]
        },
        {
            "ai_id": "task_5",
            "description": "Reassemble the wheel and inflate the tyre",
            "order": 5,
            "status": "not_started",
            "requires_input": False,
            "guidance": "Put the tube back in, reseat the tyre on the rim, reattach the wheel, and inflate to the pressure shown on the tyre sidewall.",
            "subtasks": []
        }
    ]
}


# =============================================================================
# After tasks 1 & 2 completed, user says "Make task_3 easier"
# task_1 and task_2 are marked completed, task_3 simplified
# =============================================================================

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
            "guidance": "Simplified approach — no water needed, just use your hands.",
            "subtasks": [
                {
                    "ai_id": "task_3a_new",
                    "description": "Just use your fingers to feel for escaping air",
                    "order": 1,
                    "status": "not_started",
                    "guidance": "Inflate the tube well, then slowly move your hand around it. You'll feel a stream of air at the puncture."
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