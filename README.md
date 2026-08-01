# 🌐 Enterprise knowledge assistant— Enterprise RAG & Automated Knowledge System

![License](https://img.shields.io/badge/License-MIT-blue.svg)
![React](https://img.shields.io/badge/Frontend-React%2018%20%7C%20Vite%20%7C%20TailwindCSS-blueviolet)
![Node.js](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express-brightgreen)
![RAG Engine](https://img.shields.io/badge/AI-RAG%20Vector%20Store-orange)

An **Enterprise-Grade Knowledge Management and AI Retrieval-Augmented Generation (RAG) Platform**. **Enterprise Knowledge Assistant** empowers organizations to securely upload internal documents, perform context-aware AI query answering with exact source citations, automate communication workflows, and enforce strict Role-Based Access Control (RBAC).

---

## 🌟 Key Features

### 🧠 1. Enterprise RAG & Vector Search Engine
- **Context-Aware AI Assistant**: Ask questions across company knowledge bases and receive accurate answers powered by vector similarity search.
- **Source Attribution & Citation Modal**: Transparent responses with direct file links, snippet previews, page numbers, and confidence metrics.
- **Smart Chunking & Indexing**: Ingests files (PDF, TXT, DOCX), extracts text, andIndexes documents with vector embeddings.

### 🛡️ 2. Role-Based Access Control (RBAC) & Role Simulator
- **Multi-Level Permissions**:
  - 👑 **Admin**: Full system control, document security overrides, user audit access.
  - 📋 **HR Manager**: Access to HR policies, employee records, onboarding docs, and template emails.
  - 💻 **Tech Lead**: Access to technical specifications, architecture blueprints, and engineering docs.
  - 👤 **Employee**: Public and department-restricted documents only.
- **Role Simulator**: Switch between corporate profiles in real-time to test access restrictions and security scoping.

### 📄 3. Document Management Suite
- **Granular Security Classifications**: Public, Internal, Confidential, Executive Only.
- **Department Tagging**: HR, Engineering, Legal, Operations, Finance.
- **Real-Time Indexing**: Instant status tracking (Uploaded, Processing, Indexed, Archiving).

### 📧 4. Automated Email Hub & Communication Workflows
- **Dynamic Template Engine**: Pre-built & customizable email templates (Onboarding, Leave Approvals, Technical Directives, Policy Updates).
- **AI-Powered Draft Generation**: Auto-fill emails based on RAG knowledge retrieval.
- **SMTP Transport**: Integrates with Nodemailer / Ethereal SMTP for live email testing and automated delivery.

### 📊 5. Compliance & Security Audit Logging
- **Real-Time Audit Trail**: Logs user actions, document views, permission breaches, and email dispatches.
- **Security Monitoring**: Track access attempts and filter events by severity (Info, Warning, Critical).

---

## 🛠️ Technology Stack

| Layer | Technology / Library |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide React Icons |
| **Backend** | Node.js, Express.js, Cors, Multer, JSON Web Tokens (JWT) |
| **RAG & Search** | Custom Vector Store / Pinecone / Supabase Vector Engine |
| **Email Service** | Nodemailer (SMTP / Ethereal integration) |
| **Build & Tooling** | Vite, PostCSS, Autoprefixer |

---

## 📁 Repository Structure

```
final project/
├── README.md                   # Project documentation
├── backend/                    # Express REST API Server
│   ├── package.json
│   └── src/
│       ├── server.js           # Server entry point (Port 5000)
│       ├── config/             # Configuration & Environment loading
│       ├── data/               # Seed data & store initialization
│       ├── routes/             # API routes (Auth, Docs, RAG, Email, Logs)
│       └── services/           # RAG Engine, VectorStore, Email, Logger
└── frontend/                   # React 18 + Vite SPA
    ├── package.json
    ├── vite.config.js          # Vite config with /api proxy to localhost:5000
    └── src/
        ├── App.jsx             # Main Application Shell & Navigation
        ├── main.jsx
        ├── index.css           # Global Tailwind CSS styles
        └── components/         # Feature components (Landing, Chat, Docs, Email, Audit)
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

---

### Step 1: Clone & Setup

Navigate to the project root directory:
```bash
cd "c:/Users/Lenovo/OneDrive/Documents/final project"
```

---

### Step 2: Backend Configuration & Startup

1. Open a terminal and navigate to the `backend` folder:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. *(Optional)* Create a `.env` file inside `backend/`:
   ```env
   PORT=5000
   JWT_SECRET=enterprise_rag_secret_key_2026_super_secure
   PINECONE_API_KEY=your_pinecone_api_key
   PINECONE_ENV=us-east-1-aws
   PINECONE_INDEX=enterprise-docs
   OPENAI_API_KEY=your_openai_api_key
   SMTP_HOST=smtp.ethereal.email
   SMTP_PORT=587
   SMTP_USER=your_smtp_user
   SMTP_PASS=your_smtp_password
   ```

4. Start the backend development server:
   ```bash
   npm run dev
   # Server runs at http://localhost:5000
   ```

---

### Step 3: Frontend Configuration & Startup

1. Open a new terminal and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   # Frontend runs at http://localhost:3000
   ```

---

## 📡 API Reference Overview

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health status check |
| `POST` | `/api/auth/login` | User authentication & JWT generation |
| `GET` | `/api/documents` | Retrieve permitted documents for role |
| `POST` | `/api/documents/upload` | Upload & index new document |
| `POST` | `/api/rag/query` | Submit natural language query to RAG engine |
| `POST` | `/api/email/send` | Send automated email via Nodemailer |
| `GET` | `/api/logs` | Fetch system audit logs |

---

## 🔒 Demo Roles & Access Matrix

| Role | Access Level | Permitted Actions |
|---|---|---|
| **Admin** | Full Access | Manage docs, run system diagnostics, view all audit logs |
| **HR Manager** | HR & Operations | Upload HR policies, send onboarding emails, view HR docs |
| **Tech Lead** | Engineering | Ingest architecture diagrams, tech stacks, API specs |
| **Employee** | Standard User | Search public knowledge base, raise queries, view public files |

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more details.
