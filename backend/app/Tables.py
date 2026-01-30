#import os
from .database import supabase
from .config import settings
#from supabase import create_client




######CHECK IF CONNECTION WITH SUPABASE IS ON############

# Try fetching goals 
response = supabase.table("goals").select("*").eq("user_id", settings.TEST_USER_ID).execute()

# Print the full response to confirm connection
print("Full response object:", response)

# Print the data (may be empty)
print("Goals data:", response.data)





#we are required to do 2 main things: Store and Retrieve Data (WE ALSO NEED TO HANDLE DUPLICATION!)

###############    STORE DATA    ###################

#insert a new user(when user create a new pofile)
def create_user(user_id, name, email):

    exist_account = supabase.table("profiles").select("*").eq("email", email).execute().data

    #if email already exist, do not allow duplication
    if exist_account:
        print("Error creating account, email already exist!")
        return exist_account[0]
    
    #if it does not exist, create a new user
    return supabase.table("profiles").insert({
        "id": user_id,
        "name": name,
        "email": email
    }).execute() #we insert a new user in a row of table profiles

#insert a new goal
def create_goal(user_id, title, description, due_date=None):

    exist_goal = supabase.table("goals").select("*").eq("user_id", user_id).eq("title", title).execute().data


    #if goal already exist, do not allow duplication
    if exist_goal:
        print("Goal already exist!")
        return exist_goal[0]


    #if goal do no exist, create new goal 
    return supabase.table("goals").insert({
        "user_id": user_id,
        "title": title,
        "description": description,
        "due_date": due_date
    }).execute() #we insert a new goal to that user 

#insert a new task
def create_task(goal_id, description, due_date=None):

   
    exist_task = supabase.table("tasks").select("*").eq("goal_id", goal_id).eq("description", description).execute().data
    
    #if the task already exist, do not allow duplicates
    if exist_task:
        print("Task with this description already exists for this goal.")
        return exist_task[0]

    #else add task
    return supabase.table("tasks").insert({
        "goal_id": goal_id,
        "description": description,
        "due_date": due_date
    }).execute() #we insert a task to that goal


##################    GET DATA        ####################33333


#Get all goals for a user
def get_all_goals(user_id):
    return supabase.table("goals").select("*").eq("user_id", user_id).execute().data

#Get all tasks for a specific goal
def get_tasks(goal_id):
    return supabase.table("tasks").select("*").eq("goal_id", goal_id).execute().data


# ===================== TEST BLOCK =====================
# Run only when this file is executed directly
if __name__ == "__main__":
    print("\n---- STARTING DATABASE FUNCTION TEST ----")

    TEST_USER_ID_2 = "06d69836-1260-4226-aa9c-4b0b360f0da1"  # replace with real Auth user ID

    # 1️⃣ Create test user profile
    print("\nCreating test user profile...")
    user_result = create_user(TEST_USER_ID_2, "Test User 2", "test2@test.com")
    print("User result:", user_result)

    # 2️⃣ Create a goal
    print("\nCreating test goal...")
    goal_result = create_goal(TEST_USER_ID_2, "Learn FastAPI", "Build backend API", "2026-02-20")
    print("Goal result:", goal_result)

    # Get goal_id safely
    goal_id = goal_result.data[0]["id"] if hasattr(goal_result, "data") else goal_result["id"]

    # 3️⃣ Create a task
    print("\nCreating test task...")
    task_result = create_task(goal_id, "Create endpoints", "2026-02-10")
    print("Task result:", task_result)

    # 4️⃣ Fetch goals
    print("\nFetching all goals for user...")
    goals = get_all_goals(TEST_USER_ID_2)
    print(goals)

    # 5️⃣ Fetch tasks
    print("\nFetching all tasks for goal...")
    tasks = get_tasks(goal_id)
    print(tasks)

    print("\n---- TEST COMPLETE ----")

