from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import get_settings

# ── Later you'll uncomment these as you build each phase ──────
from routers.email_router import router as email_router
from routers.invoice_router import router as invoice_router
from routers.task_router import router as task_router
# from routers.payment_router import router as payment_router
from routers.chatbot_router import router as chatbot_router
# from automation.scheduler import setup_scheduler


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Runs on startup and shutdown."""
    # startup
    print("Starting AI Business Assistant...")
    # await setup_scheduler()  ← uncomment in Phase 6
    yield
    # shutdown
    print("Shutting down...")


def create_app() -> FastAPI:
    settings = get_settings()

    app = FastAPI(
        title="AI Business Assistant",
        version="1.0.0",
        description="Automates emails, invoices, and tasks using AI agents",
        docs_url="/docs",       # Swagger UI at /docs
        redoc_url="/redoc",     # ReDoc at /redoc
        lifespan=lifespan,
    )

    # CORS — lets your React frontend (localhost:3000 or 5173) talk to the API
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.get_cors_list(),
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # ── Register routers (uncomment as you build each phase) ─────
    app.include_router(email_router, prefix="/emails", tags=["Emails"])
    app.include_router(invoice_router, prefix="/invoices", tags=["Invoices"])
    app.include_router(task_router, prefix="/tasks", tags=["Tasks"])
    # app.include_router(payment_router, prefix="/payments", tags=["Payments"])
    app.include_router(chatbot_router, prefix="/chat", tags=["Chatbot"])

    return app


app = create_app()


# ── Health check — your first working endpoint ────────────────
@app.get("/health", tags=["System"])
async def health_check():
    from database.client import get_supabase
    try:
        get_supabase().table("emails").select("id").limit(1).execute()
        db_status = "connected"
    except Exception as e:
        db_status = f"error: {e}"

    return {
        "status": "ok",
        "app": "AI Business Assistant",
        "database": db_status,
        "env": get_settings().app_env,
    }
