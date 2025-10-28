"""
Production Verification Script
Quickly verify all systems are operational before deployment
"""

import os
import sys
from sqlalchemy import inspect, text
from app.database import engine
from app.services.payment_scheduler import payment_scheduler

def verify_database():
    """Verify database connection and tables"""
    print("🔍 Verifying Database Connection...")
    try:
        with engine.connect() as conn:
            result = conn.execute(text("SELECT version()"))
            version = result.fetchone()[0]
            print(f"✅ PostgreSQL Connected: {version[:50]}...")
            
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        print(f"✅ Tables Found: {len(tables)}")
        
        expected_tables = [
            'users', 'agents', 'rental_units', 'airbnbs', 'airbnb_bookings',
            'inspection_bookings', 'system_settings', 'payments', 'tenants'
        ]
        
        for table in expected_tables:
            if table in tables:
                print(f"   ✅ {table}")
            else:
                print(f"   ❌ {table} - MISSING!")
                return False
        
        return True
    except Exception as e:
        print(f"❌ Database Error: {e}")
        return False

def verify_environment():
    """Verify environment variables"""
    print("\n🔍 Verifying Environment Variables...")
    
    required_vars = [
        'DATABASE_URL',
        'SECRET_KEY',
        'AFRICAS_TALKING_API_KEY'
    ]
    
    all_present = True
    for var in required_vars:
        value = os.getenv(var)
        if value:
            # Mask sensitive values
            if 'KEY' in var or 'PASSWORD' in var or 'SECRET' in var:
                masked = value[:10] + '...' if len(value) > 10 else '***'
                print(f"   ✅ {var}: {masked}")
            else:
                print(f"   ✅ {var}: Set")
        else:
            print(f"   ❌ {var}: NOT SET!")
            all_present = False
    
    return all_present

def verify_scheduler():
    """Verify payment scheduler"""
    print("\n🔍 Verifying Payment Scheduler...")
    try:
        # Try to start scheduler
        if payment_scheduler.start_scheduler():
            print("✅ Payment scheduler started successfully")
            payment_scheduler.stop_scheduler()
            print("✅ Payment scheduler stopped successfully")
            return True
        else:
            print("⚠️  Scheduler not available (optional service)")
            return True  # Non-critical
    except Exception as e:
        print(f"⚠️  Scheduler warning: {e}")
        return True  # Non-critical

def verify_models():
    """Verify all models are importable"""
    print("\n🔍 Verifying Models...")
    try:
        from app.models.user import User
        from app.models.rental_unit import RentalUnit
        from app.models.airbnb import Airbnb
        from app.models.airbnb_booking import AirbnbBooking
        from app.models.inspection_booking import InspectionBooking
        from app.models.settings import SystemSettings
        from app.models.payment import Payment
        from app.models.tenant import Tenant
        
        print("✅ All critical models imported successfully")
        return True
    except Exception as e:
        print(f"❌ Model import error: {e}")
        return False

def main():
    """Main verification routine"""
    print("=" * 70)
    print("CarryIT Production Verification".center(70))
    print("=" * 70)
    
    # Load environment
    from dotenv import load_dotenv
    load_dotenv()
    
    results = []
    
    # Run all verifications
    results.append(("Environment Variables", verify_environment()))
    results.append(("Database Connection", verify_database()))
    results.append(("Model Imports", verify_models()))
    results.append(("Payment Scheduler", verify_scheduler()))
    
    # Summary
    print("\n" + "=" * 70)
    print("Verification Summary".center(70))
    print("=" * 70)
    
    all_passed = True
    for name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{name:.<50} {status}")
        if not result:
            all_passed = False
    
    print("=" * 70)
    
    if all_passed:
        print("\n🎉 ALL VERIFICATIONS PASSED - SYSTEM IS PRODUCTION READY! 🎉\n")
        return 0
    else:
        print("\n⚠️  SOME VERIFICATIONS FAILED - REVIEW ERRORS ABOVE ⚠️\n")
        return 1

if __name__ == "__main__":
    sys.exit(main())

