from typing import Optional
from fastapi import APIRouter, HTTPException, Query, UploadFile, File, Form
from pydantic import BaseModel

import services.invoice_services as invoice_service


router = APIRouter()


# ── Request body models ───────────────────────────────────────

class StatusUpdateRequest(BaseModel):
    status: str   # "pending" or "paid"

class SendInvoiceRequest(BaseModel):
    recipient: str   # email address to send invoice to


# ── Endpoints ─────────────────────────────────────────────────

@router.get("/", summary="List invoices")
async def list_invoices(
    status: Optional[str] = Query(None, description="Filter: pending or paid"),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
):
    """
    List all invoices, newest first.
    Optional filter: ?status=pending or ?status=paid
    """
    invoices = invoice_service.list_invoices(status=status, page=page, limit=limit)
    return {
        "success": True,
        "page": page,
        "limit": limit,
        "count": len(invoices),
        "data": invoices,
    }


@router.get("/{invoice_id}", summary="Get single invoice")
async def get_invoice(invoice_id: str):
    """Fetch one invoice by UUID."""
    invoice = invoice_service.get_invoice(invoice_id)
    if not invoice:
        raise HTTPException(status_code=404, detail=f"Invoice {invoice_id} not found")
    return {"success": True, "data": invoice}


@router.post("/upload", summary="Upload invoice file")
async def upload_invoice(
    file: UploadFile = File(..., description="PDF or image of the invoice"),
    vendor: Optional[str] = Form(None),
    amount: Optional[float] = Form(None),
    currency: str = Form("USD"),
    due_date: Optional[str] = Form(None, description="YYYY-MM-DD"),
    notes: Optional[str] = Form(None),
    email_id: Optional[str] = Form(None, description="UUID of related email"),
):
    """
    Upload an invoice file with optional metadata.
    Use multipart/form-data — file + form fields together.

    Example curl:
      curl -X POST /invoices/upload
        -F "file=@invoice.pdf"
        -F "vendor=ACME Corp"
        -F "amount=500.00"
        -F "currency=USD"
    """
    try:
        invoice = await invoice_service.create_invoice(
            file=file,
            vendor=vendor,
            amount=amount,
            currency=currency,
            due_date=due_date,
            notes=notes,
            email_id=email_id,
        )
        return {"success": True, "message": "Invoice uploaded", "data": invoice}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {e}")


@router.patch("/{invoice_id}/status", summary="Update invoice status")
async def update_invoice_status(invoice_id: str, payload: StatusUpdateRequest):
    """
    Update invoice status.
    Body: {"status": "paid"} or {"status": "pending"}
    When set to 'paid', sends a confirmation email to the vendor
    if vendor field contains an email address.
    """
    try:
        updated = invoice_service.update_status(invoice_id, payload.status)
        return {"success": True, "message": f"Status updated to {payload.status}", "data": updated}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Update failed: {e}")


@router.post("/{invoice_id}/send", summary="Email invoice to recipient")
async def send_invoice(invoice_id: str, payload: SendInvoiceRequest):
    """
    Send an invoice as an email attachment.
    Body: {"recipient": "client@example.com"}
    """
    try:
        invoice_service.send_invoice_email(invoice_id, payload.recipient)
        return {"success": True, "message": f"Invoice sent to {payload.recipient}"}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Send failed: {e}")