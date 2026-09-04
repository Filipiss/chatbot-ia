import os
from sqlalchemy.orm import Session
from models.integration import Integration
from schemas.integration import IntegrationCreate, IntegrationUpdate, IntegrationResponse
from services.crypto_service import CryptoService
from typing import List, Optional

class IntegrationController:
    @staticmethod
    def to_response(db_obj: Integration) -> IntegrationResponse:
        """Converte o objeto do banco para a resposta 100% protegida para o cliente."""
        provider = (db_obj.provider or "").lower()

        # Verifica se o servidor possui chave de ambiente configurada
        env_key = None
        if provider == "gemini":
            env_key = os.getenv("GEMINI_API_KEY")
        elif provider == "openai":
            env_key = os.getenv("OPENAI_API_KEY")

        has_server_env = bool(env_key and env_key.strip())
        has_db_key = bool(db_obj.api_key and db_obj.api_key.strip() and not CryptoService.is_masked(db_obj.api_key))
        has_key = has_server_env or has_db_key or provider == "ozlo"

        # NUNCA envia a chave real nem token decifrável para o cliente/navegador! Retorna asteriscos opacos
        masked_key = CryptoService.MASK_STRING if (has_key and provider != "ozlo") else ""

        return IntegrationResponse(
            id=db_obj.id,
            provider=db_obj.provider,
            name=db_obj.name,
            model_name=db_obj.model_name,
            api_key=masked_key,
            has_api_key=has_key,
            is_server_managed=has_server_env,
            api_url=db_obj.api_url,
            is_active=db_obj.is_active,
            system_instruction=db_obj.system_instruction,
            created_at=db_obj.created_at,
            updated_at=db_obj.updated_at,
        )

    @staticmethod
    def get_all(db: Session) -> List[IntegrationResponse]:
        items = db.query(Integration).order_by(Integration.id.asc()).all()
        return [IntegrationController.to_response(item) for item in items]

    @staticmethod
    def get_by_id(integration_id: int, db: Session) -> Optional[IntegrationResponse]:
        db_obj = db.query(Integration).filter(Integration.id == integration_id).first()
        if not db_obj:
            return None
        return IntegrationController.to_response(db_obj)

    @staticmethod
    def get_db_model(integration_id: int, db: Session) -> Optional[Integration]:
        """Retorna o modelo SQLAlchemy direto com a chave real para operações internas do backend."""
        return db.query(Integration).filter(Integration.id == integration_id).first()

    @staticmethod
    def create(data: IntegrationCreate, db: Session) -> IntegrationResponse:
        create_data = data.model_dump()
        if create_data.get("api_key"):
            key_val = str(create_data["api_key"]).strip()
            if CryptoService.is_masked(key_val):
                create_data["api_key"] = ""
            elif not CryptoService.is_encrypted(key_val):
                create_data["api_key"] = CryptoService.encrypt_key(key_val)

        db_obj = Integration(**create_data)
        if db_obj.is_active:
            db.query(Integration).update({Integration.is_active: False})
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return IntegrationController.to_response(db_obj)

    @staticmethod
    def update(integration_id: int, data: IntegrationUpdate, db: Session) -> Optional[IntegrationResponse]:
        db_obj = db.query(Integration).filter(Integration.id == integration_id).first()
        if not db_obj:
            return None
        
        update_data = data.model_dump(exclude_unset=True)
        
        # Proteção da API Key: se for a máscara de asteriscos, token criptografado ou vazio, NUNCA altera a chave real!
        if "api_key" in update_data:
            incoming_key = update_data["api_key"]
            if (
                incoming_key is None
                or not str(incoming_key).strip()
                or CryptoService.is_masked(incoming_key)
                or CryptoService.is_encrypted(incoming_key)
            ):
                del update_data["api_key"]
            else:
                # Se o usuário explicitamente forneceu uma nova chave no frontend, criptografa para o banco
                clean_key = str(incoming_key).strip()
                update_data["api_key"] = CryptoService.encrypt_key(clean_key)

        if update_data.get("is_active") is True:
            # Desativa todos os outros para garantir apenas um ativo
            db.query(Integration).filter(Integration.id != integration_id).update({Integration.is_active: False})

        for key, val in update_data.items():
            setattr(db_obj, key, val)
        
        db.commit()
        db.refresh(db_obj)
        return IntegrationController.to_response(db_obj)

    @staticmethod
    def delete(integration_id: int, db: Session) -> bool:
        db_obj = db.query(Integration).filter(Integration.id == integration_id).first()
        if not db_obj:
            return False
        db.delete(db_obj)
        db.commit()
        return True
