"""
Create Agent User for Testing
This script creates a User account with role='agent' for testing agent login.
"""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'app'))

from app.database import SessionLocal
from app.auth import get_password_hash
from app.models.user import User
from app.models.agent import Agent
from app.models.enums import UserRole

def create_agent_user():
    """Create a test agent user."""
    db = SessionLocal()
    
    try:
        # Agent credentials
        agent_email = "testagent@carryit.com"
        agent_phone = "+256750371313"
        agent_password = "agent123"
        
        # Check if user already exists
        existing_user = db.query(User).filter(User.email == agent_email).first()
        
        if existing_user:
            print(f"\n⚠️  Agent user already exists!")
            print(f"   Email: {agent_email}")
            print(f"   Phone: {agent_phone}")
            print(f"   Role: {existing_user.role}")
            print("\n✅ Use these credentials to login as agent.")
            print(f"   Password: {agent_password}")
            return True
        
        # Create agent user in users table
        print(f"\n📝 Creating agent user...")
        print(f"   Email: {agent_email}")
        print(f"   Phone: {agent_phone}")
        print(f"   Role: agent")
        
        hashed_password = get_password_hash(agent_password)
        
        agent_user = User(
            email=agent_email,
            username="testagent",
            hashed_password=hashed_password,
            first_name="Test",
            last_name="Agent",
            phone=agent_phone,
            role=UserRole.AGENT,
            is_active=True,
            is_verified=True
        )
        
        db.add(agent_user)
        db.commit()
        db.refresh(agent_user)
        
        # Also create an Agent profile (optional but recommended)
        agent_profile = Agent(
            name="Test Agent",
            email=agent_email,
            phone=agent_phone,
            age=30,
            location="Kampala, Uganda",
            nin_number="CM12345678901234",
            specialization="Property Inspections",
            is_active=True,
            notes="Test agent created automatically"
        )
        
        db.add(agent_profile)
        db.commit()
        
        print("\n✅ Agent user created successfully!")
        print("\n" + "=" * 70)
        print("Agent Login Credentials".center(70))
        print("=" * 70)
        print(f"\n   Email:    {agent_email}")
        print(f"   Phone:    {agent_phone}")
        print(f"   Password: {agent_password}")
        print(f"   Role:     agent")
        print(f"\n   👉 Login at: https://carryitrentals.onrender.com/#/agent-login")
        print("\n" + "=" * 70)
        
        return True
        
    except Exception as e:
        print(f"\n❌ Error creating agent user: {str(e)}")
        db.rollback()
        import traceback
        traceback.print_exc()
        return False
        
    finally:
        db.close()

if __name__ == "__main__":
    print("\n🔐 Creating Agent User for Testing...\n")
    success = create_agent_user()
    sys.exit(0 if success else 1)

