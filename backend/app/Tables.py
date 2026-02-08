from app.database import supabase
from app.config import settings




######CHECK IF CONNECTION WITH SUPABASE IS ON############


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

#insert a new goal with goal_data JSON
def create_goal_with_data(user_id: str, title: str, goal_data: dict):
    """
    Create a goal with the full goal_data JSON structure.
    
    Args:
        user_id: The user's ID
        title: Goal title (stored separately for easy querying)
        goal_data: The full goal structure (nodes, edges, goal_type, etc.)
    """
    exist_goal = supabase.table("goals").select("*").eq("user_id", user_id).eq("title", title).execute().data

    if exist_goal:
        print("Goal already exists!")
        return exist_goal[0]

    return supabase.table("goals").insert({
        "user_id": user_id,
        "title": title,
        "goal_data": goal_data
    }).execute()

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

 

def create_ai_task(goal_id, description, due_date=None, ai_generated = True):

    exist_task = supabase.table("tasks").select("*").eq("goal_id", goal_id).eq("description", description).eq("ai_generated", ai_generated).execute().data
    
    # if the task already exist and is ai generated will not allow it to be generated again.
    # might need to prompt to endit the already existing one when the modify task endpoint gets made
    if exist_task:
        print("AI task with this description already exists for this goal.")
        return exist_task[0]
    
    return supabase.table("tasks").insert({
        "goal_id": goal_id,
        "description": description,
        "due_date": due_date,
        "ai_generated": ai_generated
    }).execute()


#Update the status column in the tasks table(modify DB)
def update_task_status(task_id: str, status: str):
    return supabase.table("tasks").update(
        {"status": status}
    ).eq("id", task_id).execute() #this function will modify the status of an arbitrary task

##################    GET DATA        ####################33333


#Get all goals for a user
def get_all_goals(user_id):
    return supabase.table("goals").select("*").eq("user_id", user_id).execute().data

#Get all tasks for a specific goal
def get_tasks(goal_id):
    return supabase.table("tasks").select("*").eq("goal_id", goal_id).execute().data

#get ai generated tasks for a goal 
def get_ai_tasks(goal_id):
    return supabase.table("tasks").select("*").eq("goal_id", goal_id).eq("ai_generated", True).execute().data
# ================== TEST BLOCK ==================

if __name__ == "__main__":
    print("\n---- DATABASE FUNCTION TEST ----")

    TEST_USER_ID = settings.TEST_USER_ID

    user_result = create_user(TEST_USER_ID, "Test User", "test@test.com")
    print("User:", user_result)

    goal_result = create_goal(TEST_USER_ID, "Learn FastAPI", "Build backend", "2026-02-20")
    print("Goal:", goal_result)

    goal_id = goal_result.data[0]["id"] if hasattr(goal_result, "data") else goal_result["id"]

    task_result = create_task(goal_id, "Create endpoints", "2026-02-10")
    print("Task:", task_result)

    print("Goals:", get_all_goals(TEST_USER_ID))
    print("Tasks:", get_tasks(goal_id))

    print("\n---- TEST COMPLETE ----")

