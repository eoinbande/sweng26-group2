from openai import OpenAI
from app import schemas #FOR CI to pass
import os
import json
 
client = None

def get_client():
    global client
    if client is None:
        api_key = os.environ.get("OPENAI_API_KEY")
        if not api_key:
            raise RuntimeError("OPENAI_API_KEY environment variable is not set")
        client = OpenAI(api_key=api_key)
    return client

"""
userinput = The literal string the user sent
currentGoals = The existing JSON of the goals. Please pass as a JSON object; if it's a string, pass with json.loads()

output: A new goals list, as a JSON object
"""

def aiGenerate(userInput):
    response = get_client().responses.parse(
    instructions = """You are a goal planner. You will be prompted a complex goal by the user in {userInput}, and you must break down this 
                      goal into several smaller tasks. For each task, respect the response schema by adding an ID in
                      the ai_id field in the format "task_1", "task_2", etc. Do not initialise the id field, onlt the ai_id field.
                      Add a brief description of the task, the order in which these tasks should be taken (1, 2, 3) and the status 
                      of the task (completed / in_progress / not_started). For now, the task with the first order is in_progress, the rest
                      are not_started. Tasks may require further context. If a task is too complex to be a single
                      instruction, generate subtasks in the field, and give these ai_ids inheriting from the parent task (parent task_1
                      will have subtaks task_1a, task_1b, etc.) If the user prompt is too vague and further questions are needed,
                      generate a data-gathering task (e.g. find a date) and make requires_input true. Only do this if followup
                      info is needed. If a task is complex but does not need further info, you may instead make subtasks
                      which are each smaller tasks to take - format their id by appending letters (so task_7 will have subtasks
                      task_7a, task_7b, etc). Each information gathering task (i.e. where requires_input==true) should
                      only require a single input, do not group questions. Subtasks / input should only be used when absolutely neccessary.
                      Limit the number of main tasks to a maximum of five. If KEY information is missing from the prompt, do not generate
                      every task now. Instead, generate a smaller list of tasks (some with requires_input set to true) and gather further
                      information to later make a more accurate set of tasks. Do not assume any concrete info you have not been given.""",
    model = "gpt-5.2",
    input = userInput,
    text_format = schemas.AIGeneratePlanResponse #the AI is supposed to follow this schema but is not guarantee, how can we make it to be more guarantee?
    )
    data = json.loads(response.output_text)
    tokens = response.usage.total_tokens if response.usage else 0 #get the tokens per call
    carbon = estimate_carbon_usage(tokens) #Call the function to estimate carbon usage

    data["tokens_used"] = tokens #show data of tokens used per cal
    data["carbon_footprint"] = carbon #show data of carbon footprint per call

    return data


def aiFeedback(userInput, currentGoals):
    response = get_client().responses.parse(
    instructions = """You are a goal planner, with the job of revising an existing list of tasks. Observe the JSON list given in {currentGoals},
                      alongside the feedback provided by {userInput}. With the feedback, revise the list to adhere to the user request, with
                      an overarching focus on creating a list of easily achievable tasks. Your output should be a JSON with similar formatting
                      to the passed JSON. Retain all existing information on tasks you were passed that do not need updating, and do not
                      initialise ids for any new tasks. For new tasks, set ai_ids in the format "task_6", "task_7" etc. continuing from wherever
                      the original tasks ended. You may need to change the order field if some of the new tasks should be undertaken sooner
                      than existing tasks that have been retained. If the user prompt is too vague and further questions are needed,
                      generate a data-gathering task (e.g. find a date) and make requires_input true. Only do this if followup
                      info is needed. If a task is complex but does not need further info, you may instead make subtasks
                      which are each smaller tasks to take - format their id by appending letters (so task_7 will have subtasks
                      task_7a, task_7b, etc). Each information gathering task (i.e. where requires_input==true) should
                      only require a single input, do not group questions. Subtasks should only be used when absolutely neccessary.
                      Limit the number of new tasks to a maximum of five. You may delete tasks which are rendered redundant by new tasks.
                      Importantly, NEVER geneerate a new task with an ai_id equal to or lower than the highest ai_id you were passeed. For
                      example, if you were passed a task with ai_id "task_7", the LOWEST ai_id you may generate is "task_8". Consider
                      carefully where to restructure the "order" of the tasks for this change of plans to fit in properly."""
                      + json.dumps(currentGoals),
    model = "gpt-5.2",
    input = userInput,
    text_format = schemas.AIFeedbackResponse
    )
    data = json.loads(response.output_text)

    tokens = response.usage.total_tokens if response.usage else 0
    carbon = estimate_carbon_usage(tokens)

    data["tokens_used"] = tokens
    data["carbon_footprint"] = carbon

    return data

def aiExpand(userInput, currentGoals):
    response = get_client().responses.parse(
    instructions = """You are a goal planner, with a focus on expanding a task into a group of smaller subtasks. You will be passed a
                     {userInput} which will include an identified task (the user may mention "task 1", "the first task", etc.) from
                     {currentGoals}. If the user does not explicitly state a task, but says something to the effect of "my current task", assume
                     the focused task is the one with the lowest order parameter with status as in_progress. With the identified task in mind,
                     out to the schema the ai_id of the selected task (e.g. task_3), and output a list of subtasks. Keep this list to five
                     entries or less, and generate ai_ids according to the parent task's ai_id (for parent task_3, make the subtasks task_3a,
                     task_3b, etc.). Do NOT populate the id field, and initialise all status to "not_started" """
                     + json.dumps(currentGoals),
    model = "gpt-5.2",
    input = userInput,
    text_format = schemas.AIExpandTaskResponse
    )
    return json.loads(response.output_text)


# Little bit of test code just for prompt engineering, feel free to ignore
"""
response1 = aiGenerate("I want to learn piano")
print(json.dumps(response1) + "\n")
response2 = aiFeedback("My fingers hurt", response1)
print(json.dumps(response2) + "\n")
response3 = aiExpand("Help me break down task 3", response2)
print(json.dumps(response3) + "\n")
"""

#this function calculates the average carbon usage per call
def estimate_carbon_usage(tokens):
    energy_per_token = 0.000002
    carbon_average = 0.4

    energy = tokens * energy_per_token
    total_carbon_per_call = energy * carbon_average

    return total_carbon_per_call