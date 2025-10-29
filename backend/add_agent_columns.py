"""
Add missing columns to Agent table
"""

import sys
sys.path.insert(0, '.')

from app.database import engine, SessionLocal
from sqlalchemy import text

def add_missing_columns():
    """Add missing columns to agents table"""
    db = SessionLocal()
    
    try:
        print("🔧 Adding missing columns to agents table...")
        
        # Check current columns
        result = db.execute(text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'agents' AND table_schema = 'public'
        """))
        columns = [row[0] for row in result.fetchall()]
        
        print(f"📋 Current columns: {', '.join(columns)}")
        
        # Add assigned_units_count if missing
        if 'assigned_units_count' not in columns:
            print("➕ Adding 'assigned_units_count' column...")
            db.execute(text("ALTER TABLE agents ADD COLUMN assigned_units_count INTEGER DEFAULT 0"))
            db.commit()
            print("✅ Column 'assigned_units_count' added!")
        else:
            print("✅ Column 'assigned_units_count' already exists")
        
        print("\n✅ All columns added successfully!")
        return True
        
    except Exception as e:
        print(f"\n❌ Error adding columns: {str(e)}")
        db.rollback()
        import traceback
        traceback.print_exc()
        return False
        
    finally:
        db.close()

if __name__ == "__main__":
    print("\n🔧 Add Agent Columns Script")
    print("=" * 50)
    success = add_missing_columns()
    sys.exit(0 if success else 1)

