# AI CyberGuard — Autonomous AI Cybersecurity & Incident Investigation Platform

[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg)](https://fastapi.tiangolo.com/)
[![React 18](https://img.shields.io/badge/React-18.3-61DAFB.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-3178C6.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC.svg)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Simulation Mode](https://img.shields.io/badge/Security-Safe%20Simulation%20Mode-emerald.svg)](#safety--simulation-guarantee)

> **"Most security tools show hundreds of disconnected alerts. AI CyberGuard correlates those events, detects behavioral anomalies, and reconstructs the probable attack chain in real time."**

---

## 1. System Overview

Modern Security Operations Centers (SOCs) face severe alert fatigue caused by disparate point solutions firing isolated alarms. **AI-CyberGuard** integrates deterministic security rules, machine learning behavioral anomaly detection (Isolation Forest), automated multi-event correlation, graph-based attack storytelling, and AI-assisted investigation with safe response simulations.

```
Security Telemetry
       │
       ▼
Rule Detection + ML Anomaly Detection (Isolation Forest)
       │
       ▼
Sliding Temporal & Entity Correlation
       │
       ▼
Attack Story Graph & Timeline Synthesis
       │
       ▼
AI Investigation Layer (LLM + Deterministic Reasoning Fallback)
       │
       ▼
Response Recommendation & Human Approval Gates
       │
       ▼
Safe Defensive Response Simulation & Audit Logging
```

---

## 2. Architecture & Core Capabilities

### 🔐 Authentication, RBAC & Session Security
- **Cryptographic Hashing:** PBKDF2-HMAC-SHA256 (100,000 iterations) with unique per-user salts.
- **Token Security:** HMAC-SHA256 JWT access tokens with refresh token rotation and instant revocation.
- **Enterprise SOC Roles:**
  - `ADMIN`: Full configuration, user administration, and containment execution.
  - `INCIDENT_COMMANDER`: Containment response approval, incident state management, and reporting.
  - `SOC_ANALYST`: Incident investigation, AI Q&A, and telemetry analysis.
  - `VIEWER`: Read-only telemetry and audit log inspection.
- **Session Intelligence:** Active session registry with impossible travel detection and brute-force lockout rate limiting.

### 🧠 ML Anomaly Detection (Isolation Forest)
- Multivariate behavioral feature extractor evaluating login frequency, time-of-day sin/cos distribution, unseen IP/device indicators, and API rate multipliers.
- Isolation Forest scoring model with statistical distance fallback.
- Explicit `INSUFFICIENT_DATA` baseline status to prevent false anomalies for new employees.

### ⚡ Real-Time WebSockets (`/api/ws/stream`)
- Full-duplex WebSocket stream broadcasting live telemetry (`NEW_EVENT`), high-risk alarms (`THREAT_ALERT`), and containment actions (`CONTAINMENT_ACTION`).
- Auto-reconnecting frontend subscriber with live pulse badge.

### 🛡️ Prompt Injection Defense & AI Safety
- Strict isolation of System Directives from untrusted telemetry evidence.
- Heuristic regex guardrails neutralizing prompt instruction override attempts in security logs.
- Evidence-grounded distinction between `FACT`, `INFERENCE`, `RECOMMENDATION`, and `UNCERTAINTY`.

### 🎯 8 Realistic Scenario Simulations (`/api/scenarios`)
1. **Scenario A:** Account Takeover & Production Database Dump (`Critical / 91`)
2. **Scenario B:** Benign Traveling Employee / False Positive (`Low / 15`)
3. **Scenario C:** Privilege Escalation & LSASS Dump (`High / 75`)
4. **Scenario D:** API Rate Anomaly & Burst Scraping (`Medium / 45`)
5. **Scenario E:** Sensitive Data Exfiltration Indicator (`High / 70`)
6. **Scenario F:** Normal Routine Employee Activity (`Benign / 0`)
7. **Scenario G:** LLM Service Outage (Deterministic Fallback)
8. **Scenario H:** New Employee with Insufficient Baseline

---

## 3. Quick Start Guide

### Local Development Setup

#### 1. Backend Server
```bash
# From workspace root
pip install -r backend/requirements.txt
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```
API Documentation: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

#### 2. Frontend Application
```bash
cd frontend
npm install
npm run dev
```
Web Application: [http://127.0.0.1:5173/](http://127.0.0.1:5173/)

### Docker Compose Deployment
```bash
docker-compose up --build
```
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8000`
- MongoDB: `mongodb://localhost:27017`

---

## 4. Demo Credentials

| Role | Username / Email | Password |
| :--- | :--- | :--- |
| **SOC Lead / Admin** | `admin@cyberguard.ai` | `admin123` |
| **Incident Commander** | `commander@cyberguard.ai` | `commander123` |
| **SOC Analyst (Tier-2)** | `analyst@cyberguard.ai` | `analyst123` |
| **Compliance Viewer** | `viewer@cyberguard.ai` | `viewer123` |

---

## 5. Automated Test Suite

Run all 25 unit, integration, and end-to-end test suites:

```bash
python -m pytest tests/ -v
```

```
tests/test_ai_and_response.py ....        PASSED
tests/test_auth_and_features.py ........  PASSED
tests/test_correlation.py ....            PASSED
tests/test_demo_pipeline.py .             PASSED
tests/test_detection.py .....             PASSED
tests/test_scenarios.py ....              PASSED
tests/test_end_to_end.py .                PASSED

======================== 25 passed in 3.8s ========================
```

---

## 6. Implementation Status (Implemented vs Future)

### ✅ Implemented & Working in Repository
- Full 7-stage autonomous security investigation pipeline.
- PBKDF2 password hashing & JWT token rotation with session management.
- 4-Tier Role-Based Access Control (RBAC) with backend enforcement.
- ML Anomaly Detection (Isolation Forest & Statistical scoring).
- Behavioral baseline tracking with `INSUFFICIENT_DATA` safety state.
- Dynamic Attack Story Graph reconstruction with SVG nodes and edges.
- Real-Time WebSocket stream (`/api/ws/stream`).
- Cyber Threat Intelligence (CTI) enrichment (IP reputation & MITRE ATT&CK mapping).
- Prompt injection defense guardrails.
- 8 Multi-Scenario simulation generator.
- STIX 2.1 Threat Intel Bundle JSON & printable PDF incident report exports.
- Dual storage engine: Thread-safe in-memory repository with automatic MongoDB failover.
- Docker Compose, Dockerfiles, and GitHub Actions CI/CD workflows.

### ⏳ Future Scope (Not Implemented / Roadmap)
- Live firewall adapter modifications (Response actions remain strictly simulated for safety).
- Real-time Kafka / Syslog network daemon listeners.
- Real-time multi-tenant Active Directory synchronization.

---

## 7. Safety & Simulation Guarantee

> [!IMPORTANT]
> **SAFE SIMULATION ONLY:** AI-CyberGuard operates strictly in safe simulation mode.
> - All defensive response actions (`isolate_endpoint`, `revoke_session`, `reset_credentials`, `block_ip`, `notify_security_team`) produce simulated dry-run command templates.
> - No live system modifications, firewall rules, or user account locks are executed on host hardware.
