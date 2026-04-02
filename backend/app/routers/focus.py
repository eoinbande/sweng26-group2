from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.database import supabase

focus_router = APIRouter()


class PlantCreate(BaseModel):
    user_id: str
    goal_id: str
    goal_title: Optional[str] = None
    duration: int       # minutes elapsed (or full duration if completed)
    completed: bool
    deep_focus: bool
    status: str         # "alive" | "dead"


@focus_router.post("/focus/plants")
def save_plant(plant: PlantCreate):
    """
    Save a focus plant to the garden.
    Called when:
      - A session completes successfully (status='alive')
      - A deep focus session is abandoned (status='dead')
    """
    if plant.status not in ("alive", "dead"):
        raise HTTPException(status_code=400, detail="status must be 'alive' or 'dead'")

    result = supabase.table("focus_plants").insert(plant.model_dump()).execute()
    return result.data[0]


@focus_router.get("/focus/plants/{user_id}")
def get_plants(user_id: str):
    """
    Get all plants in a user's garden, newest first.
    """
    result = (
        supabase.table("focus_plants")
        .select("*")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .execute()
    )
    return {"plants": result.data or []}
