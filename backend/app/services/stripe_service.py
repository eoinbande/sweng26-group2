import stripe
import os

stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

def create_checkout_session(amount_eur, user_id):
    return stripe.checkout.Session.create(
        payment_method_types=["card"],
        line_items=[{
            "price_data": {
                "currency": "eur",
                "prduct_data": {"name": "Carbon Credits"},
                "unit_amount": int(amount_eur * 100),
            },
            "quantity": 1
        }],
        mode = "payment",
        success_url="https://sweng26-group2.vercel.app/success?user_id={user_id}&amount={amount_eur}"
        cancel_url="https://sweng26-group2.vercel.app/cancel"
        metadata = {"user_id": user_id}
    )
#user enters test card: 4242 4242 4242 4242