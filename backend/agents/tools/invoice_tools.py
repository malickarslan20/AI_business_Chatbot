from langchain_core.tools import tool
import services.invoice_services as invoice_service


@tool
def list_invoices_tool(status: str = "all") -> str:
    """
    List invoices from the database.

    Args:
        status : 'pending', 'paid', or 'all'
    """
    try:
        filter_status = None if status.lower() == "all" else status.lower()

        invoices = invoice_service.list_invoices(
            status=filter_status,
            limit=20
        )

        if not invoices:
            return f"No {status} invoices found."

        lines = [f"Found {len(invoices)} {status} invoice(s):\n"]

        for inv in invoices:
            lines.append(
                f"- ID: {inv['id']}\n"
                f"  Vendor: {inv.get('vendor', 'Unknown')}\n"
                f"  Amount: {inv.get('amount', 'N/A')} "
                f"{inv.get('currency', 'USD')}\n"
                f"  Status: {inv.get('status', 'unknown')} | "
                f"Due: {inv.get('due_date', 'N/A')}\n"
            )

        return "\n".join(lines)

    except Exception as e:
        return f"Error listing invoices: {e}"


@tool
def get_invoice_detail(invoice_id: str) -> str:
    """
    Get complete details of a specific invoice.

    Args:
        invoice_id : UUID of invoice
    """
    try:
        inv = invoice_service.get_invoice(invoice_id)

        if not inv:
            return f"No invoice found with ID {invoice_id}"

        return (
            f"Invoice Details:\n"
            f"ID: {inv['id']}\n"
            f"Vendor: {inv.get('vendor', 'Unknown')}\n"
            f"Amount: {inv.get('amount', 'N/A')} "
            f"{inv.get('currency', 'USD')}\n"
            f"Status: {inv.get('status', 'unknown')}\n"
            f"Due Date: {inv.get('due_date', 'N/A')}\n"
            f"Notes: {inv.get('notes', 'None')}\n"
            f"File URL: {inv.get('file_url', 'None')}"
        )

    except Exception as e:
        return f"Error getting invoice: {e}"


@tool
def mark_invoice_paid(invoice_id: str) -> str:
    """
    Mark an invoice as paid.

    Args:
        invoice_id : UUID of invoice
    """
    try:
        updated = invoice_service.update_status(
            invoice_id,
            "paid"
        )

        return (
            f"Invoice marked as paid.\n"
            f"ID: {updated['id']}\n"
            f"Vendor: {updated.get('vendor', 'Unknown')}\n"
            f"Amount: {updated.get('amount', 'N/A')} "
            f"{updated.get('currency', 'USD')}\n"
            f"Status: {updated.get('status', 'unknown')}"
        )

    except Exception as e:
        return f"Error marking invoice paid: {e}"


@tool
def send_invoice_to_client(
    invoice_id: str,
    recipient_email: str
) -> str:
    """
    Send invoice attachment to recipient email.

    Args:
        invoice_id      : UUID of invoice
        recipient_email : Recipient email address
    """
    try:
        invoice_service.send_invoice_email(
            invoice_id,
            recipient_email
        )

        return (
            f"Invoice {invoice_id} "
            f"sent successfully to {recipient_email}."
        )

    except Exception as e:
        return f"Error sending invoice: {e}"


# Register all invoice tools
INVOICE_TOOLS = [
    list_invoices_tool,
    get_invoice_detail,
    mark_invoice_paid,
    send_invoice_to_client,
]