import stripe
import os

stripe.api_key = os.getenv("STRIPE_SECRET_KEY") #get secret key from env

def create_checkout_session(amount_eur, user_id):
    session = stripe.checkout.Session.create(
        payment_method_types=["card"],
        line_items=[{
            "price_data": {
                "currency": "eur",
                "product_data": {"name": "Carbon Credits"},
                "unit_amount": int(amount_eur * 100),
            },
            "quantity": 1
        }],
        mode = "payment",
        success_url=f"https://sweng26-group2.vercel.app/success?user_id={user_id}&amount={amount_eur}",
        cancel_url="https://sweng26-group2.vercel.app/cancel",
        metadata = {"user_id": user_id}
    )
    return session.url

#user enters test card: 4242 4242 4242 4242