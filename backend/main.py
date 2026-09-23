import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from config.database import Base, engine, SessionLocal
from config.settings import settings
from docs.openapi import API_METADATA
from models.integration import Integration
from repositories.integration_repository import IntegrationRepository
from routes.integration import router as integration_router
from routes.chat import router as chat_router

# Inicializa as tabelas do banco relacional
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=API_METADATA["title"],
    description=API_METADATA["description"],
    version=API_METADATA["version"],
    openapi_tags=API_METADATA["openapi_tags"],
    contact=API_METADATA["contact"],
    license_info=API_METADATA["license_info"],
)

# Configuração de CORS para desenvolvimento local e ambientes de nuvem (Vercel, Render)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_origin_regex=r"^https://.*\.vercel\.app$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registro de roteadores modulares
app.include_router(integration_router)
app.include_router(chat_router)

def seed_default_integrations():
    """Garante a inicialização dos provedores padrão no banco relacional."""
    db = SessionLocal()
    try:
        # Limpeza de provedores descontinuados
        IntegrationRepository.delete_by_provider("ollama", db)

        if IntegrationRepository.count(db) == 0:
            defaults = [
                Integration(
                    provider="ozlo",
                    name="Ozlo Orgânico (Simulador Demo)",
                    model_name="ozlo-v1-sim",
                    api_key="demo-key",
                    api_url=None,
                    is_active=True,
                    system_instruction="Você é o Ozlo, assistente inteligente do portfólio. Responda em português."
                ),
                Integration(
                    provider="gemini",
                    name="Google Gemini 3.6 Flash",
                    model_name="gemini-3.6-flash",
                    api_key="",
                    api_url=None,
                    is_active=False,
                    system_instruction="Você é o Gemini, um chatbot orgânico integrado a este dashboard. Responda em português de forma clara."
                ),
                Integration(
                    provider="openai",
                    name="Groq Compound",
                    model_name="groq/compound",
                    api_key="",
                    api_url="https://api.groq.com/openai/v1",
                    is_active=False,
                    system_instruction="Você é um assistente OpenAI GPT-4o Mini / Groq. Responda de forma sucinta e inteligente."
                )
            ]
            IntegrationRepository.add_all(defaults, db)
            print("→ Provedores padrão inicializados com sucesso via IntegrationRepository.")
        else:
            # Atualiza modelos legados para as versões recomendadas
            gemini_row = IntegrationRepository.filter_by_provider("gemini", db)
            if gemini_row and gemini_row.model_name in ["gemini-1.5-flash", "gemini-2.5-flash", "gemini-pro"]:
                gemini_row.model_name = "gemini-3.6-flash"

            openai_row = IntegrationRepository.filter_by_provider("openai", db)
            if openai_row and not openai_row.api_url:
                openai_row.api_url = "https://api.groq.com/openai/v1"
                openai_row.model_name = "groq/compound"

            ozlo_exists = IntegrationRepository.filter_by_provider("ozlo", db)
            if not ozlo_exists:
                ozlo = Integration(
                    provider="ozlo",
                    name="Ozlo Orgânico (Simulador Demo)",
                    model_name="ozlo-v1-sim",
                    api_key="demo-key",
                    api_url=None,
                    is_active=False,
                    system_instruction="Você é o Ozlo, assistente inteligente do portfólio. Responda em português."
                )
                db.add(ozlo)

            db.commit()
    except Exception as e:
        print(f"Erro ao executar seed de integrações: {e}")
        db.rollback()
    finally:
        db.close()

# Executa seed inicial
seed_default_integrations()

@app.get("/", tags=["Health"])
def read_root():
    return {
        "project": "Integrador de IA e Chatbot Orgânico",
        "status": "healthy",
        "version": settings.VERSION,
        "api_docs": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
