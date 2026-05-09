# routers/task_router.py

from typing import Optional
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

import services.task_service as task_service


router = APIRouter()


# ── Request body models ───────────────────────────────────────

class TaskCreateRequest(BaseModel):
    title: str
    priority: str = "medium"
    notes: Optional[str] = None
    deadline: Optional[str] = None   # ISO datetime string
    email_id: Optional[str] = None


class TaskUpdateRequest(BaseModel):
    title: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None
    deadline: Optional[str] = None


# ── Endpoints ─────────────────────────────────────────────────

@router.get("/", summary="List tasks")
async def list_tasks(
    status: Optional[str]   = Query(None, description="pending or completed"),
    priority: Optional[str] = Query(None, description="low, medium, or high"),
    page: int  = Query(1,  ge=1),
    limit: int = Query(20, ge=1, le=100),
):
    """List tasks with optional filters. ?status=pending&priority=high"""
    tasks = task_service.list_tasks(
        status=status, priority=priority, page=page, limit=limit
    )
    return {"success": True, "count": len(tasks), "data": tasks}


@router.get("/{task_id}", summary="Get single task")
async def get_task(task_id: str):
    """Fetch one task by UUID."""
    task = task_service.get_task(task_id)
    if not task:
        raise HTTPException(status_code=404, detail=f"Task {task_id} not found")
    return {"success": True, "data": task}


@router.post("/", summary="Create task")
async def create_task(payload: TaskCreateRequest):
    """Create a new task. Body: {title, priority, notes, deadline, email_id}"""
    try:
        task = task_service.create_task(
            title=payload.title,
            priority=payload.priority,
            notes=payload.notes,
            deadline=payload.deadline,
            email_id=payload.email_id,
        )
        return {"success": True, "message": "Task created", "data": task}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/{task_id}", summary="Update task")
async def update_task(task_id: str, payload: TaskUpdateRequest):
    """Update any task fields. Only send the fields you want to change."""
    # Build dict of only the non-None provided fields
    updates = {k: v for k, v in payload.model_dump().items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="No fields provided to update")
    try:
        task = task_service.update_task(task_id, **updates)
        return {"success": True, "message": "Task updated", "data": task}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{task_id}", summary="Delete task")
async def delete_task(task_id: str):
    """Permanently delete a task by UUID."""
    try:
        task_service.delete_task(task_id)
        return {"success": True, "message": f"Task {task_id} deleted"}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))