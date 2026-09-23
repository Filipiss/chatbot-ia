from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from models.integration import Integration

class IntegrationRepository:
    """Repositório de acesso e persistência a provedores de IA."""

    @staticmethod
    def count(db: Session) -> int:
        return db.query(Integration).count()

    @staticmethod
    def get_all(db: Session) -> List[Integration]:
        return db.query(Integration).order_by(Integration.id.asc()).all()

    @staticmethod
    def get_by_id(integration_id: int, db: Session) -> Optional[Integration]:
        return db.query(Integration).filter(Integration.id == integration_id).first()

    @staticmethod
    def get_active(db: Session) -> Optional[Integration]:
        return db.query(Integration).filter(Integration.is_active == True).first()

    @staticmethod
    def filter_by_provider(provider: str, db: Session) -> Optional[Integration]:
        return db.query(Integration).filter(Integration.provider == provider).first()

    @staticmethod
    def deactivate_all(db: Session, exclude_id: Optional[int] = None) -> None:
        query = db.query(Integration)
        if exclude_id is not None:
            query = query.filter(Integration.id != exclude_id)
        query.update({Integration.is_active: False})
        db.commit()

    @staticmethod
    def create(data: Dict[str, Any], db: Session) -> Integration:
        db_obj = Integration(**data)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    @staticmethod
    def update(db_obj: Integration, update_dict: Dict[str, Any], db: Session) -> Integration:
        for key, val in update_dict.items():
            setattr(db_obj, key, val)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    @staticmethod
    def delete(db_obj: Integration, db: Session) -> None:
        db.delete(db_obj)
        db.commit()

    @staticmethod
    def delete_by_provider(provider: str, db: Session) -> int:
        deleted = db.query(Integration).filter(Integration.provider == provider).delete()
        db.commit()
        return deleted

    @staticmethod
    def add_all(items: List[Integration], db: Session) -> None:
        db.add_all(items)
        db.commit()
