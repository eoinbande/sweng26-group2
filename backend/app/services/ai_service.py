from app.aicalls import aiGenerate, aiFeedback, aiExpand

#This file is centralized service layer which will call the AI functions
#routers will call the service, which calls the real AI!

class AIService:
    def generate_plan(self, user_input: str):
        return aiGenerate(user_input)

    def revise_plan(self, user_input: str, current_goals):
        return aiFeedback(user_input, current_goals)

    def expand_task(self, user_input: str, current_goals):
        return aiExpand(user_input, current_goals)


"""Central place for error handling and logging"""