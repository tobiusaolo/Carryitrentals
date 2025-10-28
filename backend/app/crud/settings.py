from sqlalchemy.orm import Session
from ..models.settings import SystemSettings
from ..schemas.settings import SystemSettingsCreate, SystemSettingsUpdate
from typing import Optional, List

def get_setting(db: Session, setting_key: str) -> Optional[SystemSettings]:
    """Get a setting by key."""
    return db.query(SystemSettings).filter(
        SystemSettings.setting_key == setting_key,
        SystemSettings.is_active == True
    ).first()

def get_all_settings(db: Session) -> List[SystemSettings]:
    """Get all active settings."""
    return db.query(SystemSettings).filter(SystemSettings.is_active == True).all()

def create_setting(db: Session, setting: SystemSettingsCreate) -> SystemSettings:
    """Create a new setting."""
    db_setting = SystemSettings(**setting.dict())
    db.add(db_setting)
    db.commit()
    db.refresh(db_setting)
    return db_setting

def update_setting(db: Session, setting_key: str, setting: SystemSettingsUpdate) -> Optional[SystemSettings]:
    """Update an existing setting."""
    db_setting = get_setting(db, setting_key)
    if not db_setting:
        return None
    
    update_data = setting.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_setting, key, value)
    
    db.commit()
    db.refresh(db_setting)
    return db_setting

def create_or_update_setting(db: Session, setting_key: str, setting_value: str, description: str = None) -> SystemSettings:
    """Create or update a setting."""
    db_setting = get_setting(db, setting_key)
    if db_setting:
        db_setting.setting_value = setting_value
        if description:
            db_setting.description = description
    else:
        db_setting = SystemSettings(
            setting_key=setting_key,
            setting_value=setting_value,
            description=description
        )
        db.add(db_setting)
    
    db.commit()
    db.refresh(db_setting)
    return db_setting

