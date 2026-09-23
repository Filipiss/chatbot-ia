"""
Metadados e documentação técnica da API OpenAPI / Swagger.
"""

TAGS_METADATA = [
    {
        "name": "Chats",
        "description": "Endpoints para gestão de sessões conversacionais, histórico de mensagens e streaming em tempo real via Server-Sent Events (SSE).",
    },
    {
        "name": "Integrations",
        "description": "Endpoints para configuração de provedores de IA (Google Gemini, OpenAI, Groq e Ozlo), edição de system instructions e testes de conectividade.",
    },
    {
        "name": "Health",
        "description": "Verificação de disponibilidade e status dos serviços da API.",
    },
]

API_METADATA = {
    "title": "Integrador de IA e Chatbot Orgânico API",
    "description": (
        "Backend assíncrono para orquestração de múltiplos provedores de LLM, "
        "persistência relacional com SQLAlchemy e streaming token-a-token em tempo real via SSE."
    ),
    "version": "1.0.0",
    "openapi_tags": TAGS_METADATA,
    "contact": {
        "name": "Filipi Soares",
        "url": "https://github.com/filipidios",
    },
    "license_info": {
        "name": "MIT License",
        "url": "https://opensource.org/licenses/MIT",
    },
}
