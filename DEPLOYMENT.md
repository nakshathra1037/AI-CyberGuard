# AI-CyberGuard — Deployment Guide

This guide covers deployment options for the AI-CyberGuard platform, from local development to production Docker containers and Kubernetes clusters.

---

## 1. Quick Start with Docker Compose

The simplest way to spin up the complete AI-CyberGuard stack (FastAPI Backend, React Frontend, and MongoDB) is with Docker Compose.

### Prerequisites
- Docker (v24.0+)
- Docker Compose (v2.20+)

### Launching the Stack
```bash
# 1. Clone the repository
git clone https://github.com/nakshathra1037/AI-CyberGuard.git
cd AI-CyberGuard

# 2. Configure environment
cp .env.example .env

# 3. Build and launch all services
docker compose up --build -d

# 4. Access the applications
# Frontend Dashboard: http://localhost:5173
# Backend API Docs:   http://localhost:8000/docs
```

---

## 2. Local Manual Development Setup

### Backend (Python / FastAPI)
```bash
cd backend
python -m venv venv
# On Linux/macOS:
source venv/bin/activate
# On Windows PowerShell:
.\venv\Scripts\Activate.ps1

pip install -r requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Frontend (React / Vite / Tailwind)
```bash
cd frontend
npm install
npm run dev
```

---

## 3. Environment Configuration (`.env`)

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `DATABASE_URL` | `mongodb://localhost:27017` | MongoDB connection URI (falls back to in-memory if unreachable) |
| `DATABASE_NAME` | `cyberguard` | MongoDB database name |
| `JWT_SECRET` | `cyberguard-super-secret-key-change-in-prod` | Secret key for JWT signature validation |
| `JWT_ACCESS_EXPIRY` | `15` | Access token lifespan in minutes |
| `JWT_REFRESH_EXPIRY` | `10080` | Refresh token lifespan in minutes (7 days) |
| `ENABLE_LIVE_ACTIONS` | `false` | When false, containment actions are non-destructively simulated |
| `LLM_PROVIDER` | `deterministic` | Options: `openai`, `gemini`, `ollama`, `deterministic` |
| `LLM_API_KEY` | `""` | API key if using cloud LLM providers |
| `CTI_API_KEY` | `""` | Optional AbuseIPDB / VirusTotal API key |
| `CORS_ORIGINS` | `http://localhost:5173,http://localhost:3000` | Allowed origins for CORS requests |

---

## 4. Production Hardening Checklist

- [x] Change `JWT_SECRET` to a high-entropy 256-bit random string.
- [x] Ensure `ENABLE_LIVE_ACTIONS` is set to `false` unless explicit infrastructure webhooks are configured.
- [x] Place backend behind a TLS reverse proxy (e.g., NGINX / Cloudflare).
- [x] Enable rate limiting and IP allowlisting on `/api/events` ingestion endpoints.
- [x] Configure persistent volume storage for MongoDB database files.
