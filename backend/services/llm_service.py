import time
import json
import httpx
import asyncio
import google.generativeai as genai
from openai import OpenAI
from sqlalchemy.orm import Session
from models.integration import Integration
from typing import Optional, List, Dict, Any, Generator, AsyncGenerator

class LLMService:
    @staticmethod
    def get_active_integration(db: Session) -> Optional[Integration]:
        return db.query(Integration).filter(Integration.is_active == True).first()

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

        content_yielded = ""

        try:
            if provider == "ozlo":
                query = prompt.lower().strip()
                if "projeto" in query or "portfolio" in query or "portfólio" in query:
                    reply = (
                        "Este é o **Integrador de IA e Chatbot Orgânico**, um projeto completo de portfólio "
                        "desenvolvido para demonstrar habilidades em engenharia de software Full Stack.\n\n"
                        "### ✦ Tecnologias Utilizadas:\n"
                        "- **Frontend:** React 19, TypeScript, Tailwind CSS v4, Lucide Icons.\n"
                        "- **Backend:** FastAPI (Python), SQLAlchemy ORM, Uvicorn, SQLite/PostgreSQL.\n\n"
                        "Ele gerencia sessões de chat, métricas analíticas e integrações com **Google Gemini e OpenAI** de forma integrada!"
                    )
                elif "tecnologia" in query or "stack" in query:
                    reply = (
                        "A stack tecnológica deste projeto foi arquitetada seguindo as melhores práticas de mercado:\n\n"
                        "1. **Frontend Moderno:** React 19 com compilação ultra-rápida via Vite. Uso do recém-lançado **Tailwind CSS v4** "
                        "usando o padrão *CSS-First* com companheiros de estilização limpos.\n"
                        "2. **Backend Concorrente:** **FastAPI** em Python, que suporta streams assíncronos nativos para as respostas em tempo real "
                        "dos provedores de LLM.\n"
                        "3. **Banco de Dados Relacional:** SQLAlchemy com migrações automáticas entre SQLite (ambiente local) e PostgreSQL (produção)."
                    )
                elif "desenvolvedor" in query or "criador" in query or "quem é você" in query or "autor" in query:
                    reply = (
                        "Eu sou o **Ozlo**, o assistente inteligente residente desta plataforma!\n\n"
                        "Fui criado pelo autor deste portfólio para servir como um guia interativo das funcionalidades do sistema. "
                        "Você pode explorar as abas de **Integrações** (para ver as configurações de chaves de API) e **Analytics** (para ver os gráficos de consumo)."
                    )
                elif "metrica" in query or "métrica" in query or "analytics" in query or "gráfico" in query or "grafico" in query:
                    reply = (
                        "A aba **Analytics** exibe métricas reais calculadas a partir das conversas salvas no banco de dados SQLite/PostgreSQL.\n\n"
                        "✦ **O que você pode analisar lá:**\n"
                        "- Total de conversas e mensagens criadas.\n"
                        "- **Latência Média** de resposta dos modelos de inteligência artificial.\n"
                        "- **Estimador de Tokens** baseado no tamanho das requisições.\n"
                        "- Distribuição percentual de requisições por provedor ativo."
                    )
                elif "codigo" in query or "código" in query or "code" in query:
                    reply = (
                        "Claro! Veja um exemplo de código Python do nosso controller de banco de dados:\n\n"
                        "```python\n"
                        "# Exemplo de CRUD com SQLAlchemy\n"
                        "@staticmethod\n"
                        "def clear_session_messages(session_id: int, db: Session) -> bool:\n"
                        "    session = db.query(ChatSession).filter(ChatSession.id == session_id).first()\n"
                        "    if not session:\n"
                        "        return False\n"
                        "    db.query(ChatMessage).filter(ChatMessage.session_id == session_id).delete()\n"
                        "    db.commit()\n"
                        "    return True\n"
                        "```\n"
                        "Este código é o que apaga o histórico do chat de forma otimizada!"
                    )
                else:
                    reply = (
                        f"Olá! Sou o **Ozlo**, o assistente simulador do portfólio.\n\n"
                        f"Recebi sua mensagem: *\"{prompt}\"*\n\n"
                        "Como estou rodando no **Modo de Demonstração (Ozlo Simulador)**, não uso chaves de API externas! Isso permite que você "
                        "teste a interface livremente.\n\n"
                        "✦ **Perguntas sugeridas:**\n"
                        "- *Fale sobre o projeto*\n"
                        "- *Qual a stack utilizada?*\n"
                        "- *Como funcionam os gráficos?*\n"
                        "- *Mostre um exemplo de código*\n\n"
                        "Caso queira testar com modelos reais (como **Gemini 3.5 Flash** ou **OpenAI GPT-4o-mini**), basta ir em **Configurações**, "
                        "inserir sua API Key e ativar o respectivo provedor!"
                    )

                chunk_size = 8
                for idx in range(0, len(reply), chunk_size):
                    chunk = reply[idx:idx+chunk_size]
                    content_yielded += chunk
                    yield {"type": "content", "content": chunk}
                    await asyncio.sleep(0.02)

            elif provider == "gemini":
                if not integration.api_key or integration.api_key.strip() == "":
                    yield {"type": "content", "content": "**[Aviso] Provedor Google Gemini Ativo, mas a API Key está ausente!**\n\nPor favor, acesse a aba **Configurações** no painel esquerdo, preencha sua API Key do Gemini e clique em **Salvar** para habilitar o chat orgânico."}
                    return
                # Configurar Gemini
                genai.configure(api_key=integration.api_key)
                # O SDK do Gemini recebe system_instruction na inicialização
                model = genai.GenerativeModel(
                    model_name=model_name,
                    system_instruction=system_instruction
                )
                
                # Formatar histórico para o Gemini
                # Gemini usa: [{'role': 'user', 'parts': [...]}, {'role': 'model', 'parts': [...]}]
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
                if not integration.api_key or integration.api_key.strip() == "":
                    yield {"type": "content", "content": "**[Aviso] Provedor OpenAI Ativo, mas a API Key está ausente!**\n\nPor favor, acesse a aba **Configurações** no painel esquerdo, preencha sua API Key da OpenAI e clique em **Salvar** para habilitar o chat orgânico."}
                    return
                # Configurar OpenAI (permite trocar a URL para Groq, DeepSeek, OpenRouter, etc.)
                client = OpenAI(
                    api_key=integration.api_key,
                    base_url=integration.api_url if (integration.api_url and integration.api_url.strip() != "") else None
                )
                
                # Formatar mensagens
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

        end_time = time.time()
        latency = end_time - start_time
        
        # Calcular tokens estimados
        estimated_tokens = len(prompt + content_yielded) // 4

        # Enviar metadados de encerramento do stream
        yield {
            "type": "done",
            "provider": provider,
            "model_used": model_name,
            "latency": round(latency, 2),
            "tokens_used": estimated_tokens
        }
