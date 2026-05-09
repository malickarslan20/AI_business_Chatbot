from langchain_core.tools import tool
import services.email_services as email_service


@tool
def fetch_recent_emails(limit: int = 5) -> str:
    """
    Fetch the most recent emails from the database.
    Use this when the user asks to see their emails, check inbox,
    or wants a summary of recent messages.

    Returns:
        Formatted list of emails.
    """
    try:
        emails = email_service.get_emails(page=1, limit=limit)

        if not emails:
            return "No emails found in the database."

        lines = [f"Found {len(emails)} emails:"]

        for e in emails:
            lines.append(
                f"- ID: {e['id']} | "
                f"From: {e['sender']} | "
                f"Subject: {e['subject']} | "
                f"Tag: {e['email_tag']} | "
                f"Read: {e.get('is_read', False)}"
            )

        return "\n".join(lines)

    except Exception as e:
        return f"Error fetching emails: {e}"


@tool
def sync_gmail_inbox() -> str:
    """
    Fetch unread emails from Gmail and store them in database.

    Use when the user asks to:
    - sync inbox
    - refresh emails
    - check new emails
    """
    try:
        result = email_service.fetch_unread_emails()

        return (
            f"Gmail sync complete.\n"
            f"Found: {result['fetched']} unread emails\n"
            f"Stored: {result['stored']} new emails\n"
            f"Skipped: {result['skipped']} duplicates"
        )

    except Exception as e:
        return f"Error syncing Gmail: {e}"


@tool
def send_email_tool(to: str, subject: str, body: str) -> str:
    """
    Send an email using Gmail SMTP.

    Args:
        to      : Recipient email address
        subject : Subject line
        body    : Plain text email body
    """
    try:
        email_service.send_email(
            to=to,
            subject=subject,
            body=body
        )

        return (
            f"Email sent successfully to {to} "
            f"with subject '{subject}'."
        )

    except Exception as e:
        return f"Error sending email: {e}"


@tool
def get_email_detail(email_id: str) -> str:
    """
    Retrieve complete email details by email ID.

    Args:
        email_id : UUID of email
    """
    try:
        email = email_service.get_email_by_id(email_id)

        if not email:
            return f"No email found with ID {email_id}"

        return (
            f"Email Details:\n"
            f"From: {email['sender']}\n"
            f"Subject: {email['subject']}\n"
            f"Tag: {email['email_tag']}\n\n"
            f"Body:\n"
            f"{email.get('body', '(no body)')[:1000]}"
        )

    except Exception as e:
        return f"Error getting email: {e}"


# Register all tools
EMAIL_TOOLS = [
    fetch_recent_emails,
    sync_gmail_inbox,
    send_email_tool,
    get_email_detail,
]