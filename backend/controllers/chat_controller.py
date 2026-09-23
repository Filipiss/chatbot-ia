from typing import List, Optional
from sqlalchemy.orm import Session
from models.chat import ChatSession, ChatMessage
from schemas.chat import ChatSessionCreate
from repositories.chat_repository import ChatRepository

class ChatController:
    """Controlador de regras de negócio para gerenciamento de sessões e mensagens de chat."""

    @staticmethod
    def create_session(data: ChatSessionCreate, db: Session) -> ChatSession:
        name = data.name.strip() if data.name else ""
        if not name:
            count = ChatRepository.count_sessions(db)
            name = f"Nova Conversa {count + 1}"
        return ChatRepository.create_session(name=name, db=db)

    @staticmethod
    def update_session_name(session_id: int, name: str, db: Session) -> Optional[ChatSession]:
        session = ChatRepository.get_session_by_id(session_id, db)
        if not session:
            return None
        clean_name = name.strip() if name and name.strip() else f"Nova Conversa {session_id}"
        return ChatRepository.update_session_name(session, clean_name, db)

    @staticmethod
    def get_sessions(db: Session) -> List[ChatSession]:
        return ChatRepository.get_all_sessions(db)

    @staticmethod
    def get_session(session_id: int, db: Session) -> Optional[ChatSession]:
        return ChatRepository.get_session_by_id(session_id, db)

    @staticmethod
    def delete_session(session_id: int, db: Session) -> bool:
        session = ChatRepository.get_session_by_id(session_id, db)
        if not session:
            return False
        ChatRepository.delete_session(session, db)
        return True

    @staticmethod
    def clear_session_messages(session_id: int, db: Session) -> bool:
        session = ChatRepository.get_session_by_id(session_id, db)
        if not session:
            return False
        ChatRepository.clear_messages(session_id, db)
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
        return ChatRepository.create_message(
            session_id=session_id,
            role=role,
            content=content,
            db=db,
            provider=provider,
            model_used=model_used,
            latency=latency,
            tokens_used=tokens_used
        )
