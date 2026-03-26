from fastapi import APIRouter
from app.services.stripe_service import create_checkout_session

credits_router = APIRouter() #main router for credits

@credits_router.post("/credits/buy")
def buy_credits(user_id: str, amount_eur: float):

    checkout_url = create_checkout_session(user_id, amount_eur)

    return {
        "checkout_url": checkout_url
    }