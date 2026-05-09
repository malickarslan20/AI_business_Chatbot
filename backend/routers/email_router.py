# routers/email_router.py — COMPLETE FILE

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

import services.email_services as email_service


router = APIRouter()


class SendEmailRequest(BaseModel):
    to: str
    subject: str
    body: str


@router.get("/", summary="List all emails")
async def list_emails(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=100, description="Emails per page"),
):
    """Return paginated email list, newest first."""
    emails = email_service.get_emails(page=page, limit=limit)
    return {
        "success": True,
        "page": page,
        "limit": limit,
        "count": len(emails),
        "data": emails,
    }

# @router.post("/sync", summary="Sync Gmail inbox")
@router.get("/sync", summary="Sync Gmail inbox")
async def sync_emails():
    """
    Manually trigger Gmail IMAP fetch.
    Fetches UNSEEN emails, parses, stores in Supabase.
    Use this to test without waiting for the cron scheduler.
    """
    try:
        result = email_service.fetch_unread_emails()
        return {"success": True, "message": "Sync complete", "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Sync failed: {e}")

@router.get("/{email_id}", summary="Get single email")
async def get_email(email_id: str):
    """Fetch one email by UUID. Auto-marks it as read."""
    record = email_service.get_email_by_id(email_id)
    if not record:
        raise HTTPException(status_code=404, detail=f"Email {email_id} not found")
    email_service.mark_email_read(email_id)
    return {"success": True, "data": record}





@router.post("/send", summary="Send an email")
async def send_email(payload: SendEmailRequest):
    """Send email via Gmail SMTP. Body: {to, subject, body}"""
    try:
        email_service.send_email(
            to=payload.to,
            subject=payload.subject,
            body=payload.body,
        )
        return {"success": True, "message": f"Email sent to {payload.to}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Send failed: {e}")