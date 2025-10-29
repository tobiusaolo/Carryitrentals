"""
Script to seed default additional services for inspection bookings.
These services include: Moving, Packaging, and Cleaning services.

Run this script once to populate the database with default services.
"""

import sys
from sqlalchemy.orm import Session
from app.database import SessionLocal, engine
from app.models.additional_service import AdditionalService

def seed_additional_services():
    """Seed the database with default additional services."""
    db: Session = SessionLocal()
    
    try:
        # Check if services already exist
        existing_services = db.query(AdditionalService).count()
        
        if existing_services > 0:
            print(f"⚠️  Database already has {existing_services} service(s). Skipping seed.")
            print("   If you want to re-seed, please delete existing services first.")
            return
        
        # Default services to seed
        default_services = [
            {
                "name": "Moving",
                "description": "Professional moving service for your belongings to the new property",
                "price": 150000,  # UGX 150,000
                "is_active": True
            },
            {
                "name": "Packaging",
                "description": "Complete packaging service with boxes and materials for safe transportation",
                "price": 80000,  # UGX 80,000
                "is_active": True
            },
            {
                "name": "Cleaning",
                "description": "Professional cleaning service for your new property before move-in",
                "price": 100000,  # UGX 100,000
                "is_active": True
            }
        ]
        
        # Create services
        created_count = 0
        for service_data in default_services:
            service = AdditionalService(**service_data)
            db.add(service)
            created_count += 1
            print(f"✓ Creating service: {service_data['name']} (UGX {service_data['price']:,})")
        
        db.commit()
        
        print(f"\n✅ Successfully created {created_count} additional services!")
        print("\nServices created:")
        print("-" * 80)
        
        all_services = db.query(AdditionalService).all()
        for service in all_services:
            print(f"ID: {service.id}")
            print(f"Name: {service.name}")
            print(f"Description: {service.description}")
            print(f"Price: UGX {float(service.price):,.0f}")
            print(f"Status: {'Active' if service.is_active else 'Inactive'}")
            print("-" * 80)
        
    except Exception as e:
        print(f"\n❌ Error seeding services: {str(e)}")
        db.rollback()
        sys.exit(1)
    finally:
        db.close()

if __name__ == "__main__":
    print("=" * 80)
    print("SEEDING ADDITIONAL SERVICES")
    print("=" * 80)
    print()
    seed_additional_services()
    print()
    print("=" * 80)
    print("SEEDING COMPLETE")
    print("=" * 80)

