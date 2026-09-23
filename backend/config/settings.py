import os
from typing import List
from dotenv import load_dotenv

load_dotenv()

class Settings:
    """Configurações globais da aplicação."""
    PROJECT_NAME: str = "Integrador de IA e Chatbot Orgânico API"
    VERSION: str = "1.0.0"
    DESCRIPTION: str = "Backend assíncrono para orquestração de múltiplos provedores de LLM e chats em tempo real."
    
    # Segurança
    SECRET_KEY: str = os.getenv("SECRET_KEY", "antigravity-chatbot-integrator-secret-key-2026")
    
    # Banco de Dados
    DATABASE_URL: str = os.getenv("DATABASE_URL", "")
    
    # Provedores de IA
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    
    # CORS
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "")
    
    @property
    def cors_origins(self) -> List[str]:
        origins = [
            "http://localhost:5173",
            "http://localhost:5174",
            "http://localhost:3000",
            "http://127.0.0.1:5173",
            "http://127.0.0.1:5174",
            "http://127.0.0.1:3000",
        ]
        if self.FRONTEND_URL:
            for url in self.FRONTEND_URL.split(","):
                cleaned = url.strip()
                if cleaned and cleaned not in origins:
                    origins.append(cleaned)
        return origins

settings = Settings()
