# AI CyberGuard — Autonomous AI Cybersecurity & Incident Investigation

[![Python 3.12](https://img.shields.io/badge/Python-3.12-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg)](https://fastapi.tiangolo.com/)
[![React 18](https://img.shields.io/badge/React-18.3-61DAFB.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-3178C6.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC.svg)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Simulation Mode](https://img.shields.io/badge/Security-Safe%20Simulation%20Mode-emerald.svg)](#safety--simulation-disclaimer)

> **"Most security tools show hundreds of disconnected alerts. AI CyberGuard correlates those events and reconstructs what probably happened."**

---

## 1. Problem Being Solved

Modern Security Operations Centers (SOCs) face **extreme alert fatigue**:
- Disparate monitoring systems (EDR, Firewalls, Active Directory, Cloud logs) fire hundreds of isolated alerts.
- Security analysts must manually correlate timestamps, user accounts, and hostnames to infer the attack path.
- Traditional alert triage is slow, prone to oversight, and delays containment while adversaries pivot laterally toward high-value databases.

**AI CyberGuard** solves this by autonomously executing a unified 7-stage security investigation pipeline:
```
DETECT → CORRELATE → EXPLAIN → INVESTIGATE → RESPOND → REPORT → LEARN
```

---

## 2. Core Architecture

```
                               ┌────────────────────────┐
                               │ Security Events Stream │
                               │ (EDR, Network, Auth)   │
                               └───────────┬────────────┘
                                           │
                                           ▼
                               ┌────────────────────────┐
                               │  Event Normalization   │
                               │  (Pydantic Models)     │
                               └───────────┬────────────┘
                                           │
                                           ▼
                               ┌────────────────────────┐
                               │ Deterministic Engine   │
                               │  Risk Scoring & Rules  │
                               └───────────┬────────────┘
                                           │
                                           ▼
                               ┌────────────────────────┐
                               │ Correlation Engine     │
                               │ Entity & Temporal Clust│
                               └───────────┬────────────┘
                                           │
                                           ▼
                               ┌────────────────────────┐
                               │  Incident Creation     │
                               │  INC-1024 (Critical)   │
                               └───────────┬────────────┘
                                           │
                      ┌────────────────────┴───────────────────┐
                      ▼                                        ▼
           ┌──────────────────────┐               ┌──────────────────────┐
           │ Attack Story Graph   │               │ AI Security          │
           │ (React Flow Nodes)   │               │ Investigator (Chat)  │
           └──────────┬───────────┘               └──────────┬───────────┘
                      └────────────────────┬───────────────────┘
                                           │
                                           ▼
                               ┌────────────────────────┐
                               │ Defensive Containment  │
                               │  Response Simulator    │
                               │  (SIMULATION MODE)     │
                               └───────────┬────────────┘
                                           │
                                           ▼
                               ┌────────────────────────┐
                               │ Executive & Technical  │
                               │    Incident Report     │
                               └───────────┬────────────┘
                                           │
                                           ▼
                               ┌────────────────────────┐
                               │  Analyst Feedback &    │
                               │ Continuous Learning    │
                               └────────────────────────┘
```

---

## 3. Technology Stack

- **Backend**:
  - Python 3.12, FastAPI, Pydantic v2, Uvicorn
  - Dual Storage Engine: `InMemoryRepository` (zero-dependency automatic fallback) & `MongoRepository` (Motor / PyMongo)
  - LLM Client: OpenAI-compatible API abstraction with **built-in Deterministic Evidence Reasoning Fallback**
  - NetworkX for graph structure processing
- **Frontend**:
  - React 18, TypeScript, Vite, Tailwind CSS
  - React Flow (`reactflow`) for interactive Attack Story visualization
  - Recharts for threat intelligence & hourly volume trends
  - Lucide React for modern cybersecurity iconography

---

## 4. Repository Structure

```
AI-CyberGuard/
├── backend/
│   ├── app/
│   │   ├── main.py                  # FastAPI entrypoint, CORS, lifespan
│   │   ├── config.py                # Environment configuration settings
│   │   ├── database.py              # Repository abstractions (InMemory & Mongo)
│   │   ├── schemas/                 # Pydantic schemas (Event, Incident, AI, etc.)
│   │   ├── detection/
│   │   │   ├── baseline.py          # Deterministic corporate security baseline
│   │   │   └── risk_engine.py       # Deterministic scoring & contextual synergy
│   │   ├── correlation/
│   │   │   ├── correlator.py        # Entity & temporal event correlation
│   │   │   └── attack_story.py      # Directed graph and timeline builder
│   │   ├── ai/
│   │   │   ├── llm_client.py        # OpenAI-compatible API caller
│   │   │   ├── prompts.py           # Evidence-grounded prompt templates
│   │   │   ├── investigator.py      # AI Investigator + Deterministic Fallback
│   │   │   └── report_generator.py  # Structured Incident Report compiler
│   │   ├── response/
│   │   │   └── simulator.py         # Safe defensive containment simulator
│   │   └── routes/                  # Modular REST API endpoints
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/              # AttackStoryGraph, AIChatDrawer, Timeline, etc.
│   │   ├── pages/                   # Dashboard, Incidents, Investigation, Reports, etc.
│   │   ├── services/api.ts          # Typed REST API client
│   │   ├── types/index.ts           # TypeScript interfaces
│   │   ├── App.tsx                  # Main router and demo orchestration
│   │   └── index.css                # Tailwind CSS + Cyber glassmorphic theme
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
│
├── data/
│   └── sample_events.json           # 7 synthetic demo security events
│
├── tests/                           # Complete automated test suite
│   ├── test_detection.py
│   ├── test_correlation.py
│   ├── test_ai_and_response.py
│   └── test_demo_pipeline.py
│
├── README.md
└── .gitignore
```

---

## 5. Quick Start Guide

### Prerequisites
- Python 3.10+ (Python 3.12 recommended)
- Node.js 18+ (Node.js 20+ recommended)
- npm or yarn

### 1. Run the Backend
```bash
# Navigate to workspace root
cd AI-CyberGuard

# Install Python requirements
pip install -r backend/requirements.txt

# Start FastAPI backend server
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```
The backend API is now running at `http://127.0.0.1:8000`. Interactive documentation is available at `http://127.0.0.1:8000/docs`.

### 2. Run the Frontend
```bash
# In a separate terminal, navigate to the frontend directory
cd AI-CyberGuard/frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```
Open `http://127.0.0.1:5173/` in your browser.

---

## 6. Offline Fallback & Zero-Dependency Operation

### MongoDB Fallback
- If `MONGODB_URI` is not provided or if MongoDB is unreachable, the system automatically uses the thread-safe `InMemoryRepository`.
- **Zero setup required**: The system is 100% runnable out of the box without installing MongoDB.

### AI Investigator Fallback
- If `LLM_API_KEY` is not set or network calls fail, the platform automatically switches to its **Deterministic Evidence Reasoning Engine**.
- It parses inquiries such as:
  - *"What happened?"*
  - *"Why is this suspicious?"*
  - *"Which devices are affected?"*
  - *"What happened after the login?"*
  - *"What actions are recommended?"*
- Synthesizes accurate, evidence-cited answers using the incident's graph and risk telemetry without making external network calls.

---

## 7. Running the Full Security Demo

1. Click the **"RUN FULL SECURITY DEMO"** button in the top navigation bar or hero banner.
2. The platform automatically executes:
   - **Ingests** 7 synthetic security events (`EVT-001` through `EVT-007`).
   - **Evaluates** deterministic rules (unusual login, PowerShell spawn, LSASS credential access, lateral movement, DB query).
   - **Correlates** the alerts into a single incident (`INC-1024`: *Possible Account Compromise with Lateral Movement*).
   - **Calculates** compound risk score: **91/100 (Critical)**.
   - **Reconstructs** the interactive Attack Story: `alex` → `PC-017` → `PowerShell` → `LSASS Memory` → `FILESERVER-02` → `DB-01`.
   - **Generates** AI explanation and defensive recommendations.
   - **Executes** 5 simulated containment actions.
   - **Assembles** the comprehensive executive incident report.
   - **Redirects** to the live Investigation Workspace.

---

## 8. Automated Test Suite

Run the full automated test suite verifying detection, correlation, attack story reconstruction, AI fallback, response simulation, and the complete demo pipeline:

```bash
python -m unittest discover -s tests -p "test_*.py"
```

All 12 test suites pass with zero external dependencies in under 0.1s.

---

## 9. REST API Reference

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/health` | `GET` | Health check, storage type, and simulation status |
| `/api/events` | `GET`, `POST` | List telemetry events or ingest new event |
| `/api/events/{event_id}` | `GET` | Retrieve specific normalized event |
| `/api/detection/analyze` | `POST` | Deterministically score an event payload |
| `/api/incidents` | `GET`, `POST` | List correlated incidents or trigger correlation |
| `/api/incidents/{incident_id}` | `GET` | Get incident summary and details |
| `/api/incidents/{incident_id}/status` | `PATCH` | Update incident lifecycle status |
| `/api/incidents/{incident_id}/timeline` | `GET` | Retrieve chronological incident timeline |
| `/api/incidents/{incident_id}/evidence` | `GET` | Retrieve traceable evidence records |
| `/api/incidents/{incident_id}/attack-story`| `GET` | Retrieve Attack Story graph nodes and edges |
| `/api/ai/investigate` | `POST` | Query AI Investigator with natural language |
| `/api/ai/explain` | `POST` | Generate AI explanation of incident risk |
| `/api/ai/summarize` | `POST` | Generate executive or technical summary |
| `/api/incidents/{incident_id}/recommendations` | `GET` | Contextual response recommendations |
| `/api/response/simulate` | `POST` | Execute single simulated response action |
| `/api/response/simulate-all` | `POST` | Execute all containment actions in simulation |
| `/api/incidents/{incident_id}/response-history`| `GET` | View audit log of executed simulations |
| `/api/reports/{incident_id}` | `GET` | Retrieve structured Incident Report |
| `/api/feedback` | `POST`, `GET` | Submit analyst verdict & continuous learning |
| `/api/intelligence/trends` | `GET` | Hourly event and incident volume trends |
| `/api/intelligence/patterns` | `GET` | Recurring threat pattern signatures |
| `/api/intelligence/statistics` | `GET` | SOC operational intelligence metrics |
| `/api/demo/run` | `POST` | One-click execution of complete demo pipeline |
| `/api/demo/reset` | `POST` | Reset environment to clean baseline |

---

## 10. Safety & Simulation Disclaimer

> [!IMPORTANT]
> **SAFE SIMULATION ONLY**: AI CyberGuard is defensive cybersecurity software designed strictly for safe demonstration, evaluation, and SOC analyst training.
> - All defensive response actions (`isolate_endpoint`, `revoke_session`, `reset_credentials`, `block_ip`, `notify_security_team`) are **pure simulations**.
> - The application **NEVER** modifies real firewalls, active directory users, endpoints, or network interfaces.
> - All security events are synthetic and harmless.
> - The application clearly indicates `SIMULATION MODE` across all user interfaces and API responses.
