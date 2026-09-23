from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from config.database import get_db
from schemas.integration import IntegrationCreate, IntegrationUpdate, IntegrationResponse
from controllers.integration_controller import IntegrationController
from repositories.integration_repository import IntegrationRepository
from services.llm_service import LLMService

router = APIRouter(prefix="/api/integrations", tags=["Integrations"])

@router.get("", response_model=List[IntegrationResponse])
def get_all_integrations(db: Session = Depends(get_db)):
    """Retorna todos os provedores e modelos de IA cadastrados."""
    return IntegrationController.get_all(db)

@router.get("/{id}", response_model=IntegrationResponse)
def get_integration(id: int, db: Session = Depends(get_db)):
    """Retorna dados de configuração protegidos de um provedor específico."""
    db_obj = IntegrationController.get_by_id(id, db)
    if not db_obj:
        raise HTTPException(status_code=404, detail="Integração não encontrada.")
    return db_obj

@router.post("", response_model=IntegrationResponse, status_code=status.HTTP_201_CREATED)
def create_integration(data: IntegrationCreate, db: Session = Depends(get_db)):
    """Cadastra um novo modelo ou provedor."""
    return IntegrationController.create(data, db)

@router.put("/{id}", response_model=IntegrationResponse)
def update_integration(id: int, data: IntegrationUpdate, db: Session = Depends(get_db)):
    """Atualiza configurações de modelo, chave de API ou instrução de sistema."""
    db_obj = IntegrationController.update(id, data, db)
    if not db_obj:
        raise HTTPException(status_code=404, detail="Integração não encontrada.")
    return db_obj

@router.delete("/{id}")
def delete_integration(id: int, db: Session = Depends(get_db)):
    """Remove uma integração configurada."""
    success = IntegrationController.delete(id, db)
    if not success:
        raise HTTPException(status_code=404, detail="Integração não encontrada.")
    return {"message": "Integração removida com sucesso."}

@router.post("/{id}/test")
async def test_integration(id: int, db: Session = Depends(get_db)):
    """Testa se as configurações de conexão e chave da API funcionam ativamente."""
    db_obj = IntegrationController.get_db_model(id, db)
    if not db_obj:
        raise HTTPException(status_code=404, detail="Integração não encontrada.")

    # Salva o estado dos provedores ativos
    active_integrations = [item.id for item in IntegrationRepository.get_all(db) if item.is_active]

    try:
        # Ativa temporariamente este provedor no DB para o teste
        IntegrationRepository.deactivate_all(db)
        db_obj.is_active = True
        db.commit()

        # Executa uma chamada simples de diagnóstico
        test_history = []
        response_chunks = []

        async for chunk in LLMService.generate_response_stream("Olá, confirme a conexão em uma frase curta.", test_history, db):
            if chunk["type"] == "content":
                response_chunks.append(chunk["content"])
            elif chunk["type"] == "done":
                break

        response_text = "".join(response_chunks)
        if "Erro" in response_text or not response_text:
            return {"status": "error", "message": f"A resposta falhou ou retornou erro: {response_text}"}

        return {"status": "success", "message": f"Conexão bem-sucedida! Resposta recebida: {response_text.strip()}"}

    except Exception as e:
        return {"status": "error", "message": f"Erro inesperado no teste de conexão: {str(e)}"}

    finally:
        # Restaura o estado anterior dos provedores
        IntegrationRepository.deactivate_all(db)
        for original_id in active_integrations:
            orig = IntegrationRepository.get_by_id(original_id, db)
            if orig:
                orig.is_active = True
        db.commit()
