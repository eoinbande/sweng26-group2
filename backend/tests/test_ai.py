import os
import pytest

# Skip all tests in this file if API key is not set (e.g. in CI)
pytestmark = pytest.mark.skipif(
    not os.environ.get("OPENAI_API_KEY"),
    reason="OPENAI_API_KEY not set — skipping live AI tests"
)

from app.services.ai_service import AIService  # noqa: E402

ai = AIService()


# Test AI generation
def test_ai_generate_plan():
    plan = ai.generate_plan("help me learn python in 30 days")
    print("AI plan:", plan)
    assert "tasks" in plan


# Test AI feedback
def test_ai_feedback():
    plan = ai.generate_plan("help me learn python in 30 days")
    feedback_plan = ai.revise_plan(
        user_input="Make the tasks shorter and more daily",
        current_goals=plan.get("tasks", [])
    )
    print("Updated plan:", feedback_plan)
    assert "tasks" in feedback_plan


# Test task expansion
# Let's expand the first task for demonstration
def test_ai_expand_task():
    plan = ai.generate_plan("help me learn python in 30 days")
    feedback_plan = ai.revise_plan(
        user_input="Make the tasks shorter and more daily",
        current_goals=plan.get("tasks", [])
    )
    task_to_expand = feedback_plan["tasks"][0]  # pick the first task
    expanded_task = ai.expand_task(
        user_input="Expand this task into smaller daily subtasks with guidance",
        current_goals=task_to_expand
    )
    print("Expanded task:", expanded_task)
    assert "subtasks" in expanded_task


""" Output i am getting in my local machine!
AI plan: {'description': 'Learn Python in 30 days', 'goal_due_date': None, 'tasks': [{'ai_id': 'task_1', 'id': None, 'description': 'Set up your Python learning environment and pick a learning track (resources + daily schedule) for the next 30 days', 'order': 1, 'status': 'in_progress', 'due_date': None, 'guidance': 'Install Python 3, choose an editor (VS Code recommended), and decide on a primary course/book + practice site. Block 45–90 minutes daily.', 'requires_input': False, 'subtasks': [{'ai_id': 'task_1a', 'id': None, 'description': 'Install Python 3 and confirm it runs (python --version)', 'order': 1, 'status': 'not_started', 'due_date': None, 'guidance': None}, {'ai_id': 'task_1b', 'id': None, 'description': 'Install and configure an editor (e.g., VS Code) and create a project folder', 'order': 2, 'status': 'not_started', 'due_date': None, 'guidance': None}, {'ai_id': 'task_1c', 'id': None, 'description': 'Choose one main learning resource (course/book) to follow for 30 days', 'order': 3, 'status': 'not_started', 'due_date': None, 'guidance': None}, {'ai_id': 'task_1d', 'id': None, 'description': 'Create a daily study schedule for 30 days (time block + what to cover)', 'order': 4, 'status': 'not_started', 'due_date': None, 'guidance': None}]}, {'ai_id': 'task_2', 'id': None, 'description': 'Learn Python fundamentals (syntax, variables, types, conditionals, loops, functions) and complete daily practice problems', 'order': 2, 'status': 'not_started', 'due_date': None, 'guidance': 'Aim for ~14 days: learn a concept, write small scripts, then do 5–15 practice exercises daily.', 'requires_input': False, 'subtasks': []}, {'ai_id': 'task_3', 'id': None, 'description': 'Learn core data structures and modules (strings, lists, tuples, dicts, sets, files, exceptions, standard library basics) with hands-on exercises', 'order': 3, 'status': 'not_started', 'due_date': None, 'guidance': 'Aim for ~8 days: build small utilities (text/file processing, simple CLI tools) to apply each concept.', 'requires_input': False, 'subtasks': []}, {'ai_id': 'task_4', 'id': None, 'description': 'Learn intermediate topics (OOP, iterators/generators, virtual environments, testing, debugging) and apply them in mini-projects', 'order': 4, 'status': 'not_started', 'due_date': None, 'guidance': 'Aim for ~5 days: write at least 2 mini-projects and add simple tests.', 'requires_input': False, 'subtasks': []}, {'ai_id': 'task_5', 'id': None, 'description': 'Build and polish a final capstone project, then review and plan next steps (specialization + continued practice)', 'order': 5, 'status': 'not_started', 'due_date': None, 'guidance': 'Aim for ~3 days: ship one project end-to-end (README, clean code), then identify gaps to study next (web, data, automation, etc.).', 'requires_input': False, 'subtasks': []}]}
Updated plan: {'tasks': [{'ai_id': 'task_1', 'id': None, 'description': 'Set up your Python environment and choose a 30-day learning track + daily time block', 'order': 1, 'status': 'in_progress', 'due_date': None, 'guidance': 'Install Python 3, choose an editor (VS Code recommended), pick one main resource, and block 45–90 minutes daily.', 'requires_input': False, 'subtasks': [{'ai_id': 'task_1a', 'id': None, 'description': 'Install Python 3 and confirm it runs (python --version)', 'order': 1, 'status': 'not_started', 'due_date': None, 'guidance': None}, {'ai_id': 'task_1b', 'id': None, 'description': 'Install VS Code (or another editor) and create a project folder', 'order': 2, 'status': 'not_started', 'due_date': None, 'guidance': None}, {'ai_id': 'task_1c', 'id': None, 'description': 'Choose one main learning resource to follow for 30 days', 'order': 3, 'status': 'not_started', 'due_date': None, 'guidance': None}, {'ai_id': 'task_1d', 'id': None, 'description': 'Pick a daily study time and add it to your calendar for 30 days', 'order': 4, 'status': 'not_started', 'due_date': None, 'guidance': None}]}, {'ai_id': 'task_2', 'id': None, 'description': 'Daily: learn one fundamentals concept and write a tiny script', 'order': 2, 'status': 'not_started', 'due_date': None, 'guidance': 'Do 20–40 min learning + 20–40 min coding. Rotate: variables/types, conditionals, loops, functions.', 'requires_input': False, 'subtasks': []}, {'ai_id': 'task_3', 'id': None, 'description': 'Daily: practice 5–10 Python problems (from easy upward)', 'order': 3, 'status': 'not_started', 'due_date': None, 'guidance': 'Use one site (e.g., Exercism/LeetCode/HackerRank). Track what you miss and redo the next day.', 'requires_input': False, 'subtasks': []}, {'ai_id': 'task_4', 'id': None, 'description': 'Daily: learn one data structure/module topic and apply it in a short exercise', 'order': 4, 'status': 'not_started', 'due_date': None, 'guidance': 'Rotate: strings, lists/tuples, dicts/sets, files, exceptions, useful stdlib modules.', 'requires_input': False, 'subtasks': []}, {'ai_id': 'task_5', 'id': None, 'description': 'Daily: build your capstone in small increments and keep notes of what to learn next', 'order': 5, 'status': 'not_started', 'due_date': None, 'guidance': 'Spend 30–60 min/day. Each day produce something visible: a feature, test, refactor, or README update.', 'requires_input': False, 'subtasks': []}]}
Expanded task: {'task_ai_id': 'task_1', 'subtasks': [{'ai_id': 'task_1a', 'id': None, 'description': 'Day 1: Confirm Python + pip are installed and working', 'order': 1, 'status': 'not_started', 'due_date': None, 'guidance': 'Open a terminal and run: `python --version` (or `python3 --version`) and `pip --version`. If either fails, install Python 3 from python.org and re-run the commands. Stop once both commands work.'}, {'ai_id': 'task_1b', 'id': None, 'description': 'Day 2: Set up your editor and run a first script', 'order': 2, 'status': 'not_started', 'due_date': None, 'guidance': "Install VS Code (or your preferred editor). Create a folder (e.g., `python_practice/`), add `hello.py` with `print('Hello, world!')`, and run it from the terminal: `python hello.py`."}, {'ai_id': 'task_1c', 'id': None, 'description': 'Day 3: Create a simple project structure + progress log', 'order': 3, 'status': 'not_started', 'due_date': None, 'guidance': 'Inside `python_practice/`, create: `exercises/`, `notes/`, and a `progress.md` (or `progress.txt`). Add today’s entry: date, what you did, and 1 thing to do next.'}, {'ai_id': 'task_1d', 'id': None, 'description': 'Day 4: Choose a daily time and set up a 30-day checklist', 'order': 4, 'status': 'not_started', 'due_date': None, 'guidance': 'Pick a consistent 30–60 minute slot. Create a checklist in `progress.md` with Day 1–30. Add a rule: “minimum is 10 minutes; if busy, do 10 and still check the day off.”'}, {'ai_id': 'task_1e', 'id': None, 'description': 'Day 5: Dry-run the routine with a tiny exercise', 'order': 5, 'status': 'not_started', 'due_date': None, 'guidance': 'At your chosen time, do a 30-minute session: write a short script in `exercises/` that asks for a name and prints a greeting. Log completion in `progress.md` and note any friction (setup issues, distractions) to fix tomorrow.'}]}

"""