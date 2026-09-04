from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database.connection import get_db
from schemas.integration import IntegrationCreate, IntegrationUpdate, IntegrationResponse
from controllers.integration_controller import IntegrationController
from services.llm_service import LLMService
from typing import List

router = APIRouter(prefix="/api/integrations", tags=["Integrations"])

@router.get("", response_model=List[IntegrationResponse])
def get_all_integrations(db: Session = Depends(get_db)):
    return IntegrationController.get_all(db)

@router.get("/{id}", response_model=IntegrationResponse)
def get_integration(id: int, db: Session = Depends(get_db)):
    db_obj = IntegrationController.get_by_id(id, db)
    if not db_obj:
        raise HTTPException(status_code=404, detail="Integração não encontrada.")
    return db_obj

@router.post("", response_model=IntegrationResponse)
def create_integration(data: IntegrationCreate, db: Session = Depends(get_db)):
    return IntegrationController.create(data, db)

@router.put("/{id}", response_model=IntegrationResponse)
def update_integration(id: int, data: IntegrationUpdate, db: Session = Depends(get_db)):
    db_obj = IntegrationController.update(id, data, db)
    if not db_obj:
        raise HTTPException(status_code=404, detail="Integração não encontrada.")
    return db_obj

@router.delete("/{id}")
def delete_integration(id: int, db: Session = Depends(get_db)):
    success = IntegrationController.delete(id, db)
    if not success:
        raise HTTPException(status_code=404, detail="Integração não encontrada.")
    return {"message": "Integração removida com sucesso."}

@router.post("/{id}/test")
async def test_integration(id: int, db: Session = Depends(get_db)):
    """Testa se as configurações de conexão e chave da API funcionam."""
    db_obj = IntegrationController.get_db_model(id, db)
    if not db_obj:
        raise HTTPException(status_code=404, detail="Integração não encontrada.")
        
    # Salva o estado atual dos toggles
    active_integrations = [item.id for item in db.query(Integration).filter(Integration.is_active == True).all()]
    
    try:
        # Ativa temporariamente este provedor no DB para o teste
        db.query(Integration).update({Integration.is_active: False})
        db_obj.is_active = True
        db.commit()
        
        # Faz uma chamada simples para o provedor
        test_history = []
        response_chunks = []
        
        # Chama o gerador asíncrono
        async for chunk in LLMService.generate_response_stream("Olá, confirme a conexão em uma frase curta.", test_history, db):
            if chunk["type"] == "content":
                response_chunks.append(chunk["content"])
            elif chunk["type"] == "done":
                break
                
        response_text = "".join(response_chunks)
        if "Erro" in response_text or not response_text:
            return {"status": "error", "message": f"A resposta falhou ou retornou erro: {response_text}"}
            
        return {"status": "success", "message": "Conexão estabelecida com sucesso!", "sample": response_text[:100]}
    except Exception as e:
        return {"status": "error", "message": f"Erro de conexão: {str(e)}"}
    finally:
        # Restaura o estado anterior dos provedores
        db.query(Integration).update({Integration.is_active: False})
        if active_integrations:
            db.query(Integration).filter(Integration.id.in_(active_integrations)).update({Integration.is_active: True}, synchronize_session=False)
        db.commit()
