# import imaplib
# import email
# import os

# import smtplib

# from email.message import EmailMessage
# from email.mime.base import MIMEBase
# from email import encoders

# from dotenv import load_dotenv
# import supabase

# from database.client import get_supabase

# from utils.email_parser import (
#     parse_email,
#     extract_attachments,
#     classify_email
# )

# load_dotenv()

# EMAIL_USER = os.getenv("GMAIL_USER")
# EMAIL_PASS = os.getenv("GMAIL_PASS")

# def connect_email():
#     """
#     Connect to Gmail IMAP server.
#     """

#     mail = imaplib.IMAP4_SSL("imap.gmail.com")

#     mail.login(EMAIL_USER, EMAIL_PASS)

#     return mail

# def fetch_unread_emails():
#     """
#     Fetch unread emails from Gmail inbox.
#     """

#     mail = connect_email()

#     # Select inbox
#     mail.select("inbox")

#     # Search unread emails
#     status, messages = mail.search(None, "UNSEEN")

#     email_ids = messages[0].split()

#     print(f"Found {len(email_ids)} unread emails")

#     # Loop through emails
#     for email_id in email_ids:

#         # Fetch email data
#         status, msg_data = mail.fetch(email_id, "(RFC822)")

#         raw_email = msg_data[0][1]

#         # -----------------------------
#         # Parse Email
#         # -----------------------------
#         parsed = parse_email(raw_email)

#         sender = parsed["sender"]
#         subject = parsed["subject"]
#         body = parsed["body"]
#         has_attachment = parsed["has_attachment"]
#         msg = parsed["message"]

#         # -----------------------------
#         # Classify Email
#         # -----------------------------
#         email_tag = classify_email(body)

#         # -----------------------------
#         # Check Duplicate Email
#         # -----------------------------
#         existing_email = (
#             get_supabase()
#             .table("emails")
#             .select("*")
#             .eq("raw_uid", email_id.decode())
#             .execute()
#         )

#         if existing_email.data:

#             print("Email already exists")
#             continue

#         # -----------------------------
#         # Save Email To Database
#         # -----------------------------
#         email_data = {
#             "sender": sender,
#             "subject": subject,
#             "body": body,
#             "has_attachment": has_attachment,
#             "email_tag": email_tag,
#             "raw_uid": email_id.decode()
#         }

#         inserted_email = (
#             get_supabase()
#             .table("emails")
#             .insert(email_data)
#             .execute()
#         )

#         print("Email saved successfully")

#         # -----------------------------
#         # Extract Attachments
#         # -----------------------------
#         attachments = extract_attachments(msg)

#         print(f"Found {len(attachments)} attachments")

#         # Attachment handling later


# def get_emails(page: int = 1, limit: int = 10):
#     """
#     Fetch paginated emails from Supabase.
#     """

#     start = (page - 1) * limit
#     end = start + limit - 1

#     response = (
#         get_supabase()
#         .table("emails")
#         .select("*")
#         .range(start, end)
#         .order("created_at", desc=True)
#         .execute()
#     )

#     return response.data

# def get_email_by_id(email_id: int):

#     """
#     Fetch single email by ID.
#     """

#     response = (
#         get_supabase()
#         .table("emails")
#         .select("*")
#         .eq("id", email_id)
#         .single()
#         .execute()
#     )

#     return response.data

# def send_email(
#     to: str,
#     subject: str,
#     body: str,
#     attachments: list = []
# ):
#     """
#     Send email using Gmail SMTP.
#     Supports optional attachments.
#     """

#     msg = EmailMessage()

#     msg["Subject"] = subject
#     msg["From"] = EMAIL_USER
#     msg["To"] = to

#     msg.set_content(body)

#     # -----------------------------
#     # Attach Files
#     # -----------------------------
#     for file_path in attachments:

#         with open(file_path, "rb") as f:

#             file_data = f.read()

#             file_name = os.path.basename(file_path)

#         msg.add_attachment(
#             file_data,
#             maintype="application",
#             subtype="octet-stream",
#             filename=file_name
#         )

#     # -----------------------------
#     # Connect To Gmail SMTP
#     # -----------------------------
#     with smtplib.SMTP("smtp.gmail.com", 587) as smtp:

#         smtp.ehlo()

#         smtp.starttls()

#         smtp.ehlo()

#         smtp.login(EMAIL_USER, EMAIL_PASS)

#         smtp.send_message(msg)

#     print("Email sent successfully")


# if __name__ == "__main__":
#     send_email(
#         to="sialhabib7@gmail.com",
#         subject="Hello",
#         body="This is a test email"
#     )


# services/email_service.py — COMPLETE CORRECTED FILE

import imaplib
import smtplib
import email as email_lib
from email.message import EmailMessage
from typing import Optional

from config import get_settings                    # ← Fix 1: no more os.getenv
from database.client import get_supabase
from utils.email_parser import parse_email, extract_attachments, classify_email
from utils.file_handler import save_file


# ── IMAP ──────────────────────────────────────────────────────

def connect_email():
    """Open and return authenticated Gmail IMAP connection."""
    s = get_settings()
    mail = imaplib.IMAP4_SSL("imap.gmail.com")
    mail.login(s.gmail_user, s.gmail_pass)
    return mail


def fetch_unread_emails() -> dict:
    """
    Connect to Gmail IMAP, fetch all UNSEEN emails,
    parse + classify + store each in Supabase.

    Returns:
        {"fetched": int, "stored": int, "skipped": int}
    """
    mail = connect_email()
    mail.select("inbox")

    status, messages = mail.search(None, "UNSEEN")
    email_ids = messages[0].split()

    print(f"Found {len(email_ids)} unread emails")

    fetched = len(email_ids)
    stored = 0
    skipped = 0

    for email_id in email_ids:
        try:
            status, msg_data = mail.fetch(email_id, "(RFC822)")
            raw_email = msg_data[0][1]

            # ── Parse ─────────────────────────────────────────
            parsed = parse_email(raw_email)
            email_tag = classify_email(parsed["body"])

            # ── Dedup by Message-ID (Fix 2: not IMAP uid) ────
            message_id = parsed.get("message_id", "")
            if message_id:
                existing = (
                    get_supabase()
                    .table("emails")
                    .select("id")
                    .eq("raw_uid", message_id)
                    .execute()
                )
                if existing.data:
                    print(f"Skipping duplicate: {parsed['subject']}")
                    skipped += 1
                    continue

            # ── Upload attachments to Supabase Storage ────────
            attachment_url = None
            if parsed["has_attachment"]:
                # Fix 3: parse raw bytes again for the msg object
                msg_obj = email_lib.message_from_bytes(raw_email)
                attachments = extract_attachments(msg_obj)
                for att in attachments:
                    try:
                        result = save_file(
                            att["data"],
                            att["filename"],
                            bucket="attachments"
                        )
                        attachment_url = result["url"]
                        break  # store first attachment URL only
                    except Exception as e:
                        print(f"Attachment upload failed: {e}")

            # ── Insert into Supabase ──────────────────────────
            email_data = {
                "sender":         parsed["sender"],
                "subject":        parsed["subject"],
                "body":           parsed["body"][:10000],  # cap at 10k chars
                "has_attachment": parsed["has_attachment"],
                "email_tag":      email_tag,
                "raw_uid":        message_id,
                "attachment_url": attachment_url,
                "is_read":        False,
            }
            get_supabase().table("emails").insert(email_data).execute()
            stored += 1
            print(f"Stored: [{email_tag}] {parsed['subject']}")

        except Exception as e:
            print(f"Error on email {email_id}: {e}")
            continue

    mail.logout()
    return {"fetched": fetched, "stored": stored, "skipped": skipped}


# ── DB reads ──────────────────────────────────────────────────

def get_emails(page: int = 1, limit: int = 10) -> list:
    """Paginated emails from Supabase, newest first."""
    start = (page - 1) * limit
    end = start + limit - 1
    response = (
        get_supabase()
        .table("emails")
        .select("*")
        .range(start, end)
        .order("created_at", desc=True)
        .execute()
    )
    return response.data


def get_email_by_id(email_id: str) -> Optional[dict]:
    """Fetch a single email by UUID. Returns None if not found."""
    response = (
        get_supabase()
        .table("emails")
        .select("*")
        .eq("id", email_id)
        .execute()
        # NOTE: NOT using .single() — it raises an exception on missing rows
        # Using [0] with None fallback is cleaner
    )
    return response.data[0] if response.data else None


def mark_email_read(email_id: str) -> bool:
    """Mark email as read. Auto-called when GET /emails/{id} is hit."""
    try:
        get_supabase().table("emails").update({"is_read": True}).eq("id", email_id).execute()
        return True
    except Exception:
        return False


# ── SMTP send ─────────────────────────────────────────────────

def send_email(
    to: str,
    subject: str,
    body: str,
    attachments: list[dict] = None   # [{"filename": "x.pdf", "data": bytes}]
) -> bool:
    """
    Send email via Gmail SMTP with TLS.
    attachments: list of {"filename": str, "data": bytes} — NOT file paths.
    """
    s = get_settings()
    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = s.gmail_user
    msg["To"] = to
    msg.set_content(body)

    for att in (attachments or []):
        msg.add_attachment(
            att["data"],
            maintype="application",
            subtype="octet-stream",
            filename=att["filename"]
        )

    with smtplib.SMTP("smtp.gmail.com", 587) as smtp:
        smtp.ehlo()
        smtp.starttls()
        smtp.ehlo()
        smtp.login(s.gmail_user, s.gmail_pass)
        smtp.send_message(msg)

    print(f"Email sent to {to}")
    return True