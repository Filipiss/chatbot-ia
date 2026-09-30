import time
from typing import Dict, Any

def estimate_tokens(text: str) -> int:
    if not text:
        return 0
    return max(1, len(text) // 4)

def calculate_latency(start_time: float) -> float:
    return round(time.time() - start_time, 2)

def build_sse_chunk(chunk_type: str, data: Dict[str, Any]) -> Dict[str, Any]:
    return {"type": chunk_type, **data}
