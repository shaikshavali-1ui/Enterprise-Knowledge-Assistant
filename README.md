# 🌐 Enterprise Knowledge Assistant — AI-Powered Enterprise Knowledge & Automated Communications Platform

![License](https://img.shields.io/badge/License-MIT-blue.svg)
![React](https://img.shields.io/badge/Frontend-React%2018%20%7C%20Vite%20%7C%20TailwindCSS-blueviolet)
![Node.js](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express-brightgreen)
![RAG Engine](https://img.shields.io/badge/AI-RAG%20Vector%20Store-orange)
![Security](https://img.shields.io/badge/Security-6--Digit%20OTP%20%7C%20Strict%20RBAC-emerald)

An **Enterprise-Grade Knowledge Management, AI Retrieval-Augmented Generation (RAG), and Automated Communications System**. **Enterprise Knowledge Assistant** empowers organizations to securely ingest company documents, perform context-aware AI query answering with exact source citations, automate employee onboarding with 6-digit OTP verification, handle 5-step leave approvals via email, publish company announcements with recipient validation & auto-skip rules, and enforce strict Role-Based Access Control (RBAC).

---

## 🌟 Key System Features

### 🧠 1. AI Retrieval-Augmented Generation (RAG) & Vector Search Engine
- **Context-Aware AI Workspace**: Submit natural language queries across corporate knowledge bases and receive accurate answers powered by vector similarity chunk indexing.
- **Source Attribution & Citation Modal**: Transparent AI responses with direct source file links, snippet previews, security clearance requirements, and confidence metrics.
- **Document Chunking & Vector Ingestion**: Ingests files (PDF, TXT, DOCX), extracts text content, and indexes chunk embeddings for fast RAG retrieval.

### 🔐 2. Corporate Access Control & Mandatory 6-Digit OTP Onboarding
- **Strict Directory Guard**: Access is strictly restricted to onboarded employees in the company directory. Unknown emails attempting to sign in are blocked with a clear security warning.
- **11-Field Employee Onboarding Form**: Admin/HR provisions personnel by specifying Employee ID, Full Name, Corporate Email, Phone Number, Department, Designation, System Role, Security Clearance Level, Date of Joining, and Account Status.
- **Compulsory 6-Digit OTP Email Verification**:
  1. Submitting the onboarding form provisions the employee as `Pending OTP Verification` (`emailVerified: false`).
  2. A 6-digit OTP verification code is generated and dispatched to the employee's corporate email inbox via Nodemailer SMTP.
  3. The employee enters their email on the login screen and inputs the 6-digit OTP code to verify their account (`emailVerified: true`, `status: Active`).
  4. Only after verifying the OTP is the person officially added to the website members list and granted access to platform modules.

### 🌴 3. 5-Step Interactive Leave Approval Workflow
1. **Employee Submission**: Employee submits a leave request specifying leave type, start/end dates, and reason (Status set to `Pending`).
2. **Automated SMTP Notification**: Backend auto-sends an interactive notification email to HR containing direct `✓ Approve` and `✕ Reject` links.
3. **HR Approver Review**: HR reviews the request directly via the email action link or inside the HR Portal.
4. **Database Status Update**: Backend updates the request status, reviewer timestamp, and optional rejection reason notes.
5. **Final Decision Email**: Auto-dispatches a final decision notification email to the employee.

### 📢 4. Company Announcement Setup with Recipient Validation & Auto-Skip Rules
- **Target Recipient Groups**: Publish announcements to `All Organization Staff`, `Department Managers`, or `Engineering Division`.
- **Strict Email Address Field Validation**:
  - Validates each employee's email address in the targeted group.
  - Sends emails **ONLY** to employees with valid email addresses containing `@`.
  - **Auto-Skips** personnel with missing, empty (`""`), `null`, `undefined`, or invalid email fields (e.g. `Kumar`).
- **Real-Time Summary & Audit Breakdown**:
  - Displays: `Announcement Published Successfully! 📧 Emails sent: X | ⚠️ Skipped: Y employees without email addresses`.
  - Generates a full Recipient Action Audit Breakdown table detailing each employee's name, email, and action (`✅ Send` vs `⚠️ Skip`).

### 🛡️ 5. Role-Based Access Control (RBAC) & Persona Simulator
- **Hierarchical Authority Levels**:
  - 🔑 **Admin / System Admin**: Full system control, document security overrides, user audit access.
  - ⭐ **CEO**: Executive board clearance, full document visibility (Level 6).
  - 💼 **HR / HR Lead / HR Manager**: People operations, employee onboarding, leave approval workflows (Level 5).
  - 🏢 **Director**: Department management, financial reports, technical directives (Level 4).
  - 👔 **Manager**: Team oversight, operations, leave reviews (Level 3).
  - 👥 **Team Lead**: Engineering specifications, sprint reviews (Level 2).
  - 🌍 **Employee**: Standard user clearance, public policy documents (Level 1).
- **Persona Simulator**: Authenticate and switch between corporate personas in real-time to test RBAC security scoping.

---

## 🛠️ Technology Stack

| Layer | Technology / Library |
|---|---|
| **Frontend** | React 18, Vite, Vanilla CSS, Tailwind CSS, Lucide React Icons |
| **Backend** | Node.js, Express.js, CORS, Multer, JSON Web Tokens (JWT) |
| **RAG & Vector Search** | Custom Vector Store / In-Memory Embedding Indexer |
| **Email Service** | Nodemailer (Gmail / SMTP / Ethereal Transport integration) |
| **Build & Tooling** | Vite, PostCSS, Autoprefixer |

---

## 📁 Repository Structure

```
final project/
├── README.md                   # Project documentation
├── backend/                    # Express REST API Server (Port 5000)
│   ├── package.json
│   └── src/
│       ├── server.js           # Express server entry point
│       ├── config/             # Environment & SMTP configuration
│       ├── data/               # Seed data & initial user directory
│       ├── routes/             # API routes (authRoutes, docRoutes, ragRoutes, emailRoutes, leaveRoutes)
│       └── services/           # RAG Engine, VectorStore, EmailService, OTPService, LoggerService
└── frontend/                   # React 18 + Vite SPA (Port 3000)
    ├── package.json
    ├── vite.config.js          # Vite config with /api proxy to localhost:5000
    └── src/
        ├── App.jsx             # Main Application Shell & State Orchestrator
        ├── main.jsx
        ├── index.css           # Modern design system & Tailwind styles
        └── components/         # Modular feature components
            ├── LandingPage.jsx     # Corporate login & OTP verification
            ├── Dashboard.jsx       # Analytics dashboard & quick actions
            ├── AIWorkspace.jsx     # RAG document QA & knowledge workbench
            ├── ChatInterface.jsx   # Interactive AI chat assistant
            ├── DocumentManager.jsx # Document ingestion & clearance control
            ├── EmailHub.jsx        # Email automation, leave workflow & announcements
            └── RoleSimulator.jsx   # Employee Directory & Onboarding OTP modal
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

---

### Step 1: Backend Startup

1. Open a terminal and navigate to the `backend` folder:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. *(Optional)* Configure environment variables in `backend/.env`:
   ```env
   PORT=5000
   JWT_SECRET=enterprise_rag_secret_key_2026_super_secure
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_app_password
   ```

4. Start the backend server:
   ```bash
   npm run dev
   # Server runs at http://localhost:5000
   ```

---

### Step 2: Frontend Startup

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

## 📡 Key API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Backend service health check |
| `POST` | `/api/auth/send-otp` | Request 6-digit OTP for registered employee email |
| `POST` | `/api/auth/verify-otp` | Verify 6-digit OTP & sign in |
| `GET` | `/api/auth/users` | Fetch all registered employees |
| `POST` | `/api/auth/users/add` | Onboard new employee & send onboarding OTP email |
| `POST` | `/api/auth/users/verify-onboarding-otp` | Verify onboarding OTP & activate account |
| `GET` | `/api/documents` | Retrieve permitted documents based on role clearance |
| `POST` | `/api/documents/upload` | Upload & index new document into vector store |
| `POST` | `/api/rag/query` | Submit query to AI RAG vector engine |
| `POST` | `/api/email/send` | Send individual automated email via Nodemailer |
| `POST` | `/api/email/dispatch-announcement` | Dispatch announcement with email validation & skip logic |
| `GET` | `/api/leave/requests` | Fetch all leave requests |
| `POST` | `/api/leave/submit` | Submit leave request & send HR approval email |
| `POST` | `/api/leave/review` | Approve/Reject leave request & send decision email |

---

## 🔒 Pre-Seeded Corporate Directory

| Employee ID | Name | Role | Department | Clearance | Email |
|---|---|---|---|---|---|
| **EMP001** | Shaik Shavali | Admin | Executive Management | Level 6 | `shaikshavali05335@gmail.com` |
| **EMP002** | Vikram Malhotra | CEO | Executive Board | Level 6 | `ceo@enterprise.com` |
| **EMP003** | Elena Rostova | HR | Human Resources | Level 5 | `hr.manager@enterprise.com` |
| **EMP004** | Marcus Vance | Director | Engineering | Level 4 | `director@enterprise.com` |
| **EMP005** | Priya Sharma | Manager | Operations | Level 3 | `manager@enterprise.com` |
| **EMP006** | Alex Mercer | Team Lead | Software Engineering | Level 2 | `lead@enterprise.com` |
| **EMP007** | John Doe | Employee | Engineering Division | Level 1 | `dev.john@enterprise.com` |
| **EMP008** | Kumar | Employee | Operations | Level 1 | *(No Email — Auto-Skipped)* |

---

## 📄 License

Distributed under the **MIT License**.
