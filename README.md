# 🤖 Integrador de IA & Chatbot Orgânico

Plataforma completa para gestão, orquestração e teste de múltiplos provedores de Inteligência Artificial e Chatbots conversacionais em tempo real com interface moderna, recursos avançados de acessibilidade e métricas em tempo de execução.

---

## 🚀 Principais Recursos

- 💬 **Chat Playground em Tempo Real**:
  - Respostas em streaming via Server-Sent Events (SSE).
  - Suporte completo a formatação Markdown e blocos de código com destaque de sintaxe.
  - Métricas por mensagem: latência de resposta, tokens estimados e provedor utilizado.
  - Ações rápidas de sessão: **Exportar em Markdown**, **Limpar Mensagens** e **Excluir Conversa**.
  
- 🔌 **Central de Provedores de IA**:
  - **Ozlo Orgânico (Simulador Residente)**: Modelo inteligente embarcado para testes instantâneos sem necessidade de API Keys.
  - **Google Gemini**: Conexão com a API do Google Gemini.
  - **OpenAI / Groq / OpenRouter**: Integração via OpenAI SDK com suporte a custom endpoints (Groq, OpenRouter, etc.).
  - Teste de conexão ativo em 1 clique e edição dinâmica de prompts base de sistema (*system instructions*).

- 📊 **Dashboard Analítico**:
  - Métricas consolidadas: total de conversas, total de mensagens trocadas, latência média global e tokens estimados.
  - Gráfico de distribuição percentual de requisições por provedor.

- ♿ **Central de Acessibilidade & Multilíngue**:
  - Widget flutuante (*floating dock*) com efeito *glassmorphism* no canto inferior direito.
  - Seletor de idioma dinâmico: **Português (`🇧🇷`)**, **English (`🇺🇸`)** e **Español (`🇪🇸`)**.
  - Ajuste de tamanho da fonte (100% Padrão, 115% Grande, 130% Extra Grande).
  - Modo Alto Contraste para máxima legibilidade.
  - Redução de animações para sensibilidade visual.
  - Modo de leitura / Tipografia acessível.
  - Alternador de Tema Claro e Escuro (*Light/Dark Mode*).

---

## 🛠️ Tecnologias Utilizadas

### Backend
- **Python 3.11+**
- **FastAPI**: Framework assíncrono de alto desempenho.
- **SQLAlchemy & SQLite**: Persistência de dados e histórico de conversas.
- **Pydantic v2**: Validação estrita de esquemas e dados de entrada.
- **Google GenAI & OpenAI SDKs**: Integrações oficiais para múltiplos modelos de LLM.

### Frontend
- **React 19 & TypeScript**: Interface reativa e fortemente tipada.
- **Vite**: Build tool e dev server ultra-rápido.
- **Tailwind CSS v4**: Estilização moderna com design system customizado.
- **Lucide React**: Ícones vetoriais modernos.

---

## 📦 Como Executar o Projeto

### Pré-requisitos
- [Python 3.10+](https://www.python.org/)
- [Node.js 18+](https://nodejs.org/)

---

### 1. Configurando e Executando o Backend

```bash
# Acesse o diretório do backend
cd backend

# Crie um ambiente virtual (se ainda não tiver)
python -m venv venv

# Ative o ambiente virtual
# No Windows:
.\venv\Scripts\activate
# No Linux/macOS:
source venv/bin/activate

# Instale as dependências
pip install -r requirements.txt

# Inicie o servidor FastAPI
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

O backend estará rodando em:
- **API URL**: `http://127.0.0.1:8000`
- **Swagger Docs**: `http://127.0.0.1:8000/docs`

---

### 2. Configurando e Executando o Frontend

```bash
# Em outro terminal, acesse o diretório do frontend
cd frontend

# Instale as dependências
npm install

# Inicie o servidor Vite
npm run dev
```

O frontend estará rodando em `http://127.0.0.1:5173`.

---

## 📂 Estrutura do Projeto

```
├── backend/
│   ├── controllers/      # Controladores de regras de negócio
│   ├── database/         # Conexão e configuração do banco SQLite
│   ├── models/           # Modelos ORM (SQLAlchemy)
│   ├── routes/           # Rotas da API REST (chats, integracoes, analise)
│   ├── schemas/          # Schemas Pydantic para validação
│   ├── services/         # Orquestração de LLMs (Gemini, OpenAI, Ozlo)
│   ├── main.py           # Ponto de entrada FastAPI
│   └── requirements.txt  # Dependências Python
│
├── frontend/
│   ├── src/
│   │   ├── api/          # Chamadas HTTP e streaming SSE
│   │   ├── components/   # Atomic Design (atoms, molecules, organisms, templates, pages)
│   │   ├── context/      # Contextos (Theme, Accessibility, I18n)
│   │   ├── i18n/         # Dicionários de tradução (PT, EN, ES)
│   │   ├── index.css     # Design system e temas
│   │   └── main.tsx      # Ponto de entrada React
│   ├── package.json
│   └── vite.config.ts
│
└── README.md
```

---

## 📄 Licença

Distribuído sob a licença MIT. Consulte `LICENSE` para obter mais informações.
