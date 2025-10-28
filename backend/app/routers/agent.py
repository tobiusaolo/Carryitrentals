from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict
from ..database import get_db
from ..models.user import User
from ..auth import require_roles, get_current_active_user
from ..schemas.agent import AgentCreate, AgentUpdate, AgentResponse
from ..crud import agent as agent_crud

router = APIRouter()

@router.get("/my-profile", response_model=AgentResponse)
async def get_my_profile(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get current agent's profile information"""
    from ..models.agent import Agent
    
    # Find the agent record matching this user's email/phone
    agent = db.query(Agent).filter(
        (Agent.email == current_user.email) | (Agent.phone == current_user.phone)
    ).first()
    
    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent profile not found"
        )
    
    return agent

@router.get("/my-stats", response_model=Dict)
async def get_agent_stats(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get statistics for the current agent"""
    from ..models.rental_unit import RentalUnit
    from ..models.inspection_booking import InspectionBooking
    from ..models.inspection_payment import InspectionPayment
    from ..models.agent import Agent
    from ..models.enums import UnitStatus
    
    print(f"DEBUG my-stats: Current user ID: {current_user.id}")
    print(f"DEBUG my-stats: Current user email: {current_user.email}")
    print(f"DEBUG my-stats: Current user role: {current_user.role}")
    
    # Find the agent record matching this user's email/phone
    agent = db.query(Agent).filter(
        (Agent.email == current_user.email) | (Agent.phone == current_user.phone)
    ).first()
    
    print(f"DEBUG my-stats: Agent found: {agent is not None}")
    if agent:
        print(f"DEBUG my-stats: Agent ID: {agent.id}")
    
    if not agent:
        # No agent record found, return empty stats
        return {
            "total_units_added": 0,
            "occupied_units": 0,
            "vacant_units": 0,
            "total_inspections": 0,
            "approved_inspections": 0,
            "pending_inspections": 0,
            "total_earnings": 0,
            "pending_earnings": 0
        }
    
    # Get rental units added by this agent
    rental_units = db.query(RentalUnit).filter(RentalUnit.agent_id == agent.id).all()
    
    occupied_units = [u for u in rental_units if u.status == UnitStatus.OCCUPIED]
    vacant_units = [u for u in rental_units if u.status == UnitStatus.AVAILABLE]
    
    # Get inspections for agent's units
    unit_ids = [u.id for u in rental_units]
    inspections = db.query(InspectionBooking).filter(
        InspectionBooking.rental_unit_id.in_(unit_ids)
    ).all() if unit_ids else []
    
    approved_inspections = [i for i in inspections if i.status == 'approved']
    pending_inspections = [i for i in inspections if i.status == 'pending']
    
    # Calculate earnings from approved inspections
    approved_inspection_ids = [i.id for i in approved_inspections]
    total_earnings = 0
    if approved_inspection_ids:
        payments = db.query(InspectionPayment).filter(
            InspectionPayment.booking_id.in_(approved_inspection_ids),
            InspectionPayment.status == 'paid'
        ).all()
        total_earnings = sum(float(p.amount) for p in payments)
    
    # Calculate pending earnings
    pending_inspection_ids = [i.id for i in pending_inspections]
    pending_earnings = 0
    if pending_inspection_ids:
        pending_payments = db.query(InspectionPayment).filter(
            InspectionPayment.booking_id.in_(pending_inspection_ids)
        ).all()
        pending_earnings = sum(float(p.amount) for p in pending_payments)
    
    return {
        "total_units_added": len(rental_units),
        "occupied_units": len(occupied_units),
        "vacant_units": len(vacant_units),
        "total_inspections": len(inspections),
        "approved_inspections": len(approved_inspections),
        "pending_inspections": len(pending_inspections),
        "total_earnings": total_earnings,
        "pending_earnings": pending_earnings
    }

@router.post("/", response_model=AgentResponse)
async def create_agent(
    agent: AgentCreate,
    current_user: User = Depends(require_roles(["admin"])),
    db: Session = Depends(get_db)
):
    """Create a new agent. Only admins can create agents."""
    # Check if agent with email already exists
    existing_agent = agent_crud.get_agent_by_email(db, agent.email)
    if existing_agent:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Agent with this email already exists"
        )
    
    # Check if agent with NIN already exists
    existing_nin = agent_crud.get_agent_by_nin(db, agent.nin_number)
    if existing_nin:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Agent with this NIN number already exists"
        )
    
    return agent_crud.create_agent(db, agent)

@router.get("/", response_model=List[AgentResponse])
async def get_agents(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(require_roles(["admin"])),
    db: Session = Depends(get_db)
):
    """Get all agents. Only admins can view agents."""
    return agent_crud.get_agents(db, skip=skip, limit=limit)

@router.get("/active", response_model=List[AgentResponse])
async def get_active_agents(
    current_user: User = Depends(require_roles(["admin"])),
    db: Session = Depends(get_db)
):
    """Get all active agents. Only admins can view agents."""
    return agent_crud.get_active_agents(db)

@router.get("/{agent_id}", response_model=AgentResponse)
async def get_agent(
    agent_id: int,
    current_user: User = Depends(require_roles(["admin"])),
    db: Session = Depends(get_db)
):
    """Get agent by ID. Only admins can view agents."""
    agent = agent_crud.get_agent(db, agent_id)
    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent not found"
        )
    return agent

@router.put("/{agent_id}", response_model=AgentResponse)
async def update_agent(
    agent_id: int,
    agent_update: AgentUpdate,
    current_user: User = Depends(require_roles(["admin"])),
    db: Session = Depends(get_db)
):
    """Update agent information. Only admins can update agents."""
    # Check if agent exists
    existing_agent = agent_crud.get_agent(db, agent_id)
    if not existing_agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent not found"
        )
    
    # Check for email conflicts if email is being updated
    if agent_update.email and agent_update.email != existing_agent.email:
        email_conflict = agent_crud.get_agent_by_email(db, agent_update.email)
        if email_conflict:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Agent with this email already exists"
            )
    
    # Check for NIN conflicts if NIN is being updated
    if agent_update.nin_number and agent_update.nin_number != existing_agent.nin_number:
        nin_conflict = agent_crud.get_agent_by_nin(db, agent_update.nin_number)
        if nin_conflict:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Agent with this NIN number already exists"
            )
    
    return agent_crud.update_agent(db, agent_id, agent_update)

@router.delete("/{agent_id}")
async def delete_agent(
    agent_id: int,
    current_user: User = Depends(require_roles(["admin"])),
    db: Session = Depends(get_db)
):
    """Delete an agent. Only admins can delete agents."""
    success = agent_crud.delete_agent(db, agent_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent not found"
        )
    return {"message": "Agent deleted successfully"}

@router.put("/{agent_id}/performance")
async def update_agent_performance(
    agent_id: int,
    assigned_units: int = None,
    completed_inspections: int = None,
    current_user: User = Depends(require_roles(["admin"])),
    db: Session = Depends(get_db)
):
    """Update agent performance metrics. Only admins can update performance."""
    agent = agent_crud.update_agent_performance(
        db, agent_id, assigned_units, completed_inspections
    )
    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent not found"
        )
    return {"message": "Agent performance updated successfully"}
