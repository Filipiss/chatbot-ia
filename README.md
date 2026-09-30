# Integrador de IA & Chatbot Orgânico

> Plataforma full stack para orquestração, benchmark e telemetria de múltiplos provedores de LLM em tempo real, com streaming via Server-Sent Events (SSE), arquitetura atômica com metodologia BEMIT, segurança criptográfica zero-leakage e acessibilidade inclusiva.

[![React 19](https://img.shields.io/badge/Frontend-React%2019%20%7C%20TypeScript-blue?style=flat-square&logo=react)](https://react.dev)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI%20%7C%20Python%203.11+-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com)
[![Tailwind CSS v4](https://img.shields.io/badge/Styling-Tailwind%20CSS%20v4%20%2B%20BEMIT-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com)
[![Cryptography Fernet](https://img.shields.io/badge/Security-AES%20Fernet%20Zero--Leakage-blueviolet?style=flat-square)](https://cryptography.io)
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
5. [Segurança & Criptografia Zero-Leakage](#segurança--criptografia-zero-leakage)
6. [Recursos & Usabilidade do Produto](#recursos--usabilidade-do-produto)
7. [Stack Tecnológica & Justificativas](#stack-tecnológica--justificativas)
8. [Como Executar o Projeto (Guia Rápido)](#como-executar-o-projeto-guia-rápido)
9. [Variáveis de Ambiente](#variáveis-de-ambiente)
10. [Especificação de Endpoints da API](#especificação-de-endpoints-da-api)
11. [Estrutura do Repositório](#estrutura-do-repositório)
12. [Acessibilidade (WCAG 2.1 AA) & Design System Studio Noir](#acessibilidade-wcag-21-aa--design-system-studio-noir)
13. [Deploy & Integração Contínua](#deploy--integração-contínua)
14. [Sobre o Autor](#sobre-o-autor)

---

## Visão Geral & Proposta de Valor

O **Integrador de IA & Chatbot Orgânico** é um ecossistema de software concebido para resolver o problema de **fragmentação e dependência de fornecedores (*vendor lock-in*)** na integração de modelos generativos de linguagem (LLMs).

A plataforma centraliza em uma única interface reativa a gestão e o uso de provedores heterogêneos de IA:
- **Google Gemini**: modelos de última geração (`gemini-3.6-flash`);
- **OpenAI / Groq / OpenRouter**: integração nativa via especificação OpenAI para modelos proprietários e endpoints de inferência em alta velocidade (Llama 3, Groq Compound);
- **Ozlo Orgânico (Simulador Residente)**: motor de simulação inteligente e offline que emula streaming real de tokens e telemetria, **permitindo a qualquer recrutador ou desenvolvedor testar a aplicação em 60 segundos sem depender de nenhuma chave de API ou custo de cartão de crédito**.

---

## Por Que Este Projeto é Relevante?

Ao avaliar este repositório como portfólio de engenharia de software, destacam-se cinco desafios práticos solucionados:

### 1. Eliminação do Vendor Lock-in
Cada ecossistema de IA possui SDKs proprietários, esquemas de payload e contratos próprios. Este projeto implementa uma **camada de adaptadores de serviço** no backend que normaliza parâmetros de entrada, formatação de saída e eventos de streaming, tornando a substituição ou adição de novos provedores uma tarefa trivial e sem impacto no frontend.

### 2. Redução Drástica da Latência Percebida via SSE
Em chamadas REST síncronas convencionais, o usuário aguarda o modelo gerar uma resposta completa (muitas vezes 5 a 10 segundos) com a tela travada. Aqui, a entrega é contínua e assíncrona token a token usando **Server-Sent Events (SSE)** sobre HTTP puro, sem a sobrecarga de estado ou complexidade desnecessária de WebSockets bidirecionais para um fluxo unidirecional.

### 3. Foco em Demonstração Imediata (Zero Friction)
Para testes de recrutamento, exigir credenciais pagas de APIs de terceiros inviabiliza testes reais por avaliadores. O modo nativo **Ozlo** roda um simulador determinístico assíncrono que replica o comportamento real do streaming, telemetria de latência e consumo de tokens instantaneamente ao rodar o projeto.

### 4. Segurança em Repouso & Prevenção de Vazamento (Zero-Leakage)
Chaves de API inseridas pelo usuário recebem criptografia simétrica com chave derivada por SHA-256 no banco de dados e nunca trafegam em texto puro de volta ao navegador, graças ao mascaramento server-side.

### 5. Engenharia Acessível como Requisito de Produto (WCAG 2.1 AA)
A maior parte dos dashboards de IA negligencia pessoas com deficiência visual ou dislexia. O projeto inclui um dock de acessibilidade flutuante com ajuste de escala tipográfica, modo de leitura facilitada, alto contraste calibrado e respeito a *prefers-reduced-motion*.

---

## Decisões de Engenharia & Arquitetura

| Decisão | Alternativa Rejeitada | Motivo da Escolha |
| :--- | :--- | :--- |
| **Server-Sent Events (SSE)** | WebSockets / HTTP Polling | O fluxo de streaming de IA é essencialmente unidirecional (servidor para cliente). SSE roda sobre HTTP padrão, reaproveita conexões, lida nativamente com reconexão e não exige o overhead de manter sockets bidirecionais no servidor. |
| **FastAPI + Asyncio** | Django / Flask tradicional | O I/O de chamadas de LLM é bloqueante por natureza em frameworks síncronos. FastAPI permite geradores assíncronos (`StreamingResponse`) que liberam a thread do pool enquanto os tokens são aguardados da API de IA. |
| **Pydantic v2** | Validação manual / Schemas ad-hoc | Validação ultra-rápida em Rust, contratos tipados rigorosamente e geração automática de documentação OpenAPI/Swagger 100% fiel ao código. |
| **Atomic Design + BEMIT no React 19** | Componentes monolíticos / CSS desorganizado | Arquitetura de componentes por níveis atômicos combinada à convenção de nomenclatura BEMIT (`c-`, `o-`, `u-`, `is-`). Assegura manutenibilidade, encapsulamento estético e previsibilidade de especificidade CSS. |
| **Criptografia Fernet (AES-128-CBC)** | Chaves em texto claro no banco | Proteção de credenciais confidenciais contra vazamento acidental em dumps de banco de dados ou logs de telemetria. |
| **SQLAlchemy 2.0 ORM** | Consultas raw SQL sem tipagem | Mapeamento relacional seguro com suporte nativo a SQLite em ambiente local de desenvolvimento e migração sem atrito para PostgreSQL em produção. |

---

## Diagrama de Arquitetura

```mermaid
graph TD
    subgraph Client ["Frontend (React 19 + TypeScript + Vite + BEMIT)"]
        UI["Atomic Design & Dock de Acessibilidade Flutuante"]
        Contexts["Contextos Globais (Theme, I18n, Accessibility)"]
        SSEConsumer["Consumidor de Streaming SSE (ReadableStream)"]
    end

    subgraph Server ["Backend (FastAPI + Python 3.11 Assíncrono)"]
        Endpoints["Rotas REST e Handlers de Eventos (/api/chats, /api/integrations)"]
        Controller["Controladores de Negócio & Orquestração"]
        Adapters["Camada de Adaptadores de LLMs (Gemini, OpenAI, Ozlo)"]
        Security["CryptoUtils (Criptografia Fernet AES + Mascaramento)"]
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
    Controller --> Security
    Controller --> Adapters
    Controller --> DataLayer
    Adapters --> Gemini
    Adapters --> OpenAI
    Adapters --> Ozlo
    DataLayer <--> DB
```

---

## Segurança & Criptografia Zero-Leakage

O gerenciamento de chaves privadas de API implementa segurança rigorosa em repouso e tráfego através de [backend/utils/crypto.py](file:///d:/Projetos/Projetos%20Pessoais/Integrador%20de%20IA%20e%20Chatbot%20Organico/backend/utils/crypto.py):

1. **Criptografia Simétrica Fernet**:
   - Cada chave inserida é criptografada com algoritmo Fernet (AES-128 em modo CBC com autenticação HMAC-SHA256).
   - A chave de cifragem é derivada deterministicamente via SHA-256 a partir da variável `SECRET_KEY`.
   - As chaves cifradas são armazenadas no banco de dados com o prefixo versionado `enc_v1$`, permitindo rotação transparente de algoritmos futuros.

2. **Zero-Leakage para o Cliente**:
   - Ao listar ou consultar integrações via API, a chave real **nunca** é devolvida na resposta JSON. O backend converte o segredo na máscara fixa `************************`.
   - Se o usuário editar um provedor mantendo o campo mascarado, o backend detecta a máscara e preserva o segredo criptografado já persistido sem sobrescrevê-lo.

---

## Recursos & Usabilidade do Produto

### 1. Chat Playground em Tempo Real
- Streaming de tokens em tempo real com indicador visual de resposta.
- Renderização nativa de Markdown com destaque de sintaxe em blocos de código e botão de cópia com 1 clique.
- Telemetria detalhada por balão de mensagem: modelo executor, latência exata da resposta (ms) e contagem aproximada de tokens gerados.
- Gestão completa de conversas: criar nova sessão, renomear título com persistência inline, limpar mensagens mantendo a sessão e exclusão com diálogo modal de segurança.
- **Exportação para Markdown**: Gera e descarrega instantaneamente um arquivo `.md` estruturado com data, metadados da sessão e histórico completo das mensagens.

### 2. Central de Provedores de IA (Integration Hub)
- Ativação ou desativação de provedores com um clique.
- Edição de *system instructions* (instruções de sistema) individualmente por modelo, permitindo calibrar o tom, persona e regras de negócio da IA.
- Teste de diagnóstico de conexão ativo em 1 clique (testa credenciais e latência da rota externa com retorno imediato de status).

### 3. Dashboard Analítico Executivo
- Métricas consolidadas em tempo real: volume de sessões criadas, total de mensagens trocadas, latência média global de resposta e consumo acumulado estimado de tokens.
- Gráficos visuais com percentual de distribuição de uso por provedor.

### 4. Internacionalização Dinâmica (i18n)
- Suporte nativo e instantâneo a **Português (`pt`)**, **English (`en`)** e **Español (`es`)** com persistência em contexto e sem recarregar a aplicação.

### 5. Floating Dock de Acessibilidade & Controles
- Escalonamento da tipografia: Padrão (100%), Grande (115%) e Extra Grande (130%).
- Alternância de temas: **Studio Noir (Escuro)**, **Claro** e **Alto Contraste**.
- Modo Leitura Facilitada (tipografia e entrelinha calibradas para redução de fadiga cognitiva).
- Redução de Animações com conformidade nativa a *prefers-reduced-motion*.
- **Live Studio Clock**: Relógio ativo no cabeçalho formatado em `FLN, BR [HH:MM BRT]`.
- **Easter Egg Chico Wagner**: Homenagem interativa ao Diretor Executivo de Miados do estúdio.

---

## Stack Tecnológica & Justificativas

### Backend
- **Python 3.11+**: Ecossistema de referência para computação e IA, com suporte maduro a tipos estáticos e assincronia.
- **FastAPI 0.111.0**: Framework web moderno de altíssimo desempenho, com validação automática e documentação OpenAPI interativa.
- **Uvicorn 0.30.1**: Servidor ASGI leve e otimizado para produção.
- **Cryptography 42.0+**: Biblioteca de referência de segurança em Python para criptografia simétrica Fernet de segredos.
- **SQLAlchemy 2.0.30**: Abstração relacional robusta compatível com SQLite (local) e PostgreSQL (nuvem).
- **Pydantic 2.7.4**: Core de validação reescrito em Rust para tipagem estrita de payloads.
- **Google Generative AI SDK 0.7.2**: SDK oficial para orquestração de modelos Gemini.
- **OpenAI Python SDK 1.35.10**: SDK oficial para chamadas padronizadas a OpenAI, Groq Cloud e OpenRouter.
- **HTTPX 0.27.0**: Cliente assíncrono para testes de conectividade e integração de endpoints customizados.
- **Psycopg2-binary 2.9.9**: Driver para PostgreSQL em ambientes de nuvem.

### Frontend
- **React 19**: Versão mais recente do framework, aproveitando melhorias de concorrência e renderização otimizada.
- **TypeScript 6.x**: Tipagem estrita de ponta a ponta, eliminando erros em tempo de compilação.
- **Vite 8**: Build tool e dev server ultra-rápido com Hot Module Replacement (HMR).
- **Tailwind CSS v4 & Metodologia BEMIT**: Utility classes combinadas a classes BEM estruturadas (`c-`, `o-`, `u-`) para especificidade controlada e organização profissional.
- **Framer Motion 13.x**: Animações fluidas e microinterações táteis nos cards e modais.
- **Lucide React**: Conjunto visual consistente de ícones vetoriais.
- **Oxlint**: Ferramenta de linting de alta velocidade baseada em Rust.

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

Abra um terminal no diretório do projeto:

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

# 4. Instalar as dependências
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

> **Nota para Avaliadores & Testes Imediatos:**  
> O modelo **Ozlo Orgânico** já vem ativado por padrão com respostas simuladas e métricas ativas. Você pode começar a conversar imediatamente sem fornecer nenhuma credencial externa.

---

## Variáveis de Ambiente

O arquivo `.env` no backend é **estritamente opcional**. Caso deseje conectar suas próprias chaves de API pagas ou personalizar a chave secreta de criptografia, crie o arquivo `backend/.env` baseado no modelo abaixo:

```env
# Chave mestra para cifragem simétrica de chaves de provedor (Fernet AES)
SECRET_KEY=antigravity-chatbot-integrator-secret-key-2026

# Conexão com banco de dados (se omitido, usa SQLite local automaticamente)
# DATABASE_URL=postgresql://usuario:senha@localhost:5432/meubanco

# Chaves de API para provedores externos (opcionais)
GEMINI_API_KEY=sua_chave_gemini_aqui
OPENAI_API_KEY=sua_chave_openai_aqui
GROQ_API_KEY=sua_chave_groq_aqui

# URLs permitidas para requisições CORS (separadas por vírgula)
FRONTEND_URL=http://localhost:5173,http://127.0.0.1:5173
```

---

## Especificação de Endpoints da API

| Método | Endpoint | Descrição | Formato de Retorno |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Health check e status da API | JSON |
| `GET` | `/docs` | Documentação interativa Swagger | HTML / OpenAPI |
| `GET` | `/api/integrations` | Lista provedores configurados (chaves mascaradas) | JSON Array |
| `POST` | `/api/integrations` | Cria uma nova integração de IA | JSON Object |
| `GET` | `/api/integrations/{id}` | Obtém detalhes de um provedor específico | JSON Object |
| `PUT` | `/api/integrations/{id}` | Atualiza modelo, chave criptografada ou system prompt | JSON Object |
| `DELETE` | `/api/integrations/{id}` | Remove um provedor cadastrado | JSON Object |
| `POST` | `/api/integrations/{id}/test` | Diagnóstico de conexão do provedor em tempo real | JSON Object |
| `GET` | `/api/chats` | Lista sessões de conversa ativas com histórico | JSON Array |
| `POST` | `/api/chats` | Inicializa uma nova conversa | JSON Object |
| `GET` | `/api/chats/{session_id}` | Obtém mensagens e metadados de uma sessão | JSON Object |
| `PUT` | `/api/chats/{session_id}` | Renomeia o título da sessão | JSON Object |
| `DELETE` | `/api/chats/{session_id}` | Exclui conversa e histórico associado | JSON Object |
| `POST` | `/api/chats/{session_id}/clear` | Limpa mensagens mantendo a conversa | JSON Object |
| `POST` | `/api/chats/{session_id}/message` | Envio de mensagem com streaming em tempo real | **text/event-stream (SSE)** |

---

## Estrutura do Repositório

```text
├── backend/
│   ├── config/               # Configurações globais (settings) e conexão SQLAlchemy (database)
│   │   ├── database.py
│   │   └── settings.py
│   ├── controllers/          # Regras de negócio desacopladas do banco
│   │   ├── chat_controller.py
│   │   └── integration_controller.py
│   ├── docs/                 # Metadados OpenAPI, Swagger tags e documentação técnica
│   │   └── openapi.py
│   ├── models/               # Entidades relacionais do banco (ChatSession, ChatMessage, Integration)
│   │   ├── chat.py
│   │   └── integration.py
│   ├── repositories/         # Padrão Repository (Data Access Objects / CRUD isolado)
│   │   ├── chat_repository.py
│   │   └── integration_repository.py
│   ├── routes/               # Rotas REST e streaming SSE do FastAPI
│   │   ├── chat.py
│   │   └── integration.py
│   ├── schemas/              # Schemas Pydantic v2 para validação e serialização de dados
│   │   ├── chat.py
│   │   └── integration.py
│   ├── services/             # Orquestração de LLMs e adaptadores de IA
│   │   └── llm_service.py
│   ├── utils/                # Utilitários de segurança (CryptoUtils Fernet/AES) e helpers
│   │   ├── crypto.py
│   │   └── helpers.py
│   ├── main.py               # Ponto de entrada FastAPI, CORS e seed automático
│   └── requirements.txt      # Dependências Python do backend
│
├── frontend/
│   ├── src/
│   │   ├── api.ts            # Clientes HTTP e leitor de fluxo streaming SSE
│   │   ├── components/       # Arquitetura Atômica com nomenclatura BEMIT
│   │   │   ├── atoms/        # Componentes base (botões, inputs, hero, logos, status)
│   │   │   │   ├── aiOrchestratorHero/
│   │   │   │   ├── button/
│   │   │   │   ├── input/
│   │   │   │   ├── robotIntegrationLogo/
│   │   │   │   └── statusIndicator/
│   │   │   ├── molecules/    # Agrupamentos funcionais (cards, bubbles, dock, easter egg)
│   │   │   │   ├── accessibilityMenu/
│   │   │   │   ├── chatBubble/
│   │   │   │   ├── chicoWagnerModal/
│   │   │   │   ├── floatingControls/
│   │   │   │   └── integrationCard/
│   │   │   ├── organisms/    # Módulos complexos (ChatWindow, IntegrationHub, Analytics)
│   │   │   │   ├── analyticsDashboard/
│   │   │   │   ├── chatWindow/
│   │   │   │   └── integrationHub/
│   │   │   ├── templates/    # Estruturas de layout (DashboardLayout)
│   │   │   │   └── dashboardLayout/
│   │   │   └── pages/        # Visões de tela da aplicação (Dashboard)
│   │   │       └── dashboard/
│   │   ├── context/          # Gerenciamento de estado (Theme, Accessibility, I18n)
│   │   ├── i18n/             # Dicionários de tradução (Português, Inglês, Espanhol)
│   │   │   └── translations.ts
│   │   ├── index.css         # Design system Studio Noir, tokens e diretivas Tailwind v4
│   │   └── main.tsx          # Ponto de montagem da árvore React
│   ├── package.json          # Dependências e scripts Node.js
│   └── vite.config.ts        # Configuração de build do Vite
│
├── AGENTS.md                 # Diretrizes de design e padrões do repositório
├── main.py                   # Ponto de entrada raiz para plataformas PaaS
├── Procfile                  # Descritor de execução para Render / Railway / Heroku
├── render.yaml               # Manifesto de deploy em nuvem para Render
├── requirements.txt          # Dependências Python na raiz para builders PaaS
├── vercel.json               # Configuração de deploy do frontend na Vercel
├── README.md                 # Documentação principal em Português
└── README_EN.md              # Documentação completa em Inglês
```

---

## Acessibilidade (WCAG 2.1 AA) & Design System Studio Noir

O projeto adota o design system autoral **Studio Noir**, combinando estética de estúdio digital premiado com rigor de acessibilidade:

- **Tokens Cromáticos Calibrados**:
  - Dark Canvas / Fundo: `#090C10`
  - Superfícies Esculturais: `#111620` e `#161D2A`
  - Hover / Superfície Ativa: `#1A2230`
  - Bordas Estruturais Nítidas: `#1E2633` (1px fino)
  - Cores Semânticas de Acento: Electric Cobalt (`#3B82F6`) e Emerald de Status (`#10B981`)
- **Padrão Tipográfico**:
  - Títulos de Impacto / Display: `Syne` (pesos 700 e 800)
  - Leitura & Corpo: `Inter` (pesos 400 e 500)
  - Microtipografia Técnica & Telemetria: `IBM Plex Mono` (pesos 400 e 500)
- **Acessibilidade Universal**:
  - Suporte abrangente à navegação por teclado e semântica de elementos interativos.
  - Modo de alto contraste para conformidade estrita com taxas mínimas de contraste exigidas pela norma WCAG 2.1 AA.
  - Modo de leitura para redução de fadiga cognitiva.
  - Escala dinâmica de tipografia sem quebra de layouts ou overflow indesejado.
  - Respeito automático à preferência do sistema operacional por animações reduzidas (*prefers-reduced-motion*).

---

## Deploy & Integração Contínua

O ecossistema é preparado para hospedagem em nuvem sem necessidade de configurações adicionais:

- **Frontend (Vercel)**:
  - Arquivo [vercel.json](file:///d:/Projetos/Projetos%20Pessoais/Integrador%20de%20IA%20e%20Chatbot%20Organico/vercel.json) configurado com rewrites automáticos para Single-Page Applications (SPA) e cabeçalhos de cache otimizados.
- **Backend (Render / Railway / Heroku)**:
  - Descritor [Procfile](file:///d:/Projetos/Projetos%20Pessoais/Integrador%20de%20IA%20e%20Chatbot%20Organico/Procfile) pronto com comando de inicialização Uvicorn.
  - Manifesto [render.yaml](file:///d:/Projetos/Projetos%20Pessoais/Integrador%20de%20IA%20e%20Chatbot%20Organico/render.yaml) para provisionamento de serviço web com variáveis de ambiente e runtime Python.
  - Arquivos [main.py](file:///d:/Projetos/Projetos%20Pessoais/Integrador%20de%20IA%20e%20Chatbot%20Organico/main.py) e [requirements.txt](file:///d:/Projetos/Projetos%20Pessoais/Integrador%20de%20IA%20e%20Chatbot%20Organico/requirements.txt) na raiz do repositório para compatibilidade direta com builders PaaS que exigem inicialização na pasta base.

---

## Sobre o Autor

**Filipi Soares**  
*Designer-Minded Developer | Full Stack & Creative Engineering*

Engenheiro de software full stack focado na convergência entre **arquitetura de sistemas robusta** e **direção de arte digital refinada**. Experiência sólida na construção de interfaces reativas, consumo de modelos generativos de IA, segurança e arquitetura distribuída.

- **LinkedIn:** [linkedin.com/in/filipiss](https://www.linkedin.com/in/filipiss/)
- **GitHub:** [@Filipiss](https://github.com/Filipiss)
- **Repositório do Projeto:** [github.com/Filipiss/chatbot-ia](https://github.com/Filipiss/chatbot-ia)