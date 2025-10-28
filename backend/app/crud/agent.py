from sqlalchemy.orm import Session
from typing import List, Optional
from ..models.agent import Agent
from ..schemas.agent import AgentCreate, AgentUpdate

def create_agent(db: Session, agent: AgentCreate) -> Agent:
    """Create a new agent."""
    db_agent = Agent(**agent.dict())
    db.add(db_agent)
    db.commit()
    db.refresh(db_agent)
    return db_agent

def get_agent(db: Session, agent_id: int) -> Optional[Agent]:
    """Get agent by ID."""
    return db.query(Agent).filter(Agent.id == agent_id).first()

def get_agents(db: Session, skip: int = 0, limit: int = 100) -> List[Agent]:
    """Get all agents with pagination."""
    agents = db.query(Agent).offset(skip).limit(limit).all()
    return agents

def get_agent_by_email(db: Session, email: str) -> Optional[Agent]:
    """Get agent by email."""
    return db.query(Agent).filter(Agent.email == email).first()

def get_agent_by_nin(db: Session, nin_number: str) -> Optional[Agent]:
    """Get agent by NIN number."""
    return db.query(Agent).filter(Agent.nin_number == nin_number).first()

def update_agent(db: Session, agent_id: int, agent_update: AgentUpdate) -> Optional[Agent]:
    """Update agent information."""
    db_agent = db.query(Agent).filter(Agent.id == agent_id).first()
    if db_agent:
        update_data = agent_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_agent, field, value)
        db.commit()
        db.refresh(db_agent)
    return db_agent

def delete_agent(db: Session, agent_id: int) -> bool:
    """Delete an agent."""
    db_agent = db.query(Agent).filter(Agent.id == agent_id).first()
    if db_agent:
        db.delete(db_agent)
        db.commit()
        return True
    return False

def get_active_agents(db: Session) -> List[Agent]:
    """Get all active agents."""
    agents = db.query(Agent).filter(Agent.is_active == True).all()
    return agents

def update_agent_performance(db: Session, agent_id: int, assigned_units: int = None, completed_inspections: int = None) -> Optional[Agent]:
    """Update agent performance metrics."""
    db_agent = db.query(Agent).filter(Agent.id == agent_id).first()
    if db_agent:
        if assigned_units is not None:
            db_agent.assigned_units = assigned_units
        if completed_inspections is not None:
            db_agent.completed_inspections = completed_inspections
        db.commit()
        db.refresh(db_agent)
    return db_agent
