import json
import asyncio
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from config.database import get_db
from schemas.chat import (
    ChatSessionResponse,
    ChatSessionCreate,
    ChatSessionUpdate,
    ChatMessageResponse,
    ChatMessageCreate
)
from controllers.chat_controller import ChatController
from services.llm_service import LLMService

router = APIRouter(prefix="/api/chats", tags=["Chats"])

@router.get("", response_model=List[ChatSessionResponse])
def get_all_sessions(db: Session = Depends(get_db)):
    """Retorna todas as sessões de chat ordenadas pela data de criação decrescente."""
    return ChatController.get_sessions(db)

@router.get("/{session_id}", response_model=ChatSessionResponse)
def get_session(session_id: int, db: Session = Depends(get_db)):
    """Retorna detalhes de uma sessão e seu histórico completo de mensagens."""
    session = ChatController.get_session(session_id, db)
    if not session:
        raise HTTPException(status_code=404, detail="Sessão de chat não encontrada.")
    return session

@router.post("", response_model=ChatSessionResponse, status_code=status.HTTP_201_CREATED)
def create_session(data: ChatSessionCreate, db: Session = Depends(get_db)):
    """Cria uma nova sessão de conversa vazia."""
    return ChatController.create_session(data, db)

@router.put("/{session_id}", response_model=ChatSessionResponse)
def update_session(session_id: int, data: ChatSessionUpdate, db: Session = Depends(get_db)):
    """Atualiza o nome/título da sessão de conversa."""
    session = ChatController.update_session_name(session_id, data.name, db)
    if not session:
        raise HTTPException(status_code=404, detail="Sessão de chat não encontrada.")
    return session

@router.delete("/{session_id}")
def delete_session(session_id: int, db: Session = Depends(get_db)):
    """Remove permanentemente a sessão e todas as suas mensagens em cascata."""
    success = ChatController.delete_session(session_id, db)
    if not success:
        raise HTTPException(status_code=404, detail="Sessão de chat não encontrada.")
    return {"message": "Sessão removida com sucesso."}

@router.post("/{session_id}/clear")
def clear_session(session_id: int, db: Session = Depends(get_db)):
    """Limpa todas as mensagens da sessão, preservando o registro da conversa ativo."""
    success = ChatController.clear_session_messages(session_id, db)
    if not success:
        raise HTTPException(status_code=404, detail="Sessão de chat não encontrada.")
    return {"message": "Sessão reiniciada com sucesso."}

@router.post("/{session_id}/message")
async def send_message_stream(
    session_id: int, 
    data: ChatMessageCreate, 
    db: Session = Depends(get_db)
):
    """
    Envia uma mensagem do usuário, salva no DB e inicia o stream da resposta do assistente via SSE.
    """
    session = ChatController.get_session(session_id, db)
    if not session:
        raise HTTPException(status_code=404, detail="Sessão de chat não encontrada.")

    # Salva a mensagem do usuário imediatamente
    user_msg = ChatController.add_message(
        session_id=session_id,
        role="user",
        content=data.content,
        db=db
    )

    # Constrói o histórico da conversa para dar contexto ao modelo
    history = []
    for msg in session.messages:
        if msg.id != user_msg.id:
            history.append({"role": msg.role, "content": msg.content})

    async def event_generator():
        assistant_full_reply = ""
        meta = {}
        
        async for chunk in LLMService.generate_response_stream(data.content, history, db):
            if chunk["type"] == "content":
                assistant_full_reply += chunk["content"]
                yield f"data: {json.dumps(chunk)}\n\n"
            elif chunk["type"] == "done":
                meta = chunk
                yield f"data: {json.dumps(chunk)}\n\n"

        # Salva a resposta completa do assistente com as métricas capturadas
        if assistant_full_reply.strip():
            ChatController.add_message(
                session_id=session_id,
                role="assistant",
                content=assistant_full_reply,
                db=db,
                provider=meta.get("provider"),
                model_used=meta.get("model_used"),
                latency=meta.get("latency"),
                tokens_used=meta.get("tokens_used")
            )

    return StreamingResponse(
        event_generator(), 
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )
