import os
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from database.connection import Base, engine, get_db
from sqlalchemy.orm import Session
from models.integration import Integration
from routes.integration import router as integration_router
from routes.chat import router as chat_router

load_dotenv()

# Cria as tabelas do banco de dados ao iniciar
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Integrador de IA e Chatbot Orgânico API",
    description="Backend para gerenciamento de múltiplos provedores de LLM e chats em tempo real.",
    version="1.0.0"
)

# Configuração de CORS
# Permitir chamadas do Vite frontend local (geralmente porta 5173 ou 5174)
origins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    "http://127.0.0.1:3000",
]
frontend_url = os.getenv("FRONTEND_URL")
if frontend_url:
    origins.append(frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inicializa as rotas
app.include_router(integration_router)
app.include_router(chat_router)

def seed_default_integrations():
    """Insere as configurações modelo padrão de IA no banco de dados se estiver vazio."""
    db = Session(bind=engine)
    try:
        # Remove qualquer integração remanescente do Ollama
        db.query(Integration).filter(Integration.provider == "ollama").delete()
        db.commit()

        if db.query(Integration).count() == 0:
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
                    name="OpenAI GPT-4o Mini",
                    model_name="gpt-4o-mini",
                    api_key="",
                    api_url=None,
                    is_active=False,
                    system_instruction="Você é um assistente OpenAI GPT-4o Mini. Responda de forma sucinta e inteligente."
                )
            ]
            db.add_all(defaults)
            db.commit()
            print("→ Integrações iniciadas por padrão no banco de dados com sucesso.")
        else:
            ozlo_exists = db.query(Integration).filter(Integration.provider == "ozlo").first()
            if not ozlo_exists:
                db.query(Integration).update({Integration.is_active: False})
                ozlo = Integration(
                    provider="ozlo",
                    name="Ozlo Orgânico (Simulador Demo)",
                    model_name="ozlo-v1-sim",
                    api_key="demo-key",
                    api_url=None,
                    is_active=True,
                    system_instruction="Você é o Ozlo, assistente inteligente do portfólio. Responda em português."
                )
                db.add(ozlo)
                db.commit()
                print("→ Integração do simulador 'ozlo' adicionada e ativada.")
    except Exception as e:
        print(f"Erro ao semear integrações: {e}")
        db.rollback()
    finally:
        db.close()

# Executa o seed
seed_default_integrations()

@app.get("/")
def read_root():
    return {
        "project": "Integrador de IA e Chatbot Orgânico",
        "status": "healthy",
        "api_docs": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
