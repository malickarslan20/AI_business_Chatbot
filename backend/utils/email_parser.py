# import email
# from email.header import decode_header
# import re

# def parse_email(raw_msg):
#     """
#     Convert raw IMAP email bytes into structured data.
#     """

#     # Convert raw bytes into email object
#     msg = email.message_from_bytes(raw_msg)

#     # -----------------------------
#     # Extract Sender
#     # -----------------------------
#     sender = msg.get("From")

#     # -----------------------------
#     # Extract Subject
#     # -----------------------------
#     subject = msg.get("Subject", "")

#     # Decode subject if encoded
#     decoded_subject = decode_header(subject)[0][0]

#     if isinstance(decoded_subject, bytes):
#         subject = decoded_subject.decode(errors="ignore")
#     else:
#         subject = decoded_subject

#     # -----------------------------
#     # Extract Body
#     # -----------------------------
#     body = ""

#     if msg.is_multipart():

#         # Loop through email parts
#         for part in msg.walk():

#             content_type = part.get_content_type()
#             content_disposition = str(part.get("Content-Disposition"))

#             # Ignore attachments
#             if "attachment" not in content_disposition:

#                 if content_type == "text/plain":

#                     try:
#                         body = part.get_payload(decode=True).decode()
#                     except:
#                         body = ""

#                     break

#     else:
#         # Non-multipart email
#         body = msg.get_payload(decode=True).decode(errors="ignore")

#     # -----------------------------
#     # Detect Attachments
#     # -----------------------------
#     has_attachment = False

#     for part in msg.walk():

#         content_disposition = str(part.get("Content-Disposition"))

#         if "attachment" in content_disposition:
#             has_attachment = True
#             break

#     # -----------------------------
#     # Return Parsed Data
#     # -----------------------------
#     return {
#         "sender": sender,
#         "subject": subject,
#         "body": body,
#         "has_attachment": has_attachment,
#         "message": msg
#     }

# def extract_attachments(msg):
#     """
#     Extract attachments from email message.
#     Returns list of dictionaries.
#     """

#     attachments = []

#     for part in msg.walk():

#         content_disposition = str(part.get("Content-Disposition"))

#         if "attachment" in content_disposition:

#             filename = part.get_filename()

#             if filename:

#                 file_data = part.get_payload(decode=True)

#                 attachments.append({
#                     "filename": filename,
#                     "data": file_data
#                 })

#     return attachments


# def classify_email(body):
#     """
#     Simple keyword-based email classifier.
#     """

#     body = body.lower()

#     # Invoice Detection
#     invoice_keywords = [
#         "invoice",
#         "bill",
#         "amount due",
#         "payment due"
#     ]

#     # Payment Detection
#     payment_keywords = [
#         "payment received",
#         "transaction",
#         "paid successfully"
#     ]

#     # Task Detection
#     task_keywords = [
#         "deadline",
#         "meeting",
#         "complete",
#         "task"
#     ]

#     # -----------------------------
#     # Check Invoice
#     # -----------------------------
#     for keyword in invoice_keywords:

#         if keyword in body:
#             return "invoice"

#     # -----------------------------
#     # Check Payment
#     # -----------------------------
#     for keyword in payment_keywords:

#         if keyword in body:
#             return "payment"

#     # -----------------------------
#     # Check Task
#     # -----------------------------
#     for keyword in task_keywords:

#         if keyword in body:
#             return "task"

#     return "other"




# utils/email_parser.py — COMPLETE CORRECTED FILE

import email
from email.header import decode_header


def parse_email(raw_msg):
    """
    Convert raw IMAP email bytes into structured data.
    """

    msg = email.message_from_bytes(raw_msg)

    # ── Sender ──────────────────────────────────────────
    sender = msg.get("From", "")

    # ── Subject ─────────────────────────────────────────
    subject = msg.get("Subject", "")
    decoded_subject = decode_header(subject)[0][0]
    if isinstance(decoded_subject, bytes):
        subject = decoded_subject.decode(errors="ignore")
    else:
        subject = decoded_subject or ""

    # ── Message-ID (stable unique key for dedup) ────────
    message_id = msg.get("Message-ID", "").strip()

    # ── Body ────────────────────────────────────────────
    body = ""
    if msg.is_multipart():
        for part in msg.walk():
            content_type = part.get_content_type()
            content_disposition = str(part.get("Content-Disposition", ""))
            if "attachment" not in content_disposition:
                if content_type == "text/plain":
                    try:
                        body = part.get_payload(decode=True).decode(errors="ignore")
                    except:
                        body = ""
                    break
    else:
        try:
            body = msg.get_payload(decode=True).decode(errors="ignore")
        except:
            body = ""

    # ── Has Attachment ───────────────────────────────────
    has_attachment = False
    for part in msg.walk():
        if "attachment" in str(part.get("Content-Disposition", "")):
            has_attachment = True
            break

    return {
        "sender": sender,
        "subject": subject,
        "body": body,
        "has_attachment": has_attachment,
        "message_id": message_id,   # ← ADDED: stable dedup key
        # "message": msg            ← REMOVED: causes JSON errors
    }


def extract_attachments(msg):
    """
    Extract attachments from a parsed email.message object.
    Pass the raw email.message_from_bytes() result here directly.
    Returns list of {"filename": str, "data": bytes}
    """
    attachments = []
    for part in msg.walk():
        content_disposition = str(part.get("Content-Disposition", ""))
        if "attachment" in content_disposition:
            filename = part.get_filename()
            if filename:
                file_data = part.get_payload(decode=True)
                attachments.append({
                    "filename": filename,
                    "data": file_data
                })
    return attachments


def classify_email(body):
    """
    Keyword-based email classifier.
    Returns: "invoice" | "payment" | "task" | "other"
    """
    body = body.lower()

    invoice_keywords = ["invoice", "bill", "amount due", "payment due", "receipt"]
    payment_keywords = ["payment received", "transaction", "paid successfully", "payment confirmed"]
    task_keywords = ["deadline", "meeting", "complete", "task", "action required", "follow up"]

    for kw in payment_keywords:   # check payment BEFORE invoice (overlap prevention)
        if kw in body:
            return "payment"

    for kw in invoice_keywords:
        if kw in body:
            return "invoice"

    for kw in task_keywords:
        if kw in body:
            return "task"

    return "other"