from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime
from sqlalchemy.sql import func
from database.connection import Base

class Integration(Base):
    __tablename__ = "integrations"

    id = Column(Integer, primary_key=True, index=True)
    provider = Column(String(50), nullable=False)  # 'ozlo', 'gemini', 'openai'
    name = Column(String(100), nullable=False)     # ex: 'Google Gemini 2.5 Flash'
    model_name = Column(String(100), nullable=False) # ex: 'gemini-2.5-flash', 'gpt-4o-mini'
    api_key = Column(String(255), nullable=True)
    api_url = Column(String(255), nullable=True)   # ex: para custom base_url (Groq/OpenAI)
    is_active = Column(Boolean, default=False)
    system_instruction = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
