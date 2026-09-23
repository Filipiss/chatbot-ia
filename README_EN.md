# AI Integrator & Organic Chatbot Platform

> Full-stack platform for real-time LLM orchestration, benchmarking, and telemetry, powered by Server-Sent Events (SSE) streaming, atomic frontend architecture, and inclusive accessibility.

[![React 19](https://img.shields.io/badge/Frontend-React%2019%20%7C%20TypeScript-blue?style=flat-square&logo=react)](https://react.dev)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI%20%7C%20Python%203.11+-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com)
[![Tailwind CSS v4](https://img.shields.io/badge/Styling-Tailwind%20CSS%20v4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com)
[![SSE Streaming](https://img.shields.io/badge/Realtime-Server--Sent%20Events-orange?style=flat-square)](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)
[![WCAG 2.1 AA](https://img.shields.io/badge/Accessibility-WCAG%202.1%20AA-success?style=flat-square)](https://www.w3.org/WAI/standards-guidelines/wcag/)
[![License MIT](https://img.shields.io/badge/License-MIT-gray?style=flat-square)](LICENSE)

**Language / Idioma:** [Versão em Português](README.md) | **English (Current)**

---

## Executive Table of Contents

1. [Overview & Value Proposition](#overview--value-proposition)
2. [Why This Project Matters (Problem & Solution)](#why-this-project-matters-problem--solution)
3. [Engineering Decisions & Architecture](#engineering-decisions--architecture)
4. [System Architecture Diagram](#system-architecture-diagram)
5. [Core Features & User Experience](#core-features--user-experience)
6. [Tech Stack & Technical Rationale](#tech-stack--technical-rationale)
7. [Step-by-Step Setup Guide (Quickstart)](#step-by-step-setup-guide-quickstart)
8. [Environment Variables & Configuration](#environment-variables--configuration)
9. [API Specification & Contracts](#api-specification--contracts)
10. [Repository Directory Structure](#repository-directory-structure)
11. [Accessibility (WCAG 2.1 AA) & Design System](#accessibility-wcag-21-aa--design-system)
12. [About the Author](#about-the-author)

---

## Overview & Value Proposition

The **AI Integrator & Organic Chatbot Platform** is an enterprise-grade full-stack solution engineered to solve the challenges of **vendor lock-in, latency bottlenecks, and accessibility gaps** in generative AI integrations.

The platform provides a unified reactive interface that orchestrates heterogeneous Large Language Model (LLM) providers:
- **Google Gemini**: cutting-edge multi-modal models (`gemini-3.6-flash`);
- **OpenAI / Groq / OpenRouter**: standardized OpenAI-compatible clients for proprietary and high-throughput open-weights inference (Llama 3, Groq Compound);
- **Ozlo Orgânico (Resident Simulator)**: an embedded offline mock engine delivering realistic token streaming and telemetry calculations, **enabling hiring managers and tech evaluators to test the system in 60 seconds without requiring external API keys or payment cards**.

---

## Why This Project Matters (Problem & Solution)

When evaluating this project as an engineering portfolio piece, four core technical achievements stand out:

### 1. Eliminating AI Vendor Lock-in
Every major AI provider ships proprietary SDKs, unique payload structures, and distinct streaming implementations. This platform introduces a decoupled **backend service adapter layer** that normalizes request parameters, response formatting, and stream chunking into a singular contract, making provider migration completely transparent to the client.

### 2. Eliminating Perceived Latency via Server-Sent Events (SSE)
Blocking HTTP round-trips force users to wait several seconds for a complete response. This platform streams output token by token using **Server-Sent Events (SSE)** over standard HTTP, providing immediate feedback without the operational overhead and stateful socket management of bi-directional WebSockets.

### 3. Zero-Friction Evaluator Experience
Requiring private paid API keys prevents reviewers from conducting live tests. The resident **Ozlo engine** acts as an integrated offline simulator that produces asynchronous streaming output and computes telemetry without external network dependencies.

### 4. Enterprise-Grade Accessibility (WCAG 2.1 AA)
Most AI tools overlook neurodivergent users and visual impairments. This system integrates an interactive floating dock featuring scalable typography, reading mode, high-contrast themes, and automatic motion reduction.

---

## Engineering Decisions & Architecture

| Architectural Decision | Rejected Alternative | Rationale |
| :--- | :--- | :--- |
| **Server-Sent Events (SSE)** | WebSockets / HTTP Polling | AI response generation is inherently unidirectional (server-to-client). SSE uses standard HTTP, handles automatic reconnections, passes through corporate proxies effortlessly, and avoids the socket maintenance overhead of WebSockets. |
| **FastAPI + Asyncio** | Traditional Django / Flask | LLM network calls are inherently I/O bound. FastAPI asynchronous generators (`StreamingResponse`) release threads back to the event loop while waiting for streaming tokens. |
| **Pydantic v2** | Ad-hoc dictionary validation | High-speed Rust-based data validation ensuring strict type safety at transport boundaries and generating auto-documented OpenAPI schemas. |
| **Atomic Design in React 19** | Monolithic flat component structure | Strict separation into atoms, molecules, organisms, templates, and pages. Fosters code reusability, isolated testability, and long-term project maintainability. |
| **SQLAlchemy 2.0 ORM** | Unchecked raw SQL | Safe, typed relational data mapping with native SQLite support for zero-config local development and zero-code migration to PostgreSQL in production. |

---

## System Architecture Diagram

```mermaid
graph TD
    subgraph Client ["Frontend (React 19 + TypeScript + Vite)"]
        UI["Atomic Design System & Accessibility Dock"]
        Contexts["Global State (Theme, I18n, Accessibility)"]
        SSEConsumer["SSE Stream Reader (ReadableStream)"]
    end

    subgraph Server ["Backend (FastAPI + Asynchronous Python 3.11)"]
        Endpoints["REST & EventStream Routes (/chats, /integrations)"]
        Controller["Business Controllers & Message Orchestration"]
        Adapters["LLM Service Adapter Layer"]
        DataLayer["SQLAlchemy ORM + Pydantic v2 Contracts"]
    end

    subgraph Providers ["AI Providers & Engines"]
        Gemini["Google Gemini (google-generativeai SDK)"]
        OpenAI["OpenAI / Groq / OpenRouter (openai SDK)"]
        Ozlo["Ozlo Orgânico (Offline Resident Simulator)"]
    end

    subgraph Storage ["Persistence Layer"]
        DB[(Local SQLite / Production PostgreSQL)]
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

## Core Features & User Experience

### 1. Interactive Real-Time Chat Playground
- Real-time token streaming with live visual response feedback.
- Native Markdown parsing with syntax highlighting on code blocks and 1-click clipboard copy.
- Message-level telemetry: active model name, millisecond response latency, and estimated token counts.
- Session lifecycle tools: create new chat, rename conversation, clear messages, and permanent deletion with safety dialogs.
- **Export to Markdown**: Instantly generates clean, timestamped `.md` transcripts of conversations.

### 2. AI Provider Management Hub
- 1-Click activation and toggling between providers.
- Dynamic system prompt editing per model, allowing real-time persona calibration without server restarts.
- Diagnostic ping utility to test provider API credentials and latency.

### 3. Executive Telemetry Dashboard
- High-level KPIs: total chat sessions created, total messages processed, global average latency, and estimated cumulative token usage.
- Distribution charts displaying workload share across active AI providers.

### 4. Trilingual Internationalization (i18n)
- Seamless, zero-page-reload switching across **English (`en`)**, **Portuguese (`pt`)**, and **Spanish (`es`)**.

### 5. Inclusive Floating Accessibility Dock
- Scalable font sizing: Standard (100%), Large (115%), and Extra Large (130%).
- High-Contrast, Clean Light, and Studio Noir Dark themes.
- Accessible Reading Typography mode.
- System-level motion reduction compliance (*prefers-reduced-motion*).

---

## Tech Stack & Technical Rationale

### Backend
- **Python 3.11+**: Modern async runtime with strict typing support.
- **FastAPI 0.111.0**: High-throughput web framework with automatic OpenAPI documentation.
- **Uvicorn 0.30.1**: Production-ready ASGI server.
- **SQLAlchemy 2.0.30**: Relational ORM supporting SQLite and PostgreSQL.
- **Pydantic 2.7.4**: Rust-backed data validation library.
- **Google Generative AI SDK 0.7.2**: Official client library for Google Gemini models.
- **OpenAI Python SDK 1.35.10**: Universal client for OpenAI, Groq, and custom endpoints.
- **HTTPX 0.27.0**: Async HTTP client for external network health checks.
- **Psycopg2-binary 2.9.9**: PostgreSQL database adapter for production deployment.

### Frontend
- **React 19**: Modern concurrent React architecture with optimized rendering cycles.
- **TypeScript 6.x**: Strict end-to-end type safety.
- **Vite 8**: High-speed build tool and dev server with instant Hot Module Replacement (HMR).
- **Tailwind CSS v4**: Utility-first styling engine compiled on demand.
- **Framer Motion 13.x**: Microinteractions and smooth modal transitions.
- **Lucide React**: Comprehensive, lightweight vector icon library.
- **Oxlint**: High-performance linter for consistent code formatting.

---

## Step-by-Step Setup Guide (Quickstart)

### Prerequisites
- **Python 3.10+**
- **Node.js 18+**
- **Git**

---

### Step 1: Clone the Repository

```bash
git clone https://github.com/Filipiss/chatbot-ia.git
cd chatbot-ia
```

---

### Step 2: Start the Backend

Open a terminal at the repository root:

```bash
# 1. Enter the backend directory
cd backend

# 2. Create a virtual environment
python -m venv venv

# 3. Activate the virtual environment
# Windows:
.\venv\Scripts\activate
# Linux / macOS:
source venv/bin/activate

# 4. Install dependencies
pip install -r requirements.txt

# 5. Launch the FastAPI server
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

The API will be available at `http://127.0.0.1:8000`.  
Interactive documentation is accessible at:
- Swagger UI: `http://127.0.0.1:8000/docs`
- ReDoc: `http://127.0.0.1:8000/redoc`

---

### Step 3: Start the Frontend

Open a **second terminal tab**, navigate to the repository root, and run:

```bash
# 1. Enter the frontend directory
cd frontend

# 2. Install Node.js packages
npm install

# 3. Start the Vite development server
npm run dev
```

Open your browser at `http://127.0.0.1:5173`.

> **Note for Reviewers:**  
> The embedded **Ozlo Orgânico** model is active by default. You can test full streaming conversations and telemetry immediately without entering any API credentials.

---

## Environment Variables & Configuration

The application operates completely out of the box using SQLite and the local simulator. If you choose to configure external paid API keys, create a `backend/.env` file:

```env
# Database connection (optional - defaults to local SQLite if omitted)
# DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# AI Provider API Keys (optional)
GEMINI_API_KEY=your_gemini_key_here
OPENAI_API_KEY=your_openai_key_here
GROQ_API_KEY=your_groq_key_here

# Allowed CORS origins (comma-separated)
FRONTEND_URL=http://localhost:5173,http://127.0.0.1:5173
```

---

## API Specification & Contracts

| Method | Endpoint | Description | Return Format |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | API health check & status | JSON |
| `GET` | `/docs` | Interactive Swagger documentation | HTML / OpenAPI |
| `GET` | `/integrations` | Returns list of configured AI providers | JSON Array |
| `PUT` | `/integrations/{id}` | Updates provider settings, keys, or prompts | JSON Object |
| `POST` | `/integrations/{id}/test` | Diagnostic connectivity ping | JSON Object |
| `GET` | `/chats` | Retrieves all conversation sessions | JSON Array |
| `POST` | `/chats` | Creates a new conversation session | JSON Object |
| `GET` | `/chats/{chat_id}` | Retrieves full message history and metadata | JSON Object |
| `POST` | `/chats/{chat_id}/messages` | Sends message and opens **SSE Stream** | **text/event-stream (SSE)** |
| `DELETE` | `/chats/{chat_id}` | Deletes session and related message records | JSON Object |
| `POST` | `/chats/{chat_id}/clear` | Clears messages while keeping session alive | JSON Object |

---

## Repository Directory Structure

```text
├── backend/
│   ├── config/           # Application settings and SQLAlchemy database connection
│   │   ├── database.py
│   │   └── settings.py
│   ├── controllers/      # Decoupled business logic controllers
│   │   ├── chat_controller.py
│   │   └── integration_controller.py
│   ├── docs/             # OpenAPI metadata, Swagger tags and API documentation
│   │   └── openapi.py
│   ├── models/           # Relational ORM models (ChatSession, ChatMessage, Integration)
│   │   ├── chat.py
│   │   └── integration.py
│   ├── repositories/     # Repository pattern (isolated Data Access Objects / CRUD)
│   │   ├── chat_repository.py
│   │   └── integration_repository.py
│   ├── routes/           # FastAPI REST and SSE streaming routes
│   │   ├── chat.py
│   │   └── integration.py
│   ├── schemas/          # Pydantic v2 validation contracts and serialization
│   │   ├── chat.py
│   │   └── integration.py
│   ├── services/         # LLM service orchestration and AI provider connectors
│   │   └── llm_service.py
│   ├── utils/            # Security utilities (CryptoUtils Fernet/SHA256) and helpers
│   │   ├── crypto.py
│   │   └── helpers.py
│   ├── main.py           # FastAPI entrypoint, CORS configuration & DB auto-seed
│   └── requirements.txt  # Python package specifications with semantic bounds
│
├── frontend/
│   ├── src/
│   │   ├── api.ts        # HTTP client & SSE stream consumer
│   │   ├── components/   # Atomic Design Hierarchy
│   │   │   ├── atoms/        # Pure UI primitives (buttons, inputs, badges)
│   │   │   ├── molecules/    # Composite units (language selector, search bars)
│   │   │   ├── organisms/    # Feature panels (ChatWindow, ProvidersHub, Analytics)
│   │   │   ├── templates/    # Layout scaffolding
│   │   │   └── pages/        # Main application views
│   │   ├── context/      # Global state (Theme, Accessibility, I18n)
│   │   ├── i18n/         # Translation dictionaries (PT, EN, ES)
│   │   │   └── translations.ts
│   │   ├── index.css     # Studio Noir design tokens & Tailwind directives
│   │   └── main.tsx      # React application root mounting
│   ├── package.json      # Node.js dependencies and scripts
│   └── vite.config.ts    # Vite bundler configuration
│
├── Procfile              # Cloud process execution descriptor
├── render.yaml           # Deployment manifest for Render
├── README.md             # Primary Portuguese documentation
└── README_EN.md          # Dedicated English documentation
```

---

## Accessibility (WCAG 2.1 AA) & Design System

The application is built on the **Studio Noir** design system, combining digital studio aesthetics with strict accessibility compliance:

- **Calibrated Color Tokens**:
  - Void Canvas: `#090C10`
  - Elevated Surfaces: `#111620` and `#161D2A`
  - Structural Outlines: `#1E2633` (crisp 1px borders)
  - Primary Accents: Electric Cobalt (`#3B82F6`) and Status Emerald (`#10B981`)
- **Universal Accessibility**:
  - Full keyboard navigation and semantic HTML markup.
  - High-Contrast mode meeting WCAG 2.1 AA contrast requirements.
  - Accessible Reading Typography mode to mitigate cognitive reading fatigue.
  - Responsive relative font scaling without layout clipping or overflow.

---

## About the Author

**Filipi Soares**  
*Designer-Minded Developer | Full Stack & Creative Engineering*

Full stack software engineer focused on uniting **robust system architecture** with **refined art direction and visual craft**. Experienced in developing high-throughput web applications, integrating generative AI systems, and creating scalable digital products.

- **LinkedIn:** [linkedin.com/in/filipiss](https://www.linkedin.com/in/filipiss/)
- **GitHub:** [@Filipiss](https://github.com/Filipiss)
- **Project Repository:** [github.com/Filipiss/chatbot-ia](https://github.com/Filipiss/chatbot-ia)

---

Distributed under the MIT License. Built with technical rigor, clean code principles, and enterprise-grade software standards.
