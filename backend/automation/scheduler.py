from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger
import services.email_services as email_service

# Singleton scheduler
scheduler = AsyncIOScheduler()

async def sync_emails_job():
    """
    Background job to fetch unread emails.
    """
    print("Running background Gmail sync...")
    try:
        result = email_service.fetch_unread_emails()
        print(f"Sync complete: {result}")
    except Exception as e:
        print(f"Background sync failed: {e}")

async def setup_scheduler():
    """
    Initializes and starts the scheduler.
    """
    if not scheduler.running:
        # Add job to run every 30 minutes
        scheduler.add_job(
            sync_emails_job,
            trigger=IntervalTrigger(minutes=30),
            id="gmail_sync",
            name="Sync Gmail inbox every 30 minutes",
            replace_existing=True
        )
        scheduler.start()
        print("Scheduler started. Gmail sync job scheduled for every 30 minutes.")

async def shutdown_scheduler():
    """
    Shuts down the scheduler.
    """
    if scheduler.running:
        scheduler.shutdown()
        print("Scheduler shut down.")
