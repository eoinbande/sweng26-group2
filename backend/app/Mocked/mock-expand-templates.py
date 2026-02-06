from app.schemas.ai_models import TaskNode, Edge

""" GOAL OF THIS .py FILE: there will be MOCK templates
which will show the feedback given by AI when a User 
wants to break down a specific task """

#the feedback subtasks will follow the model of AIExpandTaskResponse()

#we want to do to the following modification: "new_nodes", "remove_edges", "new_edges"

#following example: goal: Find puncture in tube
mock_feedback_templates = {
    "task_3": {
        "new_nodes": [
            TaskNode(id = "task_6", task = "Inflate tube sligtly to hear air leak"),
            TaskNode(id = "task_7", task = "Submerge tube in water to see bubbles"),
            TaskNode(id = "task_8", task = "Mark the hole with chalk")
        ],
        "edged_to_remove": [
            Edge(head = "task_3", tail = "task_4")
        ],
        "new_edges": [
            Edge(head="task_3", tail = "task_6"), #task3 -> task6
            Edge(head="task_6", tail ="task_7"), #task6 -> task7
            Edge(head="task_7", tail ="task_8"), #task7 -> task8
            Edge(head="task_8", tail ="task_4") #task8 -> task4
        ]
    }
}


#following example