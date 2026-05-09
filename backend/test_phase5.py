# test_phase5.py — delete after testing

# ══════════════════════════════════════════════
# PART A: Task service — no LLM, runs fast
# ══════════════════════════════════════════════
from services.task_service import (
    create_task, list_tasks, get_task,
    update_task, complete_task, delete_task
)

# print("\n--- TEST 1: Create task ---")
# task = create_task(title="Review Q3 invoices", priority="high", notes="Check all overdue")
# task_id = task["id"]
# print(f"Created: {task['title']} [{task['priority']}]")

# print("\n--- TEST 2: List pending ---")
# tasks = list_tasks(status="pending")
# print(f"Pending tasks: {len(tasks)}")

# print("\n--- TEST 3: Update task ---")
# updated = update_task(task_id, priority="medium")
# print(f"Updated priority: {updated['priority']}")

# print("\n--- TEST 4: Complete task ---")
# done = complete_task(task_id)
# print(f"Status: {done['status']}")   # should be 'completed'

# print("\n--- TEST 5: Delete task ---")
# delete_task(task_id)
# print(f"Deleted. get_task returns: {get_task(task_id)}")  # should be None

# ══════════════════════════════════════════════
# PART B: Agent with task tools — calls LLM
# ══════════════════════════════════════════════
from agents.agent import run

# print("\n--- CHAT TEST 1: Create task via agent ---")
# resp = run("Create a task: Follow up with ACME Corp about invoice, priority high")
# print(resp)

print("\n--- CHAT TEST 2: List tasks via agent ---")
resp = run("Show me my pending tasks")
print(resp)

print("\n--- CHAT TEST 3: Multi-domain ---")
resp = run("Show me pending invoices and my pending tasks")
print(resp)

print("\n✅ All Phase 5 tests done. Delete test_phase5.py")