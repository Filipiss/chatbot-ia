import os
from sqlalchemy import create_engine, event
from sqlalchemy.engine import Engine
from sqlalchemy.orm import declarative_base, sessionmaker
from config.settings import settings

DATABASE_URL = settings.DATABASE_URL

if DATABASE_URL:
    # Produção: PostgreSQL (normaliza prefixo postgres:// para postgresql:// exigido pelo SQLAlchemy 2)
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
    engine = create_engine(DATABASE_URL)
else:
    # Desenvolvimento: SQLite local persistido na pasta database/ raiz do projeto
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    DB_DIR = os.path.join(BASE_DIR, "..", "..", "database")
    os.makedirs(DB_DIR, exist_ok=True)
    DB_PATH = os.path.join(DB_DIR, "chatbot.db")
    SQLITE_URL = f"sqlite:///{DB_PATH}"
    engine = create_engine(SQLITE_URL, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

@event.listens_for(Engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    """Garante integridade referencial ativando foreign keys no SQLite."""
    if type(dbapi_connection).__name__ in ("sqlite3.Connection", "Connection"):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()

def get_db():
    """Dependência FastAPI que provê uma sessão limpa do SQLAlchemy por requisição."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
