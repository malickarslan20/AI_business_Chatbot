# test_email.py
from services.email_services import (
    fetch_unread_emails,
    get_emails,
    get_email_by_id,
    send_email
)

# ── Test 1: Fetch from Gmail ──────────────────────────
# print("\n--- TEST 1: Sync Gmail ---")
# result = fetch_unread_emails()
# print(result)  # {"fetched": N, "stored": N, "skipped": N}

# ── Test 2: Read from DB ──────────────────────────────
print("\n--- TEST 2: Get emails from DB ---")
emails = get_emails(page=1, limit=5)
print(f"Got {len(emails)} emails")
for e in emails:
    print(f"  [{e['email_tag']}] {e['subject']} — {e['sender']}")

# ── Test 3: Get single email ──────────────────────────
print("\n--- TEST 3: Get single email ---")
if emails:
    first_id = emails[0]["id"]
    single = get_email_by_id(first_id)
    print(f"Found: {single['subject']}")
else:
    print("No emails in DB yet — run Test 1 first")

# ── Test 4: Send email ────────────────────────────────
print("\n--- TEST 4: Send email ---")
send_email(
    to="talhathepookie@gmail.com",       # ← change to your email
    subject="Phase 2 test",
    body="email_service.py is working!"
)
print("Sent!")