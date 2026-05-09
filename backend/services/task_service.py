# services/task_service.py

from typing import Optional
from database.client import get_supabase


def create_task(
    title: str,
    priority: str = "medium",
    notes: str = None,
    deadline: str = None,
    email_id: str = None,
) -> dict:
    """
    Create a new task in Supabase tasks table.

    Args:
        title    : Task title — required.
        priority : 'low', 'medium', or 'high'. Default 'medium'.
        notes    : Optional description.
        deadline : ISO datetime string e.g. '2025-12-31T18:00:00'.
        email_id : UUID of a related email. Optional.

    Returns:
        The newly created task row as a dict.
    """
    data = {
        "title":    title,
        "priority": priority.lower(),
        "status":   "pending",
    }
    if notes:    data["notes"]    = notes
    if deadline: data["deadline"] = deadline
    if email_id: data["email_id"] = email_id

    response = get_supabase().table("tasks").insert(data).execute()
    return response.data[0]


def list_tasks(
    status: str = None,
    priority: str = None,
    page: int = 1,
    limit: int = 20,
) -> list:
    """
    Return paginated tasks, newest first.
    Filter by status='pending'/'completed' or priority='low'/'medium'/'high'.
    """
    start = (page - 1) * limit
    end   = start + limit - 1

    query = (
        get_supabase()
        .table("tasks")
        .select("*")
        .order("created_at", desc=True)
        .range(start, end)
    )
    if status:   query = query.eq("status",   status.lower())
    if priority: query = query.eq("priority", priority.lower())

    return query.execute().data


def get_task(task_id: str) -> Optional[dict]:
    """Fetch a single task by UUID. Returns None if not found."""
    response = (
        get_supabase()
        .table("tasks")
        .select("*")
        .eq("id", task_id)
        .execute()
    )
    return response.data[0] if response.data else None


def update_task(task_id: str, **kwargs) -> dict:
    """
    Update any fields of a task.
    Pass only the fields you want to change as keyword arguments.

    Example:
        update_task(task_id, status='completed')
        update_task(task_id, priority='high', notes='Urgent!')

    Raises:
        ValueError if task not found.
    """
    if not get_task(task_id):
        raise ValueError(f"Task {task_id} not found")

    kwargs["updated_at"] = "now()"

    response = (
        get_supabase()
        .table("tasks")
        .update(kwargs)
        .eq("id", task_id)
        .execute()
    )
    return response.data[0]


def delete_task(task_id: str) -> bool:
    """
    Delete a task by UUID.
    Returns True on success. Raises ValueError if not found.
    """
    if not get_task(task_id):
        raise ValueError(f"Task {task_id} not found")

    get_supabase().table("tasks").delete().eq("id", task_id).execute()
    return True


def complete_task(task_id: str) -> dict:
    """Shortcut to mark a task as completed."""
    return update_task(task_id, status="completed")


def get_tasks_due_soon(hours: int = 24) -> list:
    """
    Return all pending tasks with deadline within the next N hours.
    Used by Phase 6 cron scheduler for deadline reminder emails.
    """
    from datetime import datetime, timedelta, timezone

    now    = datetime.now(timezone.utc)
    cutoff = now + timedelta(hours=hours)

    response = (
        get_supabase()
        .table("tasks")
        .select("*")
        .eq("status", "pending")
        .lte("deadline", cutoff.isoformat())
        .gte("deadline", now.isoformat())
        .execute()
    )
    return response.data