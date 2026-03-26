from fastapi import APIRouter
from app.services.stripe_service import create_checkout_session
from app.database import supabase

credits_router = APIRouter() #main router for credits

@credits_router.post("/credits/buy")
def buy_credits(user_id: str, amount_eur: float):

    checkout_url = create_checkout_session(user_id, amount_eur)

    return {
        "checkout_url": checkout_url
    }

@credits_router.post("/credits/add-after-payment")
def add_creddits(user_id: str, amount: float):

    res = supabase.table("user_credits")\
        .select("*")\
        .eq("user_id", user_id)\
        .execute()
    
    data = res.data

    if data:
        current = data[0]["credits"]

        supabase.table("user_credits").update({
            "credits": current + amount
        }).eq("user_id", user_id).execute()
    
    else:
        supabase.table("user_credits").insert({
            "user_id": user_id,
            "credits": amount
        }).execute()
    
    return {"message": "Credits added"}


def get_credits(user_id: str):

    res = supabase.table