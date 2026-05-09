# test_agent.py — delete after testing
from agents.agent import run

# ── Test 1: Simple greeting (no tools needed) ─────────────────
print("--- TEST 1: Greeting ---")
response = run("Hello! What can you help me with?")
print(response)

# ── Test 2: List invoices (calls list_invoices_tool) ──────────
print("--- TEST 2: List invoices ---")
response = run("Show me all my pending invoices")
print(response)

# ── Test 3: Sync inbox (calls sync_gmail_inbox) ───────────────
# print("--- TEST 3: Sync inbox ---")

# response = run("Sync my email inbox")
# print(response)

# ── Test 4: Multi-step (list emails then get detail) ──────────
print("--- TEST 4: Multi-step ---")
response = run("Show me my recent 10 emails and tell me how many are tagged as invoices")
print(response)

# ── Test 5: Mark invoice paid (needs real UUID) ───────────────
# Replace with a real invoice UUID from your DB
# print("--- TEST 5: Mark invoice paid ---")
# response = run("Mark invoice abc123-replace-with-real-uuid as paid")
# print(response)