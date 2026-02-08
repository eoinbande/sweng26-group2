from app.schemas.ai_responses import TaskNode, Edge

""" GOAL OF THIS .py FILE: there will be MOCK templates
which will show the feedback given by AI when a User 
wants to break down a specific task """

#the feedback subtasks will follow the model of AIExpandTaskResponse()

#we want to do to the following modification: "new_nodes", "remove_edges", "new_edges"

#following example: goal: fix Bike (linear)
mock_feedback_templates = {
    "task_3": { #Find puncture in tube
        "new_nodes": [ #create new nodes
            TaskNode(id = "task_6", task = "Inflate tube sligtly to hear air leak"),
            TaskNode(id = "task_7", task = "Submerge tube in water to see bubbles"),
            TaskNode(id = "task_8", task = "Mark the hole with chalk")
        ],
        "edges_to_remove": [ #remove edges
            Edge(head = "task_3", tail = "task_4")
        ],
        "new_edges": [ #create new edges that connect the new nodes
            Edge(head="task_3", tail = "task_6"), #task3 -> task6
            Edge(head="task_6", tail ="task_7"), #task6 -> task7
            Edge(head="task_7", tail ="task_8"), #task7 -> task8
            Edge(head="task_8", tail ="task_4") #task8 -> task4
        ]
    },


    #following example: Habit goal - Morning Exercise(Cyclical)
    "task_22": {  # "20-min workout" task
        "new_nodes": [
            TaskNode(id="task_28", task="Do just 10 minutes instead", is_adaptation=True),
            TaskNode(id="task_29", task="Focus on stretching if too tired for cardio", is_adaptation=True)
        ],
        "edges_to_remove": [
            Edge(head="task_22", tail="task_23")  #remove edge to take a break 
        ],
        "new_edges": [
            Edge(head="task_22", tail="task_28"),
            Edge(head="task_28", tail="task_29"),
            Edge(head="task_29", tail="task_23")  #reconnect
        ]
    },

    #following example: GENERAL (Branching) Wedding Planning (USER CAN DO TASKS IN PARALLEL)
    "task_11": {  # "Book venue" task
        "new_nodes": [
            TaskNode(id="task_15", task="Google venues within 20 miles"),
            TaskNode(id="task_16", task="Filter venues by max capacity"),
            TaskNode(id="task_17", task="Email top 3 venues for quotes")
        ],
        "edges_to_remove": [],  # no edges to remove, just adding subtasks
        "new_edges": [
            Edge(head="task_11", tail="task_15"),
            Edge(head="task_11", tail="task_16"),
            Edge(head="task_11", tail="task_17")
        ]
    },

    #following example: LINEAR cooking recipe
     "task_31": {  # "Bake the cake" task
        "new_nodes": [
            TaskNode(id="task_32", task="Preheat oven to 180°C"),
            TaskNode(id="task_33", task="Grease the baking pan"),
            TaskNode(id="task_34", task="Pour batter into pan")
        ],
        "edges_to_remove": [
            Edge(head="task_31", tail="task_35")  # original next step
        ],
        "new_edges": [
            Edge(head="task_31", tail="task_32"),
            Edge(head="task_32", tail="task_33"),
            Edge(head="task_33", tail="task_34"),
            Edge(head="task_34", tail="task_35")
        ]
    }
}

#TOTAL OF 4 EXAMPLES FOR MOCKED AI RESPONSES (FEEDBACK)



