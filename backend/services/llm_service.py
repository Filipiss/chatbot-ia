import os
import time
import json
import httpx
import asyncio
from typing import Optional, List, Dict, Any, AsyncGenerator
import google.generativeai as genai
from openai import OpenAI
from sqlalchemy.orm import Session
from models.integration import Integration
from repositories.integration_repository import IntegrationRepository
from utils.crypto import CryptoUtils
from utils.helpers import estimate_tokens, calculate_latency
from config.settings import settings

class LLMService:
    """Serviço de orquestração e streaming de múltiplos provedores de Large Language Models."""

    @staticmethod
    def get_active_integration(db: Session) -> Optional[Integration]:
        return IntegrationRepository.get_active(db)

    @classmethod
    async def generate_response_stream(
        cls, 
        prompt: str, 
        history: List[Dict[str, str]], 
        db: Session
    ) -> AsyncGenerator[Dict[str, Any], None]:
        """
        Gera uma resposta em stream a partir do provedor de IA atualmente ativo.
        Retorna dicionários contendo chunks de texto ou metadados de conclusão (tempo, tokens).
        """
        integration = cls.get_active_integration(db)
        if not integration:
            yield {"type": "content", "content": "Erro: Nenhum integrador de IA ativo. Vá em Configurações para ativar."}
            return

        start_time = time.time()
        provider = integration.provider.lower()
        model_name = integration.model_name
        system_instruction = integration.system_instruction or "Você é um assistente útil e simpático."

        # Obter chave real protegida (prioridade absoluta para variável de ambiente no servidor)
        raw_api_key = None
        if provider == "gemini":
            raw_api_key = settings.GEMINI_API_KEY
        elif provider == "openai":
            raw_api_key = settings.OPENAI_API_KEY

        # Se não houver variável de ambiente, busca no banco (descriptografando se necessário)
        if not raw_api_key or not raw_api_key.strip():
            db_key = integration.api_key
            if db_key and not CryptoUtils.is_masked(db_key):
                if CryptoUtils.is_encrypted(db_key):
                    raw_api_key = CryptoUtils.decrypt_key(db_key)
                else:
                    raw_api_key = db_key

        content_yielded = ""

        try:
            if provider == "ozlo":
                query = prompt.lower().strip()
                if "projeto" in query or "portfolio" in query or "portfólio" in query:
                    reply = (
                        "Este é o **Integrador de IA e Chatbot Orgânico**, um ecossistema completo de engenharia de software "
                        "desenvolvido para demonstrar habilidades avançadas em arquitetura Full Stack.\n\n"
                        "### ✦ Pilares Técnicos:\n"
                        "- **Frontend:** React 19, TypeScript, Tailwind CSS v4, Framer Motion e Atomic Design.\n"
                        "- **Backend:** FastAPI assíncrono, SQLAlchemy ORM, Uvicorn, arquitetura em camadas e SQLite/PostgreSQL.\n\n"
                        "Ele orquestra sessões de chat, métricas analíticas e integrações com **Google Gemini, OpenAI e Groq** sob um único contrato!"
                    )
                elif "tecnologia" in query or "stack" in query:
                    reply = (
                        "A stack tecnológica deste projeto foi arquitetada seguindo as melhores práticas de mercado:\n\n"
                        "1. **Frontend Moderno:** React 19 com compilação ultra-rápida via Vite. Uso do **Tailwind CSS v4** "
                        "e Atomic Design (`atoms`, `molecules`, `organisms`, `templates`, `pages`).\n"
                        "2. **Backend Concorrente:** **FastAPI** assíncrono em Python com suporte nativo a streaming via Server-Sent Events (SSE).\n"
                        "3. **Banco de Dados Relacional:** SQLAlchemy 2.0 com suporte a SQLite local e PostgreSQL em produção."
                    )
                elif "desenvolvedor" in query or "criador" in query or "quem é você" in query or "autor" in query:
                    reply = (
                        "Eu sou o **Ozlo**, o assistente inteligente residente desta plataforma!\n\n"
                        "Fui criado como parte do portfólio de engenharia de software de **Filipi Soares (@filipidios)**, "
                        "um *Designer-Minded Developer* focado em unir arquitetura robusta a uma experiência visual de padrão internacional."
                    )
                elif "ajuda" in query or "como funciona" in query:
                    reply = (
                        "Você pode utilizar esta plataforma para:\n\n"
                        "1. **Conversar em tempo real** com modelos de IA com streaming e telemetria.\n"
                        "2. **Configurar múltiplos provedores** (Google Gemini, OpenAI, Groq) na aba Configurações.\n"
                        "3. **Acompanhar métricas de execução** (latência e tokens) no painel de Estatísticas.\n"
                        "4. **Acessibilidade total:** use o dock flutuante no canto inferior para ajustar fontes, alto contraste e modo de leitura."
                    )
                else:
                    reply = (
                        f"Olá! Eu sou o assistente do simulador residente **Ozlo Orgânico**.\n\n"
                        f"Recebi sua mensagem: *\"{prompt}\"*.\n\n"
                        "Estou operando em modo de demonstração local offline, permitindo que você avalie o streaming "
                        "em tempo real e a telemetria sem necessidade de nenhuma chave externa de API!"
                    )

                # Simulação fluida de digitação humana em blocos de palavras
                words = reply.split(" ")
                for i, word in enumerate(words):
                    chunk = word + (" " if i < len(words) - 1 else "")
                    content_yielded += chunk
                    yield {"type": "content", "content": chunk}
                    await asyncio.sleep(0.02)

            elif provider == "gemini":
                if not raw_api_key or raw_api_key.strip() == "":
                    yield {
                        "type": "content", 
                        "content": "**[Aviso] Provedor Google Gemini Ativo, mas a API Key está ausente!**\n\nPor favor, acesse a aba **Configurações** no painel esquerdo, preencha sua API Key do Google AI Studio e clique em **Salvar** para habilitar o chat."
                    }
                    return
                
                genai.configure(api_key=raw_api_key.strip())
                model = genai.GenerativeModel(
                    model_name=model_name,
                    system_instruction=system_instruction
                )
                
                # Montar histórico no padrão do Gemini
                gemini_history = []
                for msg in history:
                    role = "user" if msg["role"] == "user" else "model"
                    gemini_history.append({"role": role, "parts": [msg["content"]]})
                
                chat = model.start_chat(history=gemini_history)
                response = chat.send_message(prompt, stream=True)
                
                for chunk in response:
                    try:
                        text = chunk.text
                        if text:
                            content_yielded += text
                            yield {"type": "content", "content": text}
                    except ValueError:
                        pass

            elif provider == "openai":
                if not raw_api_key or raw_api_key.strip() == "":
                    yield {
                        "type": "content", 
                        "content": "**[Aviso] Provedor OpenAI/Groq Ativo, mas a API Key está ausente!**\n\nPor favor, acesse a aba **Configurações** no painel esquerdo, preencha sua API Key da OpenAI ou Groq e clique em **Salvar** para habilitar o chat."
                    }
                    return

                client = OpenAI(
                    api_key=raw_api_key.strip(),
                    base_url=integration.api_url if (integration.api_url and integration.api_url.strip() != "") else None
                )
                
                messages = [{"role": "system", "content": system_instruction}]
                for msg in history:
                    messages.append({"role": msg["role"], "content": msg["content"]})
                messages.append({"role": "user", "content": prompt})

                response = client.chat.completions.create(
                    model=model_name,
                    messages=messages,
                    stream=True
                )

                for chunk in response:
                    delta = chunk.choices[0].delta if chunk.choices else None
                    if delta and delta.content:
                        content_yielded += delta.content
                        yield {"type": "content", "content": delta.content}

            else:
                yield {"type": "content", "content": f"Erro: Provedor '{provider}' desconhecido ou não implementado."}
                return

        except Exception as e:
            error_hint = str(e)
            yield {"type": "content", "content": f"Erro ao gerar resposta ({provider}): {error_hint}"}
            return

        latency = calculate_latency(start_time)
        tokens = estimate_tokens(prompt + content_yielded)

        # Enviar metadados de encerramento do stream
        yield {
            "type": "done",
            "provider": provider,
            "model_used": model_name,
            "latency": latency,
            "tokens_used": tokens
        }
