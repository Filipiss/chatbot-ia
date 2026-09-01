from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from database.connection import get_db
from schemas.chat import ChatSessionResponse, ChatSessionCreate, ChatSessionUpdate, ChatMessageResponse, ChatMessageCreate
from controllers.chat_controller import ChatController
from services.llm_service import LLMService
from typing import List
import json
import asyncio

router = APIRouter(prefix="/api/chats", tags=["Chats"])

@router.get("", response_model=List[ChatSessionResponse])
def get_all_sessions(db: Session = Depends(get_db)):
    return ChatController.get_sessions(db)

@router.get("/{session_id}", response_model=ChatSessionResponse)
def get_session(session_id: int, db: Session = Depends(get_db)):
    session = ChatController.get_session(session_id, db)
    if not session:
        raise HTTPException(status_code=404, detail="Sessão de chat não encontrada.")
    return session

@router.post("", response_model=ChatSessionResponse)
def create_session(data: ChatSessionCreate, db: Session = Depends(get_db)):
    return ChatController.create_session(data, db)

@router.put("/{session_id}", response_model=ChatSessionResponse)
def update_session(session_id: int, data: ChatSessionUpdate, db: Session = Depends(get_db)):
    session = ChatController.update_session_name(session_id, data.name, db)
    if not session:
        raise HTTPException(status_code=404, detail="Sessão de chat não encontrada.")
    return session

@router.delete("/{session_id}")
def delete_session(session_id: int, db: Session = Depends(get_db)):
    success = ChatController.delete_session(session_id, db)
    if not success:
        raise HTTPException(status_code=404, detail="Sessão de chat não encontrada.")
    return {"message": "Sessão removida com sucesso."}

@router.post("/{session_id}/clear")
def clear_session(session_id: int, db: Session = Depends(get_db)):
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
    Envia uma mensagem do usuário, salva no DB e inicia o stream da resposta do assistente de IA.
    """
    # 1. Verifica se a sessão existe
    session = ChatController.get_session(session_id, db)
    if not session:
        raise HTTPException(status_code=404, detail="Sessão não encontrada.")

    # 2. Salva a mensagem do usuário no banco
    ChatController.add_message(
        session_id=session_id,
        role="user",
        content=data.content,
        db=db
    )

    # 3. Recupera o histórico das últimas 15 mensagens da sessão para passar de contexto à IA
    history_msgs = session.messages[-15:] if session.messages else []
    formatted_history = []
    # formatamos tudo até a mensagem que acabamos de inserir para passar ao LLM
    for msg in history_msgs:
        # Pula a mensagem atual que acabamos de adicionar para que ela seja enviada no prompt separadamente
        if msg.role == "user" and msg.content == data.content:
            continue
        formatted_history.append({"role": msg.role, "content": msg.content})

    # 4. Cria gerador assíncrono para fazer o stream da resposta
    async def chat_stream_generator():
        ai_response_chunks = []
        done_metadata = {}

        try:
            # Chama o serviço de LLM
            async for chunk in LLMService.generate_response_stream(data.content, formatted_history, db):
                if chunk["type"] == "content":
                    ai_response_chunks.append(chunk["content"])
                    yield f"data: {json.dumps(chunk)}\n\n"
                    await asyncio.sleep(0.01) # Pequena pausa para garantir fluidez do stream
                elif chunk["type"] == "done":
                    done_metadata = chunk
                    yield f"data: {json.dumps(chunk)}\n\n"

            # 5. Salva a resposta completa do assistente no DB ao término do stream
            assistant_content = "".join(ai_response_chunks)
            if assistant_content:
                ChatController.add_message(
                    session_id=session_id,
                    role="assistant",
                    content=assistant_content,
                    db=db,
                    provider=done_metadata.get("provider"),
                    model_used=done_metadata.get("model_used"),
                    latency=done_metadata.get("latency"),
                    tokens_used=done_metadata.get("tokens_used")
                )
        except Exception as e:
            # Caso ocorra falha no loop do stream
            err_msg = f"Erro no stream do assistente: {str(e)}"
            yield f"data: {json.dumps({'type': 'content', 'content': err_msg})}\n\n"

    return StreamingResponse(chat_stream_generator(), media_type="text/event-stream")
