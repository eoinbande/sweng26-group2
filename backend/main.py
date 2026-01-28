from fastapi import FastAPI

app = FastAPI(title="Procrastination Solver API")

@app.get("/")
async def root():
    return {"message": "FastAPI is initialized! 🚀"}


