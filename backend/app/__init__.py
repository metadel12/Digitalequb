from fastapi import APIRouter, FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
import logging

from .core.config import settings
from .core.database import check_db_health, ensure_indexes, get_database_instance, migrate_legacy_sqlite_to_mongo
from .services.auth_service import AuthService

logger = logging.getLogger(__name__)


def create_application() -> FastAPI:
    app = FastAPI(
        title=f"{settings.PROJECT_NAME} API",
        description="MongoDB-backed API for DigiEqub.",
        version=settings.VERSION,
        docs_url="/api/docs",
        redoc_url="/api/redoc",
        openapi_url=f"{settings.API_V1_STR}/openapi.json",
    )

    @app.on_event("startup")
    def startup() -> None:
        import threading
        import time

        db = get_database_instance()
        ensure_indexes(db)
        migrate_legacy_sqlite_to_mongo(db)
        AuthService(db).ensure_system_admin()
        AuthService(db).ensure_demo_user()

        def auto_pay_loop() -> None:
            """Run auto-pay every hour in the background."""
            from .services.auto_pay_service import AutoPayService
            # Wait 60 seconds after startup before first run
            time.sleep(60)
            while True:
                try:
                    _db = get_database_instance()
                    summary = AutoPayService(_db).run()
                    if summary["processed"] or summary["failed"]:
                        logger.info(
                            "Auto-pay: %d paid, %d failed",
                            summary["processed"], summary["failed"]
                        )
                except Exception:
                    logger.exception("Auto-pay loop error")
                time.sleep(3600)  # run every hour

        t = threading.Thread(target=auto_pay_loop, daemon=True, name="auto-pay")
        t.start()

    @app.get("/", tags=["Platform"])
    async def root():
        return {
            "name": settings.PROJECT_NAME,
            "version": settings.VERSION,
            "status": "healthy",
            "docs": "/api/docs",
            "openapi": f"{settings.API_V1_STR}/openapi.json",
            "api_base": settings.API_V1_STR,
        }

    @app.get("/favicon.ico", include_in_schema=False)
    async def favicon() -> Response:
        return Response(status_code=204)

    platform_router = APIRouter(prefix=settings.API_V1_STR, tags=["Platform"])

    @platform_router.get("/health")
    async def health_check():
        mongo_healthy = check_db_health()
        return {
            "status": "healthy" if mongo_healthy else "degraded",
            "service": settings.PROJECT_NAME,
            "version": settings.VERSION,
            "environment": "development" if settings.DEBUG else "production",
            "database": "connected" if mongo_healthy else "unavailable",
            "mongodb": "connected" if mongo_healthy else "unavailable",
        }

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.add_middleware(TrustedHostMiddleware, allowed_hosts=settings.ALLOWED_HOSTS)

    from .api.v1 import admin, auth, dashboard, groups, notifications, payments, settings as settings_router, transactions, users
    from .routers import profile, wallet

    app.include_router(platform_router)
    app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
    app.include_router(users.router, prefix="/api/v1/users", tags=["Users"])
    app.include_router(groups.router, prefix="/api/v1/groups", tags=["Groups"])
    app.include_router(dashboard.router, prefix="/api/v1/dashboard", tags=["Dashboard"])
    app.include_router(transactions.router, prefix="/api/v1/transactions", tags=["Transactions"])
    app.include_router(wallet.router, prefix="/api/v1/wallet", tags=["Wallet"])
    app.include_router(settings_router.router, prefix="/api/v1/settings", tags=["Settings"])
    app.include_router(profile.router, prefix="/api/v1/profile", tags=["Profile"])
    app.include_router(admin.router, prefix="/api/v1/admin", tags=["Admin"])
    app.include_router(payments.router, prefix="/api/v1/payments", tags=["Payments"])
    app.include_router(notifications.router, prefix="/api/v1/notifications", tags=["Notifications"])

    return app


app = create_application()
