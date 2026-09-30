from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime
from sqlalchemy.sql import func
from config.database import Base

class Integration(Base):
    __tablename__ = "integrations"

    id = Column(Integer, primary_key=True, index=True)
    provider = Column(String(50), nullable=False)
    name = Column(String(100), nullable=False)
    model_name = Column(String(100), nullable=False)
    api_key = Column(String(255), nullable=True)
    api_url = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=False)
    system_instruction = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
