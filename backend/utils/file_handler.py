# utils/file_handler.py — COMPLETE FILE

import uuid
import mimetypes
from database.client import get_supabase


def save_file(file_bytes: bytes, filename: str, bucket: str = "attatchments") -> dict:
    """
    Upload file bytes to Supabase Storage bucket.

    Args:
        file_bytes : Raw bytes of the file
        filename   : Original filename e.g. 'invoice.pdf'
        bucket     : Supabase bucket name ('attatchments' or 'invoices')

    Returns:
        {"path": "uuid/filename.pdf", "url": "https://...public url..."}
    """

    # Unique path prevents filename collisions
    unique_path = f"{uuid.uuid4().hex}/{filename}"

    # Guess MIME type so browser renders files correctly
    mime_type, _ = mimetypes.guess_type(filename)
    mime_type = mime_type or "application/octet-stream"

    try:
        get_supabase().storage.from_(bucket).upload(
            path=unique_path,
            file=file_bytes,
            file_options={"content-type": mime_type},
        )
    except Exception as e:
        raise Exception(f"Upload failed for '{filename}': {e}")

    url = get_supabase().storage.from_(bucket).get_public_url(unique_path)

    return {"path": unique_path, "url": url}


def get_file_url(path: str, bucket: str = "attatchments") -> str:
    """
    Get the public URL for an already-uploaded file.

    Args:
        path   : Storage path from save_file() e.g. 'uuid/invoice.pdf'
        bucket : The bucket where the file lives
    """
    return get_supabase().storage.from_(bucket).get_public_url(path)


def delete_file(path: str, bucket: str = "attachments") -> bool:
    """
    Delete a file from Supabase Storage.
    Returns True on success, False on failure (never raises).
    """
    try:
        get_supabase().storage.from_(bucket).remove([path])
        return True
    except Exception:
        return False