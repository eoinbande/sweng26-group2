from app.database import supabase
from app.config import settings
import uuid
import json



# =============================================================================
# USER FUNCTIONS
# =============================================================================

def create_user(user_id, name, email):
    """
    Insert a new user into the profiles table.
    
    Checks for duplicate emails first — if the email already exists,
    returns the existing account instead of creating a duplicate.
    
    Called when: User signs up / creates a new profile.
    """
    # Check if this email is already registered
    exist_account = supabase.table("profiles").select("*").eq("email", email).execute().data

    # If email already exists, don't create a duplicate
    if exist_account:
        print("Error creating account, email already exist!")
        return exist_account[0]

    # Otherwise, create the new user
    return supabase.table("profiles").insert({
        "id": user_id,
        "name": name,
        "email": email
    }).execute()


# =============================================================================
# GOAL FUNCTIONS
# =============================================================================

def create_goal(user_id: str, title: str):
    """
    Create a new goal in the database with an EMPTY task list.
    
    Tasks are NOT saved here — they get added later when the user
    reviews the AI-generated plan and clicks "Accept".
    See save_tasks_to_db() for that step.
    
    Called when: User types a goal like "Fix my bike tyre" and hits submit.
    
    Returns: The created goal row (including the auto-generated goal UUID).
    """
    return supabase.table("goals").insert({
        "user_id": user_id,
        "title": title,
        "goal_data": json.dumps({"tasks": []})  # Empty until user accepts plan
    }).execute()

def get_all_goals(user_id: str):
    return supabase.table("goals").select("*").eq("user_id", user_id).execute().data


def get_goal(goal_id: str):
    result = supabase.table("goals").select("*").eq("id", goal_id).single().execute()
    return result.data


def update_goal_data(goal_id: str, goal_data: dict):
    """
    Update the goal_data JSONB column with new task data.
    
    This is the JSON blob that frontend reads from.
    Called internally by save_tasks_to_db(), merge_and_save_tasks(),
    update_task_status(), and add_subtasks_to_task() to keep the
    JSONB blob in sync with the tasks table.
    
    Args:
        goal_id: The goal's UUID
        goal_data: Dict like {"tasks": [...]} to store as JSON
    """
    return supabase.table("goals").update(
        {"goal_data": json.dumps(goal_data)}
    ).eq("id", goal_id).execute()


def delete_goal(goal_id: str):
    return supabase.table("goals").delete().eq("id", goal_id).execute()


# =============================================================================
# SAVING TASKS TO DATABASE
# =============================================================================
#
# These functions handle the critical step of taking AI-generated tasks
# (which only have ai_ids) and saving them to the database (adding UUIDs).
#
# Two scenarios:
#   1. First save (user clicks "Accept" on review screen) → save_tasks_to_db()
#   2. Feedback on active goal (user has progress) → merge_and_save_tasks()
#
# =============================================================================

def save_tasks_to_db(goal_id: str, tasks: list[dict]):
    """
    Save the full task list to BOTH goals.goal_data AND the tasks table.
    
    This is the main "Accept" function. It:
    1. Assigns a UUID to every task and subtask that doesn't have one yet
    2. Stores the full nested JSON in goals.goal_data (for frontend)
    3. Inserts individual rows into the tasks table (for backend queries)
    
    Called when: User clicks "Accept" on the review screen,
    confirming they're happy with the AI-generated plan.
    
    Args:
        goal_id: The goal's UUID (from create_goal)
        tasks: List of task dicts from AI/mock. Each task has ai_id but
               may not have a UUID yet. Subtasks are nested inside each task.
               
               Example input:
               [
                   {
                       "ai_id": "task_1",
                       "description": "Remove wheel from bike",
                       "order": 1,
                       "status": "not_started",
                       "requires_input": false,
                       "subtasks": [
                           {"ai_id": "task_1a", "description": "...", "order": 1, ...}
                       ]
                   }
               ]
    
    Returns: The same tasks list, but now with UUIDs added to every task/subtask.
    """
    # Step 1: Generate UUIDs for any task/subtask that doesn't have one yet
    # (First save = none have UUIDs. Merge scenario = some already do.)
    for task in tasks:
        if not task.get("id"):
            task["id"] = str(uuid.uuid4())
        for subtask in task.get("subtasks", []):
            if not subtask.get("id"):
                subtask["id"] = str(uuid.uuid4())

    # Step 2: Save the full nested JSON to goals.goal_data
    # This is what frontend will read — one query gets the whole task tree
    update_goal_data(goal_id, {"tasks": tasks})

    # Step 3: Insert individual rows into the tasks table
    # This lets backend do queries like "count completed" or "get by status"
    for task in tasks:
        # Insert the parent task (parent_id is None for top-level tasks)
        supabase.table("tasks").upsert({
            "id": task["id"],
            "ai_id": task["ai_id"],
            "goal_id": goal_id,
            "description": task["description"],
            "order": task["order"],
            "status": task.get("status", "not_started"),
            "requires_input": task.get("requires_input", False),
            "parent_id": None  # Top-level task, no parent
        }).execute()

        # Insert each subtask (parent_id points to the parent task's UUID)
        for subtask in task.get("subtasks", []):
            supabase.table("tasks").upsert({
                "id": subtask["id"],
                "ai_id": subtask["ai_id"],
                "goal_id": goal_id,
                "description": subtask["description"],
                "order": subtask["order"],
                "status": subtask.get("status", "not_started"),
                "requires_input": False,
                "parent_id": task["id"]  # Points to parent task's UUID
            }).execute()

    return tasks

def merge_and_save_tasks(goal_id: str, new_tasks: list[dict]):
    """
    Merge an updated task list (from AI feedback) with existing database tasks.
    
    THIS IS THE KEY FUNCTION that solves the "don't lose completed work" problem.
    
    The problem:
        User completed tasks 1 and 2, then gives feedback "make task 3 easier".
        AI returns a whole new task list. If we just overwrite, we lose the
        completed status and UUIDs for tasks 1 and 2.
    
    The solution:
        Match tasks by ai_id. If a task in the new list has the same ai_id
        as an existing task, we KEEP the existing UUID and completed status.
        New tasks (new ai_ids) get fresh UUIDs.
    
    Called when: User gives feedback on a goal that's already active
    (i.e., tasks have been saved to DB and user may have made progress).
    
    Args:
        goal_id: The goal's UUID
        new_tasks: The updated task list from AI after processing feedback.
                   Tasks have ai_ids. AI preserves ai_ids for unchanged tasks
                   and creates new ai_ids for brand new tasks.
    
    Returns: The merged task list with preserved UUIDs and statuses.
    """
    # Step 1: Get the current tasks from the database
    goal = get_goal(goal_id)
    current_data = goal.get("goal_data", {})
    # goal_data might be a JSON string or already parsed — handle both
    if isinstance(current_data, str):
        current_data = json.loads(current_data)
    current_tasks = current_data.get("tasks", [])

    # Step 2: Build a lookup map from ai_id → existing task data
    # This lets us quickly check "does this ai_id already exist in our DB?"
    ai_id_map = {}
    for task in current_tasks:
        ai_id_map[task["ai_id"]] = task  # e.g., "task_1" → {id: "uuid...", status: "completed", ...}
        for sub in task.get("subtasks", []):
            ai_id_map[sub["ai_id"]] = sub  # e.g., "task_3a" → {id: "uuid...", ...}

    # Step 3: Go through the new task list and merge with existing data
    for task in new_tasks:
        existing = ai_id_map.get(task["ai_id"])

        if existing:
            # This ai_id exists in our DB → KEEP the UUID so frontend doesn't break
            task["id"] = existing["id"]

            # If the task was already completed, DON'T let AI overwrite that
            # (AI might return status: "not_started" for a task user already finished)
            if existing.get("status") == "completed":
                task["status"] = "completed"
        else:
            # Brand new task (new ai_id) → needs a fresh UUID
            task["id"] = str(uuid.uuid4())

        # Same logic for subtasks
        for sub in task.get("subtasks", []):
            existing_sub = ai_id_map.get(sub["ai_id"])
            if existing_sub:
                sub["id"] = existing_sub["id"]  # Keep existing UUID
                if existing_sub.get("status") == "completed":
                    sub["status"] = "completed"  # Preserve completed status
            else:
                sub["id"] = str(uuid.uuid4())  # New subtask, new UUID

    # Step 4: Remove old non-completed tasks from the tasks table
    # We're about to re-insert the updated versions. Completed tasks stay safe
    # because we preserved their UUIDs and statuses above.
    supabase.table("tasks").delete().eq(
        "goal_id", goal_id
    ).neq("status", "completed").execute()

    # Step 5: Save the merged task list to both places (JSONB + tasks table)
    return save_tasks_to_db(goal_id, new_tasks)


# =============================================================================
# TASK STATUS FUNCTIONS
# =============================================================================
#
# These handle marking tasks as complete/in-progress.
# Remember: we update BOTH the tasks table AND goals.goal_data.
#
# =============================================================================

def get_tasks_for_goal(goal_id: str):
    return supabase.table("tasks").select("*").eq("goal_id", goal_id).execute().data


def get_task(task_id: str):
    result = supabase.table("tasks").select("*").eq("id", task_id).single().execute()
    return result.data


def update_task_status(task_id: str, status: str):
    """
    Update a task's status in BOTH the tasks table and goals.goal_data JSONB.
    
    This keeps the two storage locations in sync. We need to:
    1. Update the row in the tasks table (easy, just one UPDATE)
    2. Find the task inside the goal_data JSON blob and update it there too
    
    Called when: User ticks a task as done, or marks it in-progress.
    Frontend sends the task's UUID.
    
    Args:
        task_id: The task's UUID (this is what frontend sends)
        status: New status — "not_started", "in_progress", or "completed"
    
    Returns: The task row that was updated.
    """
    # Update 1: The tasks table row (straightforward)
    supabase.table("tasks").update(
        {"status": status}
    ).eq("id", task_id).execute()

    # Update 2: The goal_data JSONB blob
    # First, figure out which goal this task belongs to
    task = get_task(task_id)
    if task:
        goal_id = task["goal_id"]
        goal = get_goal(goal_id)
        goal_data = goal.get("goal_data", {})
        if isinstance(goal_data, str):
            goal_data = json.loads(goal_data)

        # Search through the tasks and subtasks in the JSON to find
        # the one matching this UUID, then update its status
        for t in goal_data.get("tasks", []):
            if t.get("id") == task_id:
                t["status"] = status
                break
            # Also check subtasks — the task_id might be a subtask
            for sub in t.get("subtasks", []):
                if sub.get("id") == task_id:
                    sub["status"] = status
                    break

        # Save the updated JSON back to the goals table
        update_goal_data(goal_id, goal_data)

    return task


def get_completed_task_count(goal_id: str) -> int:
    """
    Count how many tasks are completed for a goal.
    
    Uses the tasks table (this is exactly why we have individual rows —
    counting in JSONB would be much harder).
    
    Called when: Showing progress stats, checking if goal is fully done.
    """
    result = supabase.table("tasks").select("id", count="exact").eq(
        "goal_id", goal_id
    ).eq("status", "completed").execute()
    return result.count or 0


def get_total_task_count(goal_id: str) -> int:
    """
    Count total number of tasks + subtasks for a goal.
    
    Combined with get_completed_task_count, gives you progress like "3/7 done".
    """
    result = supabase.table("tasks").select("id", count="exact").eq(
        "goal_id", goal_id
    ).execute()
    return result.count or 0


# =============================================================================
# EXPAND TASK (breaking a task into subtasks)
# =============================================================================
#
# When a user finds a task too hard or gets stuck, they can "expand" it.
# This calls AI (or mock) to generate subtasks, then we save them.
#
# =============================================================================

def add_subtasks_to_task(goal_id: str, parent_task_id: str, subtasks: list[dict]):
    """
    Add subtasks to an existing task that currently has none.
    
    Used when user clicks "expand" or "I'm stuck" on a task.
    The AI generates subtasks, and this function saves them to both
    the tasks table and the goal_data JSONB.
    
    Args:
        goal_id: The goal's UUID
        parent_task_id: UUID of the task being expanded
        subtasks: List of subtask dicts from AI/mock. Each has ai_id
                  but no UUID yet.
                  
                  Example:
                  [
                      {"ai_id": "task_5a", "description": "Put tube back in tyre", "order": 1, ...},
                      {"ai_id": "task_5b", "description": "Fit tyre onto rim", "order": 2, ...}
                  ]
    
    Returns: The subtasks list with UUIDs assigned.
    """
    # Step 1: Assign UUIDs to each new subtask
    for sub in subtasks:
        if not sub.get("id"):
            sub["id"] = str(uuid.uuid4())

    # Step 2: Insert subtask rows into the tasks table
    # Each subtask's parent_id points to the parent task's UUID
    for sub in subtasks:
        supabase.table("tasks").upsert({
            "id": sub["id"],
            "ai_id": sub["ai_id"],
            "goal_id": goal_id,
            "description": sub["description"],
            "order": sub["order"],
            "status": "not_started",
            "requires_input": False,
            "parent_id": parent_task_id  # Links subtask to its parent
        }).execute()

    # Step 3: Update the goal_data JSONB to include these subtasks
    # Find the parent task in the JSON and add the subtasks array
    goal = get_goal(goal_id)
    goal_data = goal.get("goal_data", {})
    if isinstance(goal_data, str):
        goal_data = json.loads(goal_data)

    for task in goal_data.get("tasks", []):
        if task.get("id") == parent_task_id:
            task["subtasks"] = subtasks
            break

    update_goal_data(goal_id, goal_data)

    return subtasks






# ================== TEST BLOCK ==================

if __name__ == "__main__":
    print("\n---- DATABASE FUNCTION TEST ----")

    TEST_USER_ID = settings.TEST_USER_ID

    # Test 1: Create a user
    user_result = create_user(TEST_USER_ID, "Test User", "test@test.com")
    print("User:", user_result)

    # Test 2: Create a goal (starts with empty task list)
    goal_result = create_goal(TEST_USER_ID, "Fix my bike tyre")
    print("Goal:", goal_result)

    # Extract the goal ID from the response
    if hasattr(goal_result, "data") and goal_result.data:
        goal_id = goal_result.data[0]["id"]
    else:
        goal_id = goal_result["id"]

    # Test 3: Load mock tasks and save them (simulates "Accept" flow)
    # mock_response_templates.py lives in app/Mocked/
    from app.Mocked.mock_response_templates import get_mock_plan
    mock_plan = get_mock_plan("Fix my bike tyre")
    saved_tasks = save_tasks_to_db(goal_id, mock_plan["tasks"])
    print(f"Saved {len(saved_tasks)} tasks")

    # Test 4: Verify data is in both places
    print("Goals:", get_all_goals(TEST_USER_ID))
    print("Task rows:", get_tasks_for_goal(goal_id))
    print(f"Progress: {get_completed_task_count(goal_id)}/{get_total_task_count(goal_id)}")

    print("\n---- TEST COMPLETE ----")
