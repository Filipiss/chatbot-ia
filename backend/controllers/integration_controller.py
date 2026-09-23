import os
from typing import List, Optional
from sqlalchemy.orm import Session
from models.integration import Integration
from schemas.integration import IntegrationCreate, IntegrationUpdate, IntegrationResponse
from repositories.integration_repository import IntegrationRepository
from utils.crypto import CryptoUtils
from config.settings import settings

class IntegrationController:
    """Controlador de regras de negócio para provedores de Inteligência Artificial."""

    @staticmethod
    def to_response(db_obj: Integration) -> IntegrationResponse:
        """Converte o objeto do banco para a resposta protegida para o cliente."""
        provider = (db_obj.provider or "").lower()

        # Verifica se o servidor possui chave de ambiente configurada
        env_key = None
        if provider == "gemini":
            env_key = settings.GEMINI_API_KEY
        elif provider == "openai":
            env_key = settings.OPENAI_API_KEY

        has_server_env = bool(env_key and env_key.strip())
        has_db_key = bool(db_obj.api_key and db_obj.api_key.strip() and not CryptoUtils.is_masked(db_obj.api_key))
        has_key = has_server_env or has_db_key or provider == "ozlo"

        # NUNCA envia a chave real nem token decifrável para o cliente/navegador
        masked_key = CryptoUtils.MASK_STRING if (has_key and provider != "ozlo") else ""

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
        items = IntegrationRepository.get_all(db)
        return [IntegrationController.to_response(item) for item in items]

    @staticmethod
    def get_by_id(integration_id: int, db: Session) -> Optional[IntegrationResponse]:
        db_obj = IntegrationRepository.get_by_id(integration_id, db)
        if not db_obj:
            return None
        return IntegrationController.to_response(db_obj)

    @staticmethod
    def get_db_model(integration_id: int, db: Session) -> Optional[Integration]:
        """Retorna o modelo SQLAlchemy direto com a chave real para operações internas do backend."""
        return IntegrationRepository.get_by_id(integration_id, db)

    @staticmethod
    def create(data: IntegrationCreate, db: Session) -> IntegrationResponse:
        create_data = data.model_dump()
        if create_data.get("api_key"):
            key_val = str(create_data["api_key"]).strip()
            if CryptoUtils.is_masked(key_val):
                create_data["api_key"] = ""
            elif not CryptoUtils.is_encrypted(key_val):
                create_data["api_key"] = CryptoUtils.encrypt_key(key_val)

        if create_data.get("is_active"):
            IntegrationRepository.deactivate_all(db)

        db_obj = IntegrationRepository.create(create_data, db)
        return IntegrationController.to_response(db_obj)

    @staticmethod
    def update(integration_id: int, data: IntegrationUpdate, db: Session) -> Optional[IntegrationResponse]:
        db_obj = IntegrationRepository.get_by_id(integration_id, db)
        if not db_obj:
            return None

        update_data = data.model_dump(exclude_unset=True)

        # Proteção da API Key: se for máscara ou vazio, não altera a chave existente
        if "api_key" in update_data:
            incoming_key = update_data["api_key"]
            if (
                incoming_key is None
                or not str(incoming_key).strip()
                or CryptoUtils.is_masked(incoming_key)
                or CryptoUtils.is_encrypted(incoming_key)
            ):
                del update_data["api_key"]
            else:
                clean_key = str(incoming_key).strip()
                update_data["api_key"] = CryptoUtils.encrypt_key(clean_key)

        if update_data.get("is_active") is True:
            IntegrationRepository.deactivate_all(db, exclude_id=integration_id)

        updated_obj = IntegrationRepository.update(db_obj, update_data, db)
        return IntegrationController.to_response(updated_obj)

    @staticmethod
    def delete(integration_id: int, db: Session) -> bool:
        db_obj = IntegrationRepository.get_by_id(integration_id, db)
        if not db_obj:
            return False
        IntegrationRepository.delete(db_obj, db)
        return True
