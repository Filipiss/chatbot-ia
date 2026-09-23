# Integrador de IA & Chatbot Orgânico

> Plataforma full stack para orquestração, benchmark e telemetria de múltiplos provedores de LLM em tempo real, com streaming via Server-Sent Events (SSE), arquitetura atômica e acessibilidade inclusiva.

[![React 19](https://img.shields.io/badge/Frontend-React%2019%20%7C%20TypeScript-blue?style=flat-square&logo=react)](https://react.dev)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI%20%7C%20Python%203.11+-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com)
[![Tailwind CSS v4](https://img.shields.io/badge/Styling-Tailwind%20CSS%20v4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com)
[![SSE Streaming](https://img.shields.io/badge/Realtime-Server--Sent%20Events-orange?style=flat-square)](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)
[![WCAG 2.1 AA](https://img.shields.io/badge/Accessibility-WCAG%202.1%20AA-success?style=flat-square)](https://www.w3.org/WAI/standards-guidelines/wcag/)
[![License MIT](https://img.shields.io/badge/License-MIT-gray?style=flat-square)](LICENSE)

**Idioma / Language:** **Português (Atual)** | [English Version](README_EN.md)

---

## Sumário Executivo

1. [Visão Geral & Proposta de Valor](#visão-geral--proposta-de-valor)
2. [Por Que Este Projeto é Relevante?](#por-que-este-projeto-é-relevante)
3. [Decisões de Engenharia & Arquitetura](#decisões-de-engenharia--arquitetura)
4. [Diagrama de Arquitetura](#diagrama-de-arquitetura)
5. [Recursos & Usabilidade do Produto](#recursos--usabilidade-do-produto)
6. [Stack Tecnológica & Justificativas](#stack-tecnológica--justificativas)
7. [Como Executar o Projeto (Guia Rápido)](#como-executar-o-projeto-guia-rápido)
8. [Variáveis de Ambiente](#variáveis-de-ambiente)
9. [Especificação de Endpoints da API](#especificação-de-endpoints-da-api)
10. [Estrutura do Repositório](#estrutura-do-repositório)
11. [Acessibilidade (WCAG 2.1 AA) & Design System](#acessibilidade-wcag-21-aa--design-system)
12. [Sobre o Autor](#sobre-o-autor)

---

## Visão Geral & Proposta de Valor

O **Integrador de IA & Chatbot Orgânico** é um ecossistema de software concebido para resolver o problema de **fragmentação e dependência de fornecedores (*vendor lock-in*)** na integração de modelos generativos de linguagem (LLMs).

A plataforma centraliza em uma única interface reativa a gestão e o uso de provedores heterogêneos de IA:
- **Google Gemini**: modelos de última geração (`gemini-3.6-flash`);
- **OpenAI / Groq / OpenRouter**: integração nativa via especificação OpenAI para modelos proprietários e endpoints de inferência em alta velocidade (Llama 3, Groq Compound);
- **Ozlo Orgânico (Simulador Residente)**: motor de simulação inteligente e offline que emula streaming real de tokens e telemetria, **permitindo a qualquer recrutador ou desenvolvedor testar a aplicação em 60 segundos sem depender de nenhuma chave de API ou custo de cartão de crédito**.

---

## Por Que Este Projeto é Relevante?

Ao avaliar este repositório como portfólio de engenharia de software, destacam-se quatro desafios práticos solucionados:

### 1. Eliminação do Vendor Lock-in
Cada ecossistema de IA possui SDKs proprietários, esquemas de payload e contratos próprios. Este projeto implementa uma **camada de abstração de serviços** no backend que normaliza parâmetros de entrada, formatação de saída e eventos de streaming, tornando a substituição ou adição de novos provedores uma tarefa trivial e sem impacto no frontend.

### 2. Redução Drástica da Latência Percebida via SSE
Em chamadas REST síncronas convencionais, o usuário aguarda o modelo gerar uma resposta completa (muitas vezes 5 a 10 segundos) com a tela travada. Aqui, a entrega é contínua e assíncrona token a token usando **Server-Sent Events (SSE)** sobre HTTP puro, sem a sobrecarga de estado ou complexidade desnecessária de WebSockets bidirecionais para um fluxo unidirecional.

### 3. Foco em Demonstração Imediata (Zero Friction)
Para testes de recrutamento, exigir credenciais pagas de APIs de terceiros inviabiliza testes reais por avaliadores. O modo nativo **Ozlo** roda um simulador determinístico assíncrono que replica o comportamento real do streaming, telemetria de latência e consumo de tokens instantaneamente ao rodar o projeto.

### 4. Engenharia Acessível como Requisito de Produto (WCAG 2.1 AA)
A maior parte dos dashboards de IA negligencia pessoas com deficiência visual ou dislexia. O projeto inclui um dock de acessibilidade flutuante com ajuste de escala tipográfica, modo de leitura facilitada, alto contraste calibrado e respeito a *prefers-reduced-motion*.

---

## Decisões de Engenharia & Arquitetura

| Decisão | Alternativa Rejeitada | Motivo da Escolha |
| :--- | :--- | :--- |
| **Server-Sent Events (SSE)** | WebSockets / HTTP Polling | O fluxo de streaming de IA é essencialmente unidirecional (servidor para cliente). SSE roda sobre HTTP padrão, reaproveita conexões, lida nativamente com reconexão e não exige o overhead de manter sockets bidirecionais no servidor. |
| **FastAPI + Asyncio** | Django / Flask tradicional | O I/O de chamadas de LLM é bloqueante por natureza em frameworks síncronos. FastAPI permite geradores assíncronos (`StreamingResponse`) que liberam a thread do pool enquanto os tokens são aguardados da API de IA. |
| **Pydantic v2** | Validação manual / Schemas ad-hoc | Validação ultra-rápida em Rust, contratos tipados rigorosamente e geração automática de documentação OpenAPI/Swagger 100% fiel ao código. |
| **Atomic Design no React 19** | Componentes monolíticos em pasta única | Separação explícita em átomos, moléculas, organismos, templates e páginas. Promove reuso de código, isolamento visual e testabilidade unitária. |
| **SQLAlchemy 2.0 ORM** | Consultas raw SQL sem tipagem | Mapeamento relacional seguro com suporte nativo a SQLite em ambiente local de desenvolvimento e migração sem atrito para PostgreSQL em produção. |

---

## Diagrama de Arquitetura

```mermaid
graph TD
    subgraph Client ["Frontend (React 19 + TypeScript + Vite)"]
        UI["Atomic Design System & Dock de Acessibilidade"]
        Contexts["Contextos de Estado (Theme, I18n, Accessibility)"]
        SSEConsumer["Consumidor de Streaming SSE (ReadableStream)"]
    end

    subgraph Server ["Backend (FastAPI + Python 3.11 Assíncrono)"]
        Endpoints["Rotas REST e Handlers de Eventos (/chats, /integrations)"]
        Controller["Controladores de Negócio & Orquestração"]
        Adapters["Camada de Adaptadores de LLMs"]
        DataLayer["SQLAlchemy ORM + Validações Pydantic v2"]
    end

    subgraph Providers ["Provedores de Inteligência Artificial"]
        Gemini["Google Gemini (google-generativeai SDK)"]
        OpenAI["OpenAI / Groq / OpenRouter (openai SDK)"]
        Ozlo["Ozlo Orgânico (Simulador Residente Offline)"]
    end

    subgraph Storage ["Persistência de Dados"]
        DB[(SQLite Local / PostgreSQL Nuvem)]
    end

    UI --> Contexts
    Contexts --> SSEConsumer
    SSEConsumer <-->|HTTP REST & EventStream SSE| Endpoints
    Endpoints --> Controller
    Controller --> Adapters
    Controller --> DataLayer
    Adapters --> Gemini
    Adapters --> OpenAI
    Adapters --> Ozlo
    DataLayer <--> DB
```

---

## Recursos & Usabilidade do Produto

### 1. Chat Playground em Tempo Real
- Streaming de tokens em tempo real com indicador visual de resposta.
- Renderização nativa de Markdown com destaque de sintaxe em blocos de código e botão de cópia com 1 clique.
- Telemetria por balão de mensagem: modelo executor, latência exata da resposta e tokens aproximados.
- Gestão completa de conversas: criar nova sessão, renomear, limpar mensagens e exclusão com modal de confirmação irreversível.
- **Exportação para Markdown**: Gera um arquivo `.md` estruturado com data, metadados da sessão e histórico completo das mensagens.

### 2. Central de Provedores de IA
- Ativação ou desativação de provedores com um clique.
- Edição de *system instructions* (instruções de sistema) individualmente por modelo, permitindo calibrar o tom, idioma e comportamento da IA.
- Teste de diagnóstico de conexão ativo em 1 clique (testa credenciais e latência da rota externa).

### 3. Dashboard Analítico Executivo
- Métricas consolidadas: volume de sessões criadas, total de mensagens trocadas, latência média global de resposta e consumo estimado de tokens.
- Gráfico interativo com percentual de distribuição de uso por provedor.

### 4. Internacionalização Dinâmica (i18n)
- Suporte nativo e instantâneo a **Português (`pt`)**, **English (`en`)** e **Español (`es`)** com persistência em contexto e sem recarregar a aplicação.

### 5. Floating Dock de Acessibilidade
- Escalonamento da tipografia: Padrão (100%), Grande (115%) e Extra Grande (130%).
- Alternância de temas: **Studio Noir (Escuro)**, **Claro** e **Alto Contraste**.
- Modo Leitura Facilitada (tipografia com espaçamento calibrado).
- Redução de Animações (*prefers-reduced-motion*).

---

## Stack Tecnológica & Justificativas

### Backend
- **Python 3.11+**: Ecossistema de referência para computação e IA, com suporte maduro a tipos estáticos e assincronia.
- **FastAPI 0.111.0**: Framework web moderno com validação automática, suporte a OpenAPI e altíssima taxa de requisições por segundo.
- **Uvicorn 0.30.1**: Servidor ASGI leve e otimizado para produção.
- **SQLAlchemy 2.0.30**: Abstração relacional robusta compatível com SQLite (local) e PostgreSQL (deploy).
- **Pydantic 2.7.4**: Core de validação reescrito em Rust para desempenho máximo.
- **Google Generative AI SDK 0.7.2**: SDK oficial para orquestração de modelos Gemini.
- **OpenAI Python SDK 1.35.10**: SDK oficial para chamadas padronizadas a OpenAI, Groq Cloud e OpenRouter.
- **HTTPX 0.27.0**: Cliente assíncrono para testes de conectividade e integração de endpoints customizados.
- **Psycopg2-binary 2.9.9**: Driver para PostgreSQL em ambientes de nuvem.

### Frontend
- **React 19**: Versão mais recente do framework, aproveitando melhorias de concorrência e renderização otimizada.
- **TypeScript 6.x**: Tipagem estrita de ponta a ponta, reduzindo bugs em tempo de compilação.
- **Vite 8**: Build tool e dev server ultra-rápido com Hot Module Replacement (HMR).
- **Tailwind CSS v4**: Estilização moderna através de utility classes compiladas sob demanda.
- **Framer Motion 13.x**: Animações fluidas e microinterações táteis nos cards e modais.
- **Lucide React**: Conjunto visual consistente de ícones vetoriais.
- **Oxlint**: Ferramenta de linting de alta velocidade para padronização de código.

---

## Como Executar o Projeto (Guia Rápido)

### Pré-requisitos
- **Python 3.10+** instalado
- **Node.js 18+** instalado
- **Git** instalado

---

### Passo 1: Clonar o Repositório

```bash
git clone https://github.com/Filipiss/chatbot-ia.git
cd chatbot-ia
```

---

### Passo 2: Inicializar o Backend

Abra um terminal no diretório raiz do projeto:

```bash
# 1. Acessar a pasta do backend
cd backend

# 2. Criar o ambiente virtual Python
python -m venv venv

# 3. Ativar o ambiente virtual
# No Windows:
.\venv\Scripts\activate
# No Linux ou macOS:
source venv/bin/activate

# 4. Instalar as dependências do projeto
pip install -r requirements.txt

# 5. Iniciar o servidor FastAPI
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

O servidor estará ativo em `http://127.0.0.1:8000`.  
A documentação interativa gerada automaticamente estará disponível em:
- Swagger UI: `http://127.0.0.1:8000/docs`
- ReDoc: `http://127.0.0.1:8000/redoc`

---

### Passo 3: Inicializar o Frontend

Abra um **segundo terminal**, vá para a raiz do repositório e execute:

```bash
# 1. Acessar a pasta do frontend
cd frontend

# 2. Instalar as dependências Node.js
npm install

# 3. Iniciar o servidor de desenvolvimento
npm run dev
```

Acesse no seu navegador: `http://127.0.0.1:5173`.

> **Nota para Testes Imediatos:**  
> O modelo **Ozlo Orgânico** já vem ativado por padrão com respostas simuladas e métricas ativas. Você pode começar a conversar imediatamente sem fornecer nenhuma credencial externa.

---

## Variáveis de Ambiente

O arquivo `.env` no backend é **estritamente opcional**. Caso deseje conectar suas próprias chaves de API pagas, crie o arquivo `backend/.env` baseado no modelo abaixo:

```env
# Conexão com banco de dados (se omitido, usa SQLite local automaticamente)
# DATABASE_URL=postgresql://usuario:senha@localhost:5432/meubanco

# Chaves de API para provedores externos (opcionais)
GEMINI_API_KEY=sua_chave_aqui
OPENAI_API_KEY=sua_chave_aqui
GROQ_API_KEY=sua_chave_aqui

# URLs permitidas para requisições CORS
FRONTEND_URL=http://localhost:5173,http://127.0.0.1:5173
```

---

## Especificação de Endpoints da API

| Método | Endpoint | Descrição | Formato de Retorno |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Health check da API | JSON |
| `GET` | `/docs` | Documentação interativa Swagger | HTML / OpenAPI |
| `GET` | `/integrations` | Lista provedores configurados | JSON Array |
| `PUT` | `/integrations/{id}` | Atualiza modelo, chave ou system prompt | JSON Object |
| `POST` | `/integrations/{id}/test` | Diagnóstico de conexão do provedor | JSON Object |
| `GET` | `/chats` | Lista sessões de conversa ativas | JSON Array |
| `POST` | `/chats` | Inicializa uma nova conversa | JSON Object |
| `GET` | `/chats/{chat_id}` | Obtém mensagens e metadados de uma sessão | JSON Object |
| `POST` | `/chats/{chat_id}/messages` | Envio de mensagem com streaming em tempo real | **text/event-stream (SSE)** |
| `DELETE` | `/chats/{chat_id}` | Exclui conversa e histórico associado | JSON Object |
| `POST` | `/chats/{chat_id}/clear` | Limpa mensagens mantendo a conversa | JSON Object |

---

## Estrutura do Repositório

```text
├── backend/
│   ├── config/           # Configurações globais (settings) e conexão SQLAlchemy (database)
│   │   ├── database.py
│   │   └── settings.py
│   ├── controllers/      # Regras de negócio desacopladas do banco
│   │   ├── chat_controller.py
│   │   └── integration_controller.py
│   ├── docs/             # Metadados OpenAPI, Swagger tags e documentação técnica
│   │   └── openapi.py
│   ├── models/           # Entidades relacionais do banco (ChatSession, ChatMessage, Integration)
│   │   ├── chat.py
│   │   └── integration.py
│   ├── repositories/     # Padrão Repository (Data Access Objects / CRUD isolado)
│   │   ├── chat_repository.py
│   │   └── integration_repository.py
│   ├── routes/           # Rotas REST e streaming SSE do FastAPI
│   │   ├── chat.py
│   │   └── integration.py
│   ├── schemas/          # Schemas Pydantic v2 para validação e serialização de dados
│   │   ├── chat.py
│   │   └── integration.py
│   ├── services/         # Orquestração de LLMs e adaptadores de IA
│   │   └── llm_service.py
│   ├── utils/            # Utilitários de segurança (CryptoUtils Fernet/SHA256) e helpers
│   │   ├── crypto.py
│   │   └── helpers.py
│   ├── main.py           # Ponto de entrada FastAPI, CORS e seed automático
│   └── requirements.txt  # Lista de dependências Python rigorosamente declaradas
│
├── frontend/
│   ├── src/
│   │   ├── api.ts        # Clientes HTTP e leitor de fluxo streaming SSE
│   │   ├── components/   # Arquitetura Atômica
│   │   │   ├── atoms/        # Componentes base (botões, inputs, badges)
│   │   │   ├── molecules/    # Agrupamentos funcionais (chips, seletores, cards)
│   │   │   ├── organisms/    # Módulos complexos (ChatWindow, ProvidersHub, Analytics)
│   │   │   ├── templates/    # Estruturas de layout e esqueletos de página
│   │   │   └── pages/        # Visões de tela
│   │   ├── context/      # Gerenciamento de estado (Theme, Accessibility, I18n)
│   │   ├── i18n/         # Dicionários de tradução (Português, Inglês, Espanhol)
│   │   │   └── translations.ts
│   │   ├── index.css     # Design system Studio Noir e diretivas Tailwind v4
│   │   └── main.tsx      # Ponto de montagem da árvore React
│   ├── package.json      # Dependências e scripts Node.js
│   └── vite.config.ts    # Configuração de build do Vite
│
├── Procfile              # Descritor de execução para ambientes PaaS (Heroku/Render)
├── render.yaml           # Configuração de deploy contínuo em nuvem
├── README.md             # Documentação principal em Português
└── README_EN.md          # Documentação completa em Inglês
```

---

## Acessibilidade (WCAG 2.1 AA) & Design System

O projeto adota o design system autoral **Studio Noir**, aliando elegância estética com rigor em acessibilidade:

- **Tokens Cromáticos Calibrados**:
  - Fundo principal: `#090C10` (Dark Canvas)
  - Superfícies de elevação: `#111620` e `#161D2A`
  - Bordas estruturais nítidas: `#1E2633` (1px fino)
  - Cores semânticas de acento: Electric Cobalt (`#3B82F6`) e Emerald de Status (`#10B981`)
- **Acessibilidade Universal**:
  - Suporte a navegação por teclado e semântica de elementos interativos.
  - Modo de alto contraste para conformidade com taxas mínimas de contraste exigidas pela norma WCAG 2.1 AA.
  - Modo de leitura para redução de fadiga cognitiva.
  - Escala dinâmica de tipografia sem quebra de containers ou overflow indesejado.

---

## Sobre o Autor

**Filipi Soares**  
*Designer-Minded Developer | Full Stack & Creative Engineering*

Engenheiro de software full stack focado na convergência entre **arquitetura de sistemas robusta** e **direção de arte digital refinada**. Experiência sólida na construção de interfaces reativas, consumo de modelos generativos de IA e arquitetura distribuída.

- **LinkedIn:** [linkedin.com/in/filipiss](https://www.linkedin.com/in/filipiss/)
- **GitHub:** [@Filipiss](https://github.com/Filipiss)
- **Repositório do Projeto:** [github.com/Filipiss/chatbot-ia](https://github.com/Filipiss/chatbot-ia)