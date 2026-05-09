# test_invoice_service.py

"""
Run this file directly to test all invoice service functionalities.

Before running:
1. Make sure your FastAPI project dependencies are installed
2. Supabase credentials exist in .env
3. Storage bucket "invoices" exists
4. A sample file exists in the same directory
   Example:
       sample_invoice.pdf

Run:
    python test_invoice_service.py
"""

import asyncio
from pathlib import Path
from fastapi import UploadFile
from starlette.datastructures import Headers

import services.invoice_services as invoice_service


# ------------------------------------------------------------
# CONFIG
# ------------------------------------------------------------

TEST_FILE = "sample_invoice.pdf"


# ------------------------------------------------------------
# HELPER
# ------------------------------------------------------------

def create_upload_file(filepath: str) -> UploadFile:
    """
    Convert a local file into FastAPI UploadFile object.
    """
    path = Path(filepath)

    if not path.exists():
        raise FileNotFoundError(
            f"Test file '{filepath}' not found."
        )

    file = open(path, "rb")

    upload = UploadFile(
        filename=path.name,
        file=file,
        headers=Headers({"content-type": "application/pdf"})
    )

    return upload


# ------------------------------------------------------------
# TEST ALL FUNCTIONS
# ------------------------------------------------------------

async def test_all():

    print("\n==============================")
    print("TESTING INVOICE SERVICE")
    print("==============================\n")

    # --------------------------------------------------------
    # 1. CREATE INVOICE
    # --------------------------------------------------------

    print("1. Creating invoice...")

    upload_file = create_upload_file(TEST_FILE)

    created_invoice = await invoice_service.create_invoice(
        file=upload_file,
        vendor="vendor@example.com",
        amount=2500,
        currency="USD",
        due_date="2026-05-30",
        notes="Test invoice created from automated script",
        email_id=None,
    )

    print("Invoice Created Successfully")
    print(created_invoice)

    invoice_id = created_invoice["id"]

    # --------------------------------------------------------
    # 2. GET SINGLE INVOICE
    # --------------------------------------------------------

    print("\n2. Fetching invoice by ID...")

    invoice = invoice_service.get_invoice(invoice_id)

    print("Fetched Invoice:")
    print(invoice)

    # --------------------------------------------------------
    # 3. LIST ALL INVOICES
    # --------------------------------------------------------

    print("\n3. Listing invoices...")

    invoices = invoice_service.list_invoices(
        page=1,
        limit=5
    )

    print(f"Found {len(invoices)} invoices")

    for inv in invoices:
        print(
            f"- {inv['id']} | "
            f"{inv.get('vendor')} | "
            f"{inv.get('status')}"
        )

    # --------------------------------------------------------
    # 4. FILTER INVOICES
    # --------------------------------------------------------

    print("\n4. Listing pending invoices...")

    pending_invoices = invoice_service.list_invoices(
        status="pending",
        page=1,
        limit=5
    )

    print(f"Pending invoices: {len(pending_invoices)}")

    # --------------------------------------------------------
    # 5. UPDATE STATUS
    # --------------------------------------------------------

    print("\n5. Updating invoice status to PAID...")

    updated_invoice = invoice_service.update_status(
        invoice_id=invoice_id,
        status="paid"
    )

    print("Invoice Updated:")
    print(updated_invoice)

    # --------------------------------------------------------
    # 6. SEND INVOICE EMAIL
    # --------------------------------------------------------

    print("\n6. Sending invoice email...")

    result = invoice_service.send_invoice_email(
        invoice_id=invoice_id,
        recipient="sialhabib7@gmail.com"
    )

    print("Email Sent:", result)

    # --------------------------------------------------------
    # DONE
    # --------------------------------------------------------

    print("\n==============================")
    print("ALL TESTS COMPLETED")
    print("==============================\n")


# ------------------------------------------------------------
# MAIN
# ------------------------------------------------------------

if __name__ == "__main__":
    asyncio.run(test_all())