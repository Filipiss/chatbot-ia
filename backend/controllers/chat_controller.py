from sqlalchemy.orm import Session
from models.chat import ChatSession, ChatMessage
from schemas.chat import ChatSessionCreate
from typing import List, Optional

class ChatController:
    @staticmethod
    def create_session(data: ChatSessionCreate, db: Session) -> ChatSession:
        # Se for string vazia ou nula cria um nome padrão
        name = data.name.strip() if data.name else ""
        if not name:
            count = db.query(ChatSession).count()
            name = f"Nova Conversa {count + 1}"
            
        session = ChatSession(name=name)
        db.add(session)
        db.commit()
        db.refresh(session)
        return session

    @staticmethod
    def update_session_name(session_id: int, name: str, db: Session) -> Optional[ChatSession]:
        session = db.query(ChatSession).filter(ChatSession.id == session_id).first()
        if not session:
            return None
        session.name = name.strip() if name.strip() else f"Nova Conversa {session_id}"
        db.commit()
        db.refresh(session)
        return session

    @staticmethod
    def get_sessions(db: Session) -> List[ChatSession]:
        return db.query(ChatSession).order_by(ChatSession.created_at.desc()).all()

    @staticmethod
    def get_session(session_id: int, db: Session) -> Optional[ChatSession]:
        return db.query(ChatSession).filter(ChatSession.id == session_id).first()

    @staticmethod
    def delete_session(session_id: int, db: Session) -> bool:
        session = db.query(ChatSession).filter(ChatSession.id == session_id).first()
        if not session:
            return False
        db.delete(session)
        db.commit()
        return True

    @staticmethod
    def clear_session_messages(session_id: int, db: Session) -> bool:
        session = db.query(ChatSession).filter(ChatSession.id == session_id).first()
        if not session:
            return False
        db.query(ChatMessage).filter(ChatMessage.session_id == session_id).delete()
        db.commit()
        return True

    @staticmethod
    def add_message(
        session_id: int, 
        role: str, 
        content: str, 
        db: Session,
        provider: Optional[str] = None,
        model_used: Optional[str] = None,
        latency: Optional[float] = None,
        tokens_used: Optional[int] = None
    ) -> ChatMessage:
        msg = ChatMessage(
            session_id=session_id,
            role=role,
            content=content,
            provider=provider,
            model_used=model_used,
            latency=latency,
            tokens_used=tokens_used
        )
        db.add(msg)
        db.commit()
        db.refresh(msg)
        return msg
