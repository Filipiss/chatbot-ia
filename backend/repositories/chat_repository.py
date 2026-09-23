from typing import List, Optional
from sqlalchemy.orm import Session
from models.chat import ChatSession, ChatMessage

class ChatRepository:
    """Repositório de acesso e persistência a sessões e mensagens de chat."""

    @staticmethod
    def count_sessions(db: Session) -> int:
        return db.query(ChatSession).count()

    @staticmethod
    def get_all_sessions(db: Session) -> List[ChatSession]:
        return db.query(ChatSession).order_by(ChatSession.created_at.desc()).all()

    @staticmethod
    def get_session_by_id(session_id: int, db: Session) -> Optional[ChatSession]:
        return db.query(ChatSession).filter(ChatSession.id == session_id).first()

    @staticmethod
    def create_session(name: str, db: Session) -> ChatSession:
        session = ChatSession(name=name)
        db.add(session)
        db.commit()
        db.refresh(session)
        return session

    @staticmethod
    def update_session_name(session: ChatSession, new_name: str, db: Session) -> ChatSession:
        session.name = new_name
        db.commit()
        db.refresh(session)
        return session

    @staticmethod
    def delete_session(session: ChatSession, db: Session) -> None:
        db.delete(session)
        db.commit()

    @staticmethod
    def clear_messages(session_id: int, db: Session) -> int:
        deleted_count = db.query(ChatMessage).filter(ChatMessage.session_id == session_id).delete()
        db.commit()
        return deleted_count

    @staticmethod
    def create_message(
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
