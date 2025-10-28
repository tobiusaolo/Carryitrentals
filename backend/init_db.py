"""
Database Initialization Script for PostgreSQL Migration
This script creates all tables in the PostgreSQL database.
"""

import sys
import os

# Add the app directory to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'app'))

from app.database import engine, Base, init_db

# Import all models (this ensures they are registered with SQLAlchemy)
import app.models  # This imports all models from __init__.py
from app.models.airbnb import Airbnb
from app.models.airbnb_booking import AirbnbBooking
from app.models.settings import SystemSettings

# Import accounting models
from app.models.accounting.account import Account
from app.models.accounting.transaction import AccountingTransaction
from app.models.accounting.journal_entry import JournalEntry
from app.models.accounting.expense import Expense

def main():
    """Main function to initialize the database."""
    print("=" * 70)
    print("PostgreSQL Database Initialization")
    print("=" * 70)
    
    try:
        # Test database connection
        print("\n[1/3] Testing database connection...")
        connection = engine.connect()
        print("✅ Database connection successful!")
        connection.close()
        
        # Create all tables
        print("\n[2/3] Creating all tables...")
        Base.metadata.create_all(bind=engine)
        print("✅ All tables created successfully!")
        
        # Verify tables
        print("\n[3/3] Verifying tables...")
        from sqlalchemy import inspect
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        
        print(f"\n✅ Found {len(tables)} tables in the database:")
        for table in sorted(tables):
            print(f"   - {table}")
        
        print("\n" + "=" * 70)
        print("✅ DATABASE INITIALIZATION COMPLETE!")
        print("=" * 70)
        print("\nYour PostgreSQL database is ready for production use.")
        print("All tables have been created successfully.\n")
        
        return True
        
    except Exception as e:
        print("\n" + "=" * 70)
        print("❌ ERROR DURING INITIALIZATION")
        print("=" * 70)
        print(f"\nError: {str(e)}")
        print("\nPlease check:")
        print("1. Database connection string in .env file")
        print("2. PostgreSQL server is accessible")
        print("3. Database credentials are correct")
        print("4. Network connectivity to the database server\n")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)

