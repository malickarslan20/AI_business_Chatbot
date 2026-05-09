from typing import Optional
from fastapi import UploadFile

from database.client import get_supabase
from utils.file_handler import save_file, get_file_url
import services.email_services as email_service


# ── Create ────────────────────────────────────────────────────

async def create_invoice(
    file: UploadFile,
    vendor: str = None,
    amount: float = None,
    currency: str = "USD",
    due_date: str = None,
    notes: str = None,
    email_id: str = None,
) -> dict:
    """
    Upload an invoice file to Supabase Storage and create a DB record.

    Args:
        file     : The uploaded file from the HTTP request (PDF/image).
        vendor   : Who sent the invoice.
        amount   : Invoice amount.
        currency : Currency code e.g. 'USD', 'EUR'. Default 'USD'.
        due_date : Due date string 'YYYY-MM-DD'. Optional.
        notes    : Any extra notes. Optional.
        email_id : Link to the email this invoice came from. Optional.

    Returns:
        The newly created invoice row as a dict.
    """
    # Read file bytes from the upload
    file_bytes = await file.read()

    # Upload to Supabase Storage in the 'invoices' bucket
    upload_result = save_file(
        file_bytes=file_bytes,
        filename=file.filename,
        bucket="invoices"
    )

    # Build DB row
    invoice_data = {
        "vendor":    vendor,
        "amount":    amount,
        "currency":  currency,
        "status":    "pending",
        "file_url":  upload_result["url"],
        "file_path": upload_result["path"],
        "due_date":  due_date,
        "notes":     notes,
        "email_id":  email_id,
    }

    # Remove None values so Supabase uses column defaults
    invoice_data = {k: v for k, v in invoice_data.items() if v is not None}

    response = get_supabase().table("invoices").insert(invoice_data).execute()
    return response.data[0]


# ── Read ──────────────────────────────────────────────────────

def list_invoices(
    status: str = None,
    page: int = 1,
    limit: int = 10
) -> list:
    """
    Return paginated invoices, newest first.
    Pass status='pending' or status='paid' to filter.
    """
    start = (page - 1) * limit
    end = start + limit - 1

    query = (
        get_supabase()
        .table("invoices")
        .select("*")
        .order("created_at", desc=True)
        .range(start, end)
    )

    if status:
        query = query.eq("status", status.lower())

    return query.execute().data


def get_invoice(invoice_id: str) -> Optional[dict]:
    """
    Fetch a single invoice by UUID.
    Returns None if not found.
    """
    response = (
        get_supabase()
        .table("invoices")
        .select("*")
        .eq("id", invoice_id)
        .execute()
    )
    return response.data[0] if response.data else None


# ── Update ────────────────────────────────────────────────────

def update_status(invoice_id: str, status: str) -> dict:
    """
    Update invoice status to 'paid' or 'pending'.

    When marked 'paid':
      - Updates the DB row
      - Sends a payment confirmation email to the vendor
        (only if vendor email is stored in the invoice)

    Returns:
        The updated invoice row.
    Raises:
        ValueError if invoice not found.
    """
    # Validate status value
    status = status.lower()
    if status not in ("pending", "paid"):
        raise ValueError(f"Invalid status '{status}'. Must be 'pending' or 'paid'.")

    # Check invoice exists
    invoice = get_invoice(invoice_id)
    if not invoice:
        raise ValueError(f"Invoice {invoice_id} not found")

    # Update in DB
    response = (
        get_supabase()
        .table("invoices")
        .update({"status": status, "updated_at": "now()"})
        .eq("id", invoice_id)
        .execute()
    )
    updated = response.data[0]

    # If marked paid — send confirmation email to vendor
    # Only if vendor field looks like an email address
    if status == "paid" and invoice.get("vendor") and "@" in invoice["vendor"]:
        try:
            email_service.send_email(
                to=invoice["vendor"],
                subject=f"Payment Confirmed — Invoice {invoice_id[:8]}",
                body=(
                    f"Hello,"
                    f"We confirm that your invoice of {invoice.get('amount','N/A')} "
                    f"{invoice.get('currency','USD')} has been marked as paid."
                    f"Invoice ID: {invoice_id}"

                    f"Thank you."
                )
            )
        except Exception as e:
            # Don't fail the status update if email fails
            print(f"Confirmation email failed (non-critical): {e}")

    return updated


# ── Send invoice by email ─────────────────────────────────────

def send_invoice_email(invoice_id: str, recipient: str) -> bool:
    """
    Fetch the invoice, download its file from storage,
    and email it as an attachment to the recipient.

    Args:
        invoice_id : UUID of the invoice to send.
        recipient  : Email address to send the invoice to.

    Returns:
        True on success.
    Raises:
        ValueError if invoice not found.
    """
    invoice = get_invoice(invoice_id)
    if not invoice:
        raise ValueError(f"Invoice {invoice_id} not found")

    # Download the file from Supabase Storage
    file_path = invoice.get("file_path")
    if not file_path:
        raise ValueError("Invoice has no attached file")

    file_bytes = (
        get_supabase()
        .storage.from_("invoices")
        .download(file_path)
    )

    # Get filename from path e.g. 'abc123/invoice.pdf' → 'invoice.pdf'
    filename = file_path.split("/")[-1]

    email_service.send_email(
        to=recipient,
        subject=f"Invoice from {invoice.get('vendor','us')} — {invoice.get('amount','')}{invoice.get('currency','')}",
        body=(
            f"Please find the attached invoice."
            f"Amount: {invoice.get('amount','N/A')} {invoice.get('currency','USD')}"
            f"Status: {invoice.get('status','pending').capitalize()}"
            f"Due: {invoice.get('due_date','N/A')}"
        ),
        attachments=[{"filename": filename, "data": file_bytes}]
    )
    return True