import time
from typing import Dict, Any

def estimate_tokens(text: str) -> int:
    """Calcula estimativa aproximada de tokens para LLMs (regra empírica de 4 caracteres/token)."""
    if not text:
        return 0
    return max(1, len(text) // 4)

def calculate_latency(start_time: float) -> float:
    """Calcula a latência em segundos com duas casas decimais."""
    return round(time.time() - start_time, 2)

def build_sse_chunk(chunk_type: str, data: Dict[str, Any]) -> Dict[str, Any]:
    """Padroniza formato de eventos do Server-Sent Events."""
    return {"type": chunk_type, **data}
