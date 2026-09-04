import os
import base64
import hashlib
from typing import Optional
from cryptography.fernet import Fernet, InvalidToken

class CryptoService:
    _fernet: Optional[Fernet] = None

    @classmethod
    def _get_fernet(cls) -> Fernet:
        if cls._fernet is None:
            # Pega a chave secreta do ambiente ou usa um fallback persistente
            secret = os.getenv("SECRET_KEY", "antigravity-chatbot-integrator-secret-key-2026")
            # Deriva uma chave de 32 bytes compatível com Fernet (URL-safe base64-encoded)
            derived_key = base64.urlsafe_b64encode(hashlib.sha256(secret.encode("utf-8")).digest())
            cls._fernet = Fernet(derived_key)
        return cls._fernet

    @classmethod
    def is_encrypted(cls, key_str: Optional[str]) -> bool:
        """Verifica se a string já é uma chave criptografada."""
        if not key_str or not isinstance(key_str, str):
            return False
        return key_str.startswith("enc_v1$")

    @classmethod
    def encrypt_key(cls, plain_key: Optional[str]) -> Optional[str]:
        """Criptografa a chave da API para retorno seguro ao cliente."""
        if not plain_key or not plain_key.strip():
            return None
        plain = plain_key.strip()
        if cls.is_encrypted(plain):
            return plain
        f = cls._get_fernet()
        token = f.encrypt(plain.encode("utf-8")).decode("utf-8")
        return f"enc_v1${token}"

    @classmethod
    def decrypt_key(cls, encrypted_key: Optional[str]) -> Optional[str]:
        """Decodifica a chave criptografada de volta para o texto original."""
        if not encrypted_key or not encrypted_key.strip():
            return None
        val = encrypted_key.strip()
        if not cls.is_encrypted(val):
            return val
        token = val[len("enc_v1$"):]
        try:
            f = cls._get_fernet()
            decrypted = f.decrypt(token.encode("utf-8")).decode("utf-8")
            return decrypted
        except (InvalidToken, Exception):
            return val

    MASK_STRING = "************************"

    @classmethod
    def is_masked(cls, key_str: Optional[str]) -> bool:
        """Verifica se a string é uma máscara visual de proteção enviada pelo cliente."""
        if not key_str or not isinstance(key_str, str):
            return False
        clean = key_str.strip()
        if not clean:
            return False
        return set(clean).issubset({"*", "•"}) or clean == cls.MASK_STRING

    @classmethod
    def mask_for_client(cls, raw_key: Optional[str]) -> str:
        """
        Retorna estritamente uma máscara opaca de asteriscos.
        NUNCA envia a chave real nem tokens decifráveis para o cliente/navegador.
        """
        if not raw_key or not raw_key.strip():
            return ""
        return cls.MASK_STRING
