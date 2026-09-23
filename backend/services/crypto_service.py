"""
Módulo de compatibilidade: reexporta CryptoUtils da nova camada utils.crypto.
"""
from utils.crypto import CryptoUtils as CryptoService

__all__ = ["CryptoService"]
