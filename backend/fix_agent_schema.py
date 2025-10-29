"""
Fix Agent model schema in production database
This script renames the conflicting 'assigned_units' column to 'assigned_units_count'
"""

import sys
sys.path.insert(0, '.')

from app.database import engine, SessionLocal
from sqlalchemy import text

def fix_agent_schema():
    """Fix the Agent table schema"""
    db = SessionLocal()
    
    try:
        print("🔧 Fixing Agent table schema...")
        
        # Check if agents table exists
        result = db.execute(text("SELECT to_regclass('public.agents')"))
        table_exists = result.scalar() is not None
        
        if not table_exists:
            print("✅ Agents table doesn't exist yet - will be created with correct schema")
            return True
        
        # Check current columns
        result = db.execute(text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'agents' AND table_schema = 'public'
        """))
        columns = [row[0] for row in result.fetchall()]
        
        print(f"📋 Current columns: {', '.join(columns)}")
        
        # Check if we need to rename
        if 'assigned_units' in columns and 'assigned_units_count' not in columns:
            print("🔄 Renaming 'assigned_units' to 'assigned_units_count'...")
            db.execute(text("ALTER TABLE agents RENAME COLUMN assigned_units TO assigned_units_count"))
            db.commit()
            print("✅ Column renamed successfully!")
        elif 'assigned_units_count' in columns:
            print("✅ Column already correctly named as 'assigned_units_count'")
        else:
            print("⚠️ 'assigned_units' column not found - table may need to be recreated")
        
        print("\n✅ Schema fix completed successfully!")
        return True
        
    except Exception as e:
        print(f"\n❌ Error fixing schema: {str(e)}")
        db.rollback()
        import traceback
        traceback.print_exc()
        return False
        
    finally:
        db.close()

if __name__ == "__main__":
    print("\n🔧 Agent Schema Fix Script")
    print("=" * 50)
    success = fix_agent_schema()
    sys.exit(0 if success else 1)

