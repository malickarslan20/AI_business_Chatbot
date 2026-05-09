# test_invoice.py — delete after testing

import asyncio

from services.invoice_services import (
    create_invoice,
    list_invoices,
    get_invoice,
    update_status,
    send_invoice_email,
)


# ── Test 1: Upload invoice ────────────────────────────────────

print("\n--- TEST 1: Upload invoice ---")


class FakeUpload:
    """
    Simulates FastAPI UploadFile for testing.
    """

    filename = "test_invoice.txt"

    async def read(self):
        return (
            b"INVOICE #001\n"
            b"Vendor: ACME Corp\n"
            b"Amount: $500\n"
            b"Due: 2025-12-31"
        )


async def test_create():
    invoice = await create_invoice(
        file=FakeUpload(),
        vendor="billing@acme.com",
        amount=500.00,
        currency="USD",
        due_date="2025-12-31",
    )

    print(f"Created invoice: {invoice['id']}")
    print(f"File URL: {invoice['file_url']}")
    print(f"Status: {invoice['status']}")

    return invoice["id"]


invoice_id = asyncio.run(test_create())


# ── Test 2: List invoices ─────────────────────────────────────

print("\n--- TEST 2: List all invoices ---")

all_inv = list_invoices()

print(f"Total invoices: {len(all_inv)}")

for inv in all_inv:
    print(
        f"[{inv['status']}] "
        f"{inv.get('vendor', '?')} — "
        f"{inv.get('amount', '?')} "
        f"{inv.get('currency', '')}"
    )


# ── Test 3: Filter pending invoices ───────────────────────────

print("\n--- TEST 3: Filter pending invoices ---")

pending = list_invoices(status="pending")

print(f"Pending count: {len(pending)}")


# ── Test 4: Get single invoice ────────────────────────────────

print("\n--- TEST 4: Get single invoice ---")

single = get_invoice(invoice_id)

print(
    f"Found invoice: "
    f"{single['id']} "
    f"status={single['status']}"
)


# ── Test 5: Mark as paid ──────────────────────────────────────

print("\n--- TEST 5: Mark as paid ---")

updated = update_status(invoice_id, "paid")

print(f"Updated status: {updated['status']}")


# Verify in DB

check = get_invoice(invoice_id)

print(f"DB confirms status: {check['status']}")


# ── Optional Test 6: Email invoice ────────────────────────────
# Uncomment to test sending invoice emails

print("\n--- TEST 6: Send invoice email ---")

result = send_invoice_email(
    invoice_id=invoice_id,
    recipient="talhathepookie@gmail.com"
)

print(f"Email sent: {result}")


print("\n✅ All tests passed.")
print("Delete test_invoice.py after testing.")