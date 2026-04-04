from app.database import supabase
from app.services.stripe_service import create_checkout_session
import uuid

USER_ID = "test_user_123"
TEST_MONTH = "2026-03"
test_user_id = str(uuid.uuid4()) #generate random id

from app.database import supabase
import uuid

def create_test_user(name="Test User", email="test@example.com"):
    user_id = str(uuid.uuid4())
    
    existing = supabase.table("profiles").select("*").eq("email", email).execute().data
    if existing:
        print("User already exists, using existing id")
        return existing[0]["id"]

    supabase.table("profiles").insert({
        "id": user_id,
        "name": name,
        "email": email
    }).execute()
    
    return user_id

# Usage
test_user_id = create_test_user()
print("Test user id:", test_user_id)


def create_fake_logs():
    print("\n🔹 Creating fake AI usage logs...")

    supabase.table("ai_usage_logs").insert([
        {
            "user_id": test_user_id,
            "tokens_used": 1000,
            "carbon_footprint": 0.02
        },
        {
            "user_id": test_user_id,
            "tokens_used": 500,
            "carbon_footprint": 0.01
        }
    ]).execute()

    print("✅ Logs inserted (total carbon ≈ 0.03)")


def check_offset_status():
    print("\n🔹 Checking carbon status...")

    logs_res = supabase.table("ai_usage_logs")\
        .select("*")\
        .eq("user_id", test_user_id)\
        .execute()

    logs = logs_res.data or []

    total_carbon = sum(log["carbon_footprint"] for log in logs)

    print(f"🌱 Total carbon generated: {round(total_carbon, 6)}")


def simulate_stripe_payment():
    print("\n🔹 Creating Stripe checkout session...")

    url = create_checkout_session(5, test_user_id)

    print("💳 Open this URL in browser to simulate payment:")
    print(url)

    print("\n⚠️ After payment, we simulate credit addition manually...")


def add_credits():
    print("\n🔹 Adding credits (simulate Stripe success)...")

    credits_res = supabase.table("user_credits")\
        .select("*")\
        .eq("user_id", test_user_id)\
        .execute()

    data = credits_res.data

    if data:
        new_credits = data[0]["credits"] + 5
        supabase.table("user_credits")\
            .update({"credits": new_credits})\
            .eq("user_id", test_user_id)\
            .execute()
    else:
        supabase.table("user_credits").insert({
            "user_id": test_user_id,
            "credits": 5
        }).execute()

    print("✅ Credits added: +5")


def check_credits():
    print("\n🔹 Checking credits...")

    res = supabase.table("user_credits")\
        .select("*")\
        .eq("user_id", test_user_id)\
        .execute()

    data = res.data or []

    if data:
        print(f"💰 Current credits: {data[0]['credits']}")
    else:
        print("❌ No credits found")


def pay_offset():
    print("\n🔹 Paying carbon offset using credits...")

    logs_res = supabase.table("ai_usage_logs")\
        .select("*")\
        .eq("user_id", test_user_id)\
        .execute()

    logs = logs_res.data or []

    monthly_logs = [
        log for log in logs
        if str(log["timestamp"])[:7] == TEST_MONTH
    ]

    generated = sum(log["carbon_footprint"] for log in monthly_logs)

    offsets_res = supabase.table("carbon_offsets")\
        .select("*")\
        .eq("user_id", test_user_id)\
        .eq("month", TEST_MONTH)\
        .execute()

    offsets = offsets_res.data or []
    already_paid = sum(o["carbon_offset"] for o in offsets)

    remaining = max(generated - already_paid, 0)

    credits_res = supabase.table("user_credits")\
        .select("*")\
        .eq("user_id", test_user_id)\
        .execute()

    credits = credits_res.data[0]["credits"]

    if credits < remaining:
        print("❌ Not enough credits")
        return

    new_credits = credits - remaining

    supabase.table("user_credits")\
        .update({"credits": new_credits})\
        .eq("user_id", test_user_id)\
        .execute()

    supabase.table("carbon_offsets").insert({
        "user_id": test_user_id,
        "carbon_offset": round(remaining, 6),
        "amount_paid": round(remaining * 0.01, 6),
        "month": TEST_MONTH
    }).execute()

    print(f"✅ Offset paid: {round(remaining, 6)}")
    print(f"💰 Remaining credits: {round(new_credits, 6)}")


def final_check():
    print("\n🔹 Final verification...")

    offsets_res = supabase.table("carbon_offsets")\
        .select("*")\
        .eq("user_id", test_user_id)\
        .execute()

    offsets = offsets_res.data or []

    print(f"📊 Total offsets recorded: {len(offsets)}")

    for o in offsets:
        print(f"→ Month: {o['month']} | Offset: {o['carbon_offset']}")


if __name__ == "__main__":
    print("🚀 STARTING FULL SYSTEM TEST")

    create_fake_logs()
    check_offset_status()

    simulate_stripe_payment()

    input("\n⏸️ Press ENTER after completing Stripe payment...")

    add_credits()
    check_credits()

    pay_offset()
    final_check()

    print("\n✅ TEST COMPLETE")