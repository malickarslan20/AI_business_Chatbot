# agents/tools/task_tools.py

from langchain_core.tools import tool
import services.task_service as task_service


@tool
def create_task_tool(
    title: str,
    priority: str = "medium",
    notes: str = "",
    deadline: str = ""
) -> str:
    """
    Create a new task in the task manager.
    Use when the user asks to add a task, set a reminder,
    or create something to do.

    Args:
        title    : What the task is e.g. 'Review Q3 invoices'
        priority : 'low', 'medium', or 'high'
        notes    : Any extra details about the task
        deadline : ISO datetime string e.g. '2025-12-31T18:00:00'
                   Leave empty string if no deadline.
    """
    try:
        task = task_service.create_task(
            title=title,
            priority=priority,
            notes=notes or None,
            deadline=deadline or None,
        )
        return (
            f"Task created successfully!\n"
            f"ID: {task['id']}\n"
            f"Title: {task['title']}\n"
            f"Priority: {task['priority']}\n"
            f"Deadline: {task.get('deadline', 'None')}"
        )
    except Exception as e:
        return f"Error creating task: {e}"


@tool
def list_tasks_tool(status: str = "pending") -> str:
    """
    List tasks from the task manager.
    Use when the user asks to see their tasks, to-do list,
    or what they need to do.

    Args:
        status : 'pending', 'completed', or 'all'. Default is 'pending'.
    """
    try:
        filter_status = None if status == "all" else status
        tasks = task_service.list_tasks(status=filter_status)
        if not tasks:
            return f"No {status} tasks found."

        lines = [f"Found {len(tasks)} {status} task(s):\n"]
        for t in tasks:
            lines.append(
                f"- ID: {t['id']}\n"
                f"  Title: {t['title']}\n"
                f"  Priority: {t['priority']} | Status: {t['status']}\n"
                f"  Deadline: {t.get('deadline', 'None')}\n"
            )
        return "\n".join(lines)
    except Exception as e:
        return f"Error listing tasks: {e}"


@tool
def complete_task_tool(task_id: str) -> str:
    """
    Mark a task as completed.
    Use when the user says they finished a task, completed something,
    or asks to check off or close a task.

    Args:
        task_id : The UUID of the task to mark as completed
    """
    try:
        task = task_service.complete_task(task_id)
        return f"Task '{task['title']}' marked as completed successfully."
    except Exception as e:
        return f"Error completing task: {e}"


@tool
def delete_task_tool(task_id: str) -> str:
    """
    Delete a task permanently from the task manager.
    Use only when the user explicitly asks to delete or remove a task.

    Args:
        task_id : The UUID of the task to delete
    """
    try:
        task_service.delete_task(task_id)
        return f"Task {task_id} deleted successfully."
    except Exception as e:
        return f"Error deleting task: {e}"


# Exported list — imported by graph.py
TASK_TOOLS = [create_task_tool, list_tasks_tool, complete_task_tool, delete_task_tool]