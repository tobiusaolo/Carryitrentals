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
    """Create User account for existing agent in database."""
    db = SessionLocal()
    
    try:
        # First, check if there are agents in the agents table
        existing_agents = db.query(Agent).all()
        
        if not existing_agents:
            print(f"\n⚠️  No agents found in database!")
            print(f"   Please create an agent first via Admin Panel.")
            return False
        
        print(f"\n📋 Found {len(existing_agents)} agent(s) in database:")
        for agent in existing_agents:
            print(f"   - {agent.name} ({agent.email}, {agent.phone})")
        
        # Use the first agent's details
        agent = existing_agents[0]
        agent_email = agent.email
        agent_phone = agent.phone
        agent_name = agent.name
        agent_password = "agent123"  # Default password
        
        # Check if user already exists
        existing_user = db.query(User).filter(User.email == agent_email).first()
        
        if existing_user:
            print(f"\n⚠️  User account already exists for this agent!")
            print(f"   Email: {agent_email}")
            print(f"   Phone: {agent_phone}")
            print(f"   Role: {existing_user.role}")
            print("\n✅ Use these credentials to login as agent.")
            print(f"   Password: {agent_password}")
            return True
        
        # Create User account in users table for the existing agent
        print(f"\n📝 Creating User account for agent '{agent_name}'...")
        print(f"   Email: {agent_email}")
        print(f"   Phone: {agent_phone}")
        print(f"   Role: agent")
        
        hashed_password = get_password_hash(agent_password)
        
        # Extract first and last name
        name_parts = agent_name.split()
        first_name = name_parts[0] if name_parts else agent_name
        last_name = ' '.join(name_parts[1:]) if len(name_parts) > 1 else ""
        
        agent_user = User(
            email=agent_email,
            username=agent_email.split('@')[0],  # Use email prefix as username
            hashed_password=hashed_password,
            first_name=first_name,
            last_name=last_name,
            phone=agent_phone,
            role=UserRole.AGENT,
            is_active=True,
            is_verified=True
        )
        
        db.add(agent_user)
        db.commit()
        db.refresh(agent_user)
        
        print("\n✅ User account created successfully for agent!")
        print("\n" + "=" * 70)
        print("Agent Login Credentials".center(70))
        print("=" * 70)
        print(f"\n   Name:     {agent_name}")
        print(f"   Email:    {agent_email}")
        print(f"   Phone:    {agent_phone}")
        print(f"   Password: {agent_password}")
        print(f"   Role:     agent")
        print(f"\n   👉 Login at: https://carryitrentals.onrender.com/#/agent-login")
        print(f"   👉 Use either email OR phone as username")
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

