"""
Seed Admin User Script
Creates the default admin user for CarryIT system
"""

import sys
import os
from sqlalchemy.orm import Session

# Add the app directory to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'app'))

from app.database import SessionLocal, engine
from app.auth import get_password_hash

# Import all models (this ensures they are registered with SQLAlchemy)
import app.models
from app.models.airbnb import Airbnb
from app.models.airbnb_booking import AirbnbBooking
from app.models.user import User
from app.models.enums import UserRole

def create_admin_user():
    """Create the default admin user if it doesn't exist."""
    
    print("=" * 70)
    print("CarryIT Admin User Setup".center(70))
    print("=" * 70)
    
    db = SessionLocal()
    
    try:
        # Admin credentials
        admin_email = "carryitadmin@gmail.com"
        admin_username = "carryitadmin"
        admin_password = "admin123"
        
        # Check if admin already exists
        existing_admin = db.query(User).filter(User.email == admin_email).first()
        
        if existing_admin:
            print(f"\n⚠️  Admin user already exists!")
            print(f"   Email: {admin_email}")
            print(f"   Username: {existing_admin.username}")
            print(f"   Role: {existing_admin.role.value if hasattr(existing_admin.role, 'value') else existing_admin.role}")
            print(f"   Created: {existing_admin.created_at}")
            print("\n✅ No action needed - admin user is already set up.")
            return True
        
        # Create admin user
        print(f"\n📝 Creating admin user...")
        print(f"   Email: {admin_email}")
        print(f"   Username: {admin_username}")
        print(f"   Role: admin")
        
        hashed_password = get_password_hash(admin_password)
        
        admin_user = User(
            email=admin_email,
            username=admin_username,
            hashed_password=hashed_password,
            first_name="CarryIT",
            last_name="Admin",
            phone="+256754577922",
            role=UserRole.ADMIN,
            is_active=True,
            is_verified=True
        )
        
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
        
        print("\n✅ Admin user created successfully!")
        print("\n" + "=" * 70)
        print("Admin Credentials".center(70))
        print("=" * 70)
        print(f"\n   Email:    {admin_email}")
        print(f"   Password: {admin_password}")
        print(f"   Role:     admin")
        print(f"\n   👉 Use these credentials to login to the admin panel")
        print("\n" + "=" * 70)
        
        return True
        
    except Exception as e:
        print(f"\n❌ Error creating admin user: {str(e)}")
        db.rollback()
        return False
        
    finally:
        db.close()

def main():
    """Main function."""
    print("\n🔐 Setting up CarryIT Admin User...\n")
    
    success = create_admin_user()
    
    if success:
        print("\n✅ Admin setup complete!")
        print("   You can now login with the admin credentials.\n")
        return 0
    else:
        print("\n❌ Admin setup failed!")
        print("   Please check the error messages above.\n")
        return 1

if __name__ == "__main__":
    sys.exit(main())

