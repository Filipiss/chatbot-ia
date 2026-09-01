from sqlalchemy.orm import Session
from models.integration import Integration
from schemas.integration import IntegrationCreate, IntegrationUpdate
from typing import List, Optional

class IntegrationController:
    @staticmethod
    def get_all(db: Session) -> List[Integration]:
        return db.query(Integration).order_by(Integration.created_at.desc()).all()

    @staticmethod
    def get_by_id(integration_id: int, db: Session) -> Optional[Integration]:
        return db.query(Integration).filter(Integration.id == integration_id).first()

    @staticmethod
    def create(data: IntegrationCreate, db: Session) -> Integration:
        db_obj = Integration(**data.model_dump())
        if db_obj.is_active:
            # Desativa outros se este novo for ativado
            db.query(Integration).update({Integration.is_active: False})
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    @staticmethod
    def update(integration_id: int, data: IntegrationUpdate, db: Session) -> Optional[Integration]:
        db_obj = db.query(Integration).filter(Integration.id == integration_id).first()
        if not db_obj:
            return None
        
        update_data = data.model_dump(exclude_unset=True)
        
        if update_data.get("is_active") is True:
            # Desativa todos os outros para garantir apenas um ativo
            db.query(Integration).filter(Integration.id != integration_id).update({Integration.is_active: False})

        for key, val in update_data.items():
            setattr(db_obj, key, val)
        
        db.commit()
        db.refresh(db_obj)
        return db_obj

    @staticmethod
    def delete(integration_id: int, db: Session) -> bool:
        db_obj = db.query(Integration).filter(Integration.id == integration_id).first()
        if not db_obj:
            return False
        db.delete(db_obj)
        db.commit()
        return True
