from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os
from pathlib import Path

from .database import engine, Base
from .routers import auth, property, unit, payment, maintenance, utility, analytics, unit_utility, rental_units, rental_stats, tenant, payment_monitoring, inspections, qr_payment, mobile_payment, property_qr, property_mobile_payment, agent, admin, payment_methods, inspection_payments, webhooks, communications, accounting, reports, airbnb, inspection_bookings

# Import all models to register them with SQLAlchemy
from .models import *

# Create database tables
Base.metadata.create_all(bind=engine)

# Ensure SQLite schema has expected columns when using SQLite
def _ensure_sqlite_schema():
    try:
        # Detect sqlite by dialect name
        if engine.dialect.name != "sqlite":
            return
        with engine.connect() as conn:
            # Check existing columns in properties
            result = conn.exec_driver_sql("PRAGMA table_info(properties);")
            columns = {row[1] for row in result.fetchall()}
            if "mtn_mobile_money_number" not in columns:
                conn.exec_driver_sql("ALTER TABLE properties ADD COLUMN mtn_mobile_money_number VARCHAR;")
            if "airtel_money_number" not in columns:
                conn.exec_driver_sql("ALTER TABLE properties ADD COLUMN airtel_money_number VARCHAR;")

            # Check mobile_payments columns
            result2 = conn.exec_driver_sql("PRAGMA table_info(mobile_payments);")
            mp_columns = {row[1] for row in result2.fetchall()}
            if "months_advance" not in mp_columns:
                conn.exec_driver_sql("ALTER TABLE mobile_payments ADD COLUMN months_advance INTEGER DEFAULT 1;")
            if "is_prepayment" not in mp_columns:
                conn.exec_driver_sql("ALTER TABLE mobile_payments ADD COLUMN is_prepayment BOOLEAN DEFAULT 0;")

            # Check units columns
            result3 = conn.exec_driver_sql("PRAGMA table_info(units);")
            units_columns = {row[1] for row in result3.fetchall()}
            if "agent_id" not in units_columns:
                conn.exec_driver_sql("ALTER TABLE units ADD COLUMN agent_id INTEGER;")
    except Exception:
        # Silent pass to avoid startup crash; logs can be added if needed
        pass

_ensure_sqlite_schema()

# Initialize FastAPI app
app = FastAPI(
    title="Rental Management System API",
    description="A comprehensive rental property management system backend",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this properly for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for uploads
upload_dir = Path("uploads")
upload_dir.mkdir(exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Include routers
app.include_router(auth.router, prefix="/api/v1")
app.include_router(property.router, prefix="/api/v1")
app.include_router(unit.router, prefix="/api/v1")
app.include_router(payment.router, prefix="/api/v1")
app.include_router(maintenance.router, prefix="/api/v1")
app.include_router(utility.router, prefix="/api/v1")
app.include_router(analytics.router, prefix="/api/v1")
app.include_router(unit_utility.router, prefix="/api/v1")
app.include_router(rental_units.router, prefix="/api/v1")
app.include_router(rental_stats.router, prefix="/api/v1")
app.include_router(inspections.router, prefix="/api/v1")
app.include_router(qr_payment.router, prefix="/api/v1")
app.include_router(mobile_payment.router, prefix="/api/v1")
app.include_router(property_qr.router, prefix="/api/v1/property-qr")
app.include_router(property_mobile_payment.router, prefix="/api/v1/mobile-payment")
app.include_router(agent.router, prefix="/api/v1/agents", tags=["agents"])
app.include_router(tenant.router, prefix="/api/v1")
app.include_router(admin.router, prefix="/api/v1")
app.include_router(payment_methods.router, prefix="/api/v1")
app.include_router(inspection_payments.router, prefix="/api/v1")
app.include_router(webhooks.router, prefix="/api/v1")
app.include_router(communications.router, prefix="/api/v1")
app.include_router(accounting.router, prefix="/api/v1")
app.include_router(reports.router, prefix="/api/v1")
app.include_router(airbnb.router, prefix="/api/v1")
app.include_router(inspection_bookings.router, prefix="/api/v1")

@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "Rental Management System API",
        "version": "1.0.0",
        "docs": "/docs",
        "redoc": "/redoc"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "message": "API is running"}

# Startup event - Start automated scheduler
@app.on_event("startup")
async def startup_event():
    """Start automated services on application startup"""
    try:
        from .services.payment_scheduler import payment_scheduler
        payment_scheduler.start_scheduler()
        print("✅ Automated payment scheduler started successfully")
    except Exception as e:
        print(f"⚠️  Warning: Could not start payment scheduler: {e}")
        print("   Automation features will not be available")

@app.on_event("shutdown")
async def shutdown_event():
    """Stop automated services on application shutdown"""
    try:
        from .services.payment_scheduler import payment_scheduler
        payment_scheduler.stop_scheduler()
        print("✅ Automated payment scheduler stopped")
    except Exception as e:
        print(f"Warning: Error stopping scheduler: {e}")

# Global exception handler
@app.exception_handler(404)
async def not_found_handler(request, exc):
    from fastapi.responses import JSONResponse
    return JSONResponse(status_code=404, content={"detail": "Resource not found"})

@app.exception_handler(500)
async def internal_error_handler(request, exc):
    from fastapi.responses import JSONResponse
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
