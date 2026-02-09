from app.schemas.ai_responses import TaskNode, Edge

""" GOAL OF THIS .py FILE: Mock the INITIAL AI responses when a user
first creates a goal. These are the starting point BEFORE the user
clicks "I'm stuck" and gets the expanded templates from mock_expand_templates.py """

# These represent what AI returns when user first creates a goal
mock_initial_goal_responses = {
    
    # Example 1: SPECIFIC Goal (Linear) - Fix Bike Tire
    "fix_my_bike_tire": {
        "goal_type": "SPECIFIC",
        "title": "Fix my bike tire",
        "description": "Step-by-step guide to repair a flat or damaged bike tire, from removing the wheel to reinflating.",
        "nodes": [
            TaskNode(id="task_1", task="Remove wheel from bike", est_time=10),
            TaskNode(id="task_2", task="Take tire off rim", est_time=15),
            TaskNode(id="task_3", task="Find puncture in tube", est_time=10),
            TaskNode(id="task_4", task="Patch hole or replace tube", est_time=20),
            TaskNode(id="task_5", task="Reinstall tire and inflate", est_time=10)
        ],
        "edges": [
            Edge(head="task_1", tail="task_2"),
            Edge(head="task_2", tail="task_3"),
            Edge(head="task_3", tail="task_4"),
            Edge(head="task_4", tail="task_5")
        ]
    },
    
    # Example 2: HABIT Goal (Cyclical) - Morning Exercise
    "morning_exercise_routine": {
        "goal_type": "HABIT",
        "title": "Morning exercise routine",
        "description": "Build a consistent daily morning workout habit with warm-up, exercise, and cool-down.",
        "nodes": [
            TaskNode(id="task_20", task="Wake up and drink water", est_time=2),
            TaskNode(id="task_21", task="5-min warm-up stretches", est_time=5),
            TaskNode(id="task_22", task="20-min workout", est_time=20),
            TaskNode(id="task_23", task="5-min cool-down", est_time=5)
        ],
        "edges": [
            Edge(head="task_20", tail="task_21"),
            Edge(head="task_21", tail="task_22"),
            Edge(head="task_22", tail="task_23")
        ]
    },
    
    # Example 3: GENERAL Goal (Branching) - Wedding Planning
    "plan_my_sisters_wedding": {
        "goal_type": "GENERAL",
        "title": "Plan my sister's wedding",
        "description": "Coordinate all the key aspects of wedding planning, from budget to venue to guest list.",
        "nodes": [
            TaskNode(id="task_10", task="Set overall budget", est_time=60),
            TaskNode(id="task_11", task="Book venue", est_time=120),
            TaskNode(id="task_12", task="Choose caterer", est_time=90),
            TaskNode(id="task_13", task="Send save-the-dates", est_time=45),
            TaskNode(id="task_14", task="Finalize guest list", est_time=30)
        ],
        "edges": [
            Edge(head="task_10", tail="task_11"),  # Budget must be set first
            Edge(head="task_10", tail="task_12"),  # Then these can be parallel
            Edge(head="task_10", tail="task_14"),
            Edge(head="task_14", tail="task_13")   # Guest list before save-the-dates
        ]
    },
    
    # Example 4: SPECIFIC Goal (Linear) - Cooking Recipe
    "bake_chocolate_cake": {
        "goal_type": "SPECIFIC",
        "title": "Bake a chocolate cake",
        "description": "Follow a simple recipe to bake a delicious homemade chocolate cake from scratch.",
        "nodes": [
            TaskNode(id="task_30", task="Mix dry ingredients", est_time=5),
            TaskNode(id="task_31", task="Bake the cake", est_time=45),
            TaskNode(id="task_35", task="Let cool and frost", est_time=30)
        ],
        "edges": [
            Edge(head="task_30", tail="task_31"),
            Edge(head="task_31", tail="task_35")
        ]
    },
    
    # Additional example: Study for exam (LINEAR)
    "study_for_biology_exam": {
        "goal_type": "SPECIFIC",
        "title": "Study for biology exam",
        "description": "A structured study plan covering notes review, textbook reading, practice problems, and a mock test.",
        "nodes": [
            TaskNode(id="task_40", task="Review lecture notes from past 4 weeks", est_time=120),
            TaskNode(id="task_41", task="Read textbook chapters 5-8", est_time=180),
            TaskNode(id="task_42", task="Complete practice problems", est_time=90),
            TaskNode(id="task_43", task="Make flashcards for key terms", est_time=60),
            TaskNode(id="task_44", task="Take practice test", est_time=60)
        ],
        "edges": [
            Edge(head="task_40", tail="task_41"),
            Edge(head="task_41", tail="task_42"),
            Edge(head="task_42", tail="task_43"),
            Edge(head="task_43", tail="task_44")
        ]
    },
    
    # Additional example: Home organization project (BRANCHING)
    "organize_home_office": {
        "goal_type": "GENERAL",
        "title": "Organize home office",
        "description": "Declutter, reorganize, and deep clean your home office for a more productive workspace.",
        "nodes": [
            TaskNode(id="task_50", task="Declutter desk surface", est_time=30),
            TaskNode(id="task_51", task="Sort through papers and files", est_time=60),
            TaskNode(id="task_52", task="Organize cables and tech equipment", est_time=45),
            TaskNode(id="task_53", task="Set up filing system", est_time=90),
            TaskNode(id="task_54", task="Deep clean the space", est_time=40)
        ],
        "edges": [
            Edge(head="task_50", tail="task_51"),
            Edge(head="task_50", tail="task_52"),
            Edge(head="task_51", tail="task_53"),
            Edge(head="task_52", tail="task_54"),
            Edge(head="task_53", tail="task_54")
        ]
    },
    
    # Additional example: Fitness habit (CYCLICAL)
    "daily_meditation": {
        "goal_type": "HABIT",
        "title": "daily meditation practice",
        "description": "Establish a calming daily meditation routine with breathing exercises and journaling.",
        "nodes": [
            TaskNode(id="task_60", task="Find quiet space", est_time=2),
            TaskNode(id="task_61", task="Set timer for 10 minutes", est_time=1),
            TaskNode(id="task_62", task="Focus on breathing", est_time=10),
            TaskNode(id="task_63", task="Journal about experience", est_time=5)
        ],
        "edges": [
            Edge(head="task_60", tail="task_61"),
            Edge(head="task_61", tail="task_62"),
            Edge(head="task_62", tail="task_63")
        ]
    }
}


# Example of how these would be used in the API
def get_initial_goal_breakdown(user_prompt: str):
    """
    This simulates what the AI endpoint would return when a user
    first creates a goal. In production, this would call the actual
    AI model to generate the breakdown.
    
    For testing purposes, we match the user prompt to our mock data.
    """
    
    # Simple keyword matching for demo purposes
    prompt_lower = user_prompt.lower()
    
    if "bike" in prompt_lower and "tire" in prompt_lower:
        return mock_initial_goal_responses["fix_my_bike_tire"]
    elif "exercise" in prompt_lower or "workout" in prompt_lower:
        return mock_initial_goal_responses["morning_exercise_routine"]
    elif "wedding" in prompt_lower:
        return mock_initial_goal_responses["plan_my_sisters_wedding"]
    elif "cake" in prompt_lower or "bake" in prompt_lower:
        return mock_initial_goal_responses["bake_chocolate_cake"]
    elif "exam" in prompt_lower or "study" in prompt_lower:
        return mock_initial_goal_responses["study_for_biology_exam"]
    elif "office" in prompt_lower or "organize" in prompt_lower:
        return mock_initial_goal_responses["organize_home_office"]
    elif "meditation" in prompt_lower or "meditate" in prompt_lower:
        return mock_initial_goal_responses["daily_meditation"]
    else:
        # Default fallback
        return None


# RELATIONSHIP BETWEEN FILES:
# 
# 1. USER CREATES GOAL:
#    User: "I want to fix my bike tire"
#    → API calls AI
#    → Returns mock_initial_goal_responses["fix_my_bike_tire"]
#    → Saved to DB as initial goal structure
#
# 2. USER GETS STUCK:
#    User clicks "I'm stuck" on task_3
#    → API looks up which task is stuck
#    → Calls AI with context: "User stuck on: Find puncture in tube"
#    → Returns mock_expand_templates["task_3"]
#    → DB updated with new nodes/edges inserted
#
# 3. RESULT:
#    Initial simple task becomes expanded with detailed subtasks
