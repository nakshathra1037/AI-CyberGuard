# AI-CyberGuard — REST API Specification & WebSocket Reference

All endpoints are prefixed with `/api` unless otherwise noted.

---

## 1. Authentication Endpoints

### `POST /api/auth/login`
Authenticates a user and issues JWT access and refresh tokens.

**Request Body:**
```json
{
  "username": "admin",
  "password": "Password123!"
}
```

**Response (`200 OK`):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "user_id": "usr-admin-001",
    "username": "admin",
    "role": "ADMIN",
    "email": "admin@cyberguard.local"
  }
}
```

### `POST /api/auth/refresh`
Refreshes an expired access token using a valid refresh token.

### `POST /api/auth/logout`
Revokes active JWT tokens and terminates the current session.

### `GET /api/auth/me`
Retrieves the profile and role details of the authenticated caller.

---

## 2. Security Telemetry & Event Ingestion

### `POST /api/events`
Ingests a single normalized security telemetry event.

**Request Body:**
```json
{
  "event_id": "evt-login-fail-001",
  "timestamp": "2026-09-19T10:00:00Z",
  "event_type": "AUTH_FAILURE",
  "user_id": "alice.smith",
  "device_id": "DEV-CORP-981",
  "session_id": "sess-unknown",
  "source_ip": "198.51.100.44",
  "destination_ip": "10.0.0.1",
  "resource": "auth-service",
  "action": "login",
  "severity": "MEDIUM",
  "source": "okta-logs",
  "metadata": {
    "reason": "bad_password",
    "attempt_count": 4
  }
}
```

**Response (`200 OK`):**
```json
{
  "status": "success",
  "event_id": "evt-login-fail-001",
  "risk_score": 65,
  "ml_anomaly": true,
  "incident_id": "inc-20260919-001"
}
```

### `GET /api/events`
Returns paginated list of ingested events with optional filtering by `user_id`, `severity`, and `event_type`.

---

## 3. Incident Management & Correlation

### `GET /api/incidents`
Returns a list of all correlated security incidents.

### `GET /api/incidents/{incident_id}`
Returns complete incident details including timeline, affected assets, MITRE ATT&CK techniques, risk breakdown, and audit records.

### `POST /api/incidents/{incident_id}/investigate`
Triggers an AI-assisted investigation producing structured reasoning (`FACT`, `INFERENCE`, `RECOMMENDATION`, `UNCERTAINTY`).

---

## 4. Response Actions & Containment

### `POST /api/incidents/{incident_id}/recommend_actions`
Generates containment recommendations for the incident.

### `POST /api/incidents/{incident_id}/approve_action`
Approves or rejects a pending response action (`ADMIN` or `INCIDENT_COMMANDER` role required).

**Request Body:**
```json
{
  "action_id": "act-revoke-sess-1",
  "decision": "APPROVED",
  "notes": "Authorized containment following credential brute force."
}
```

---

## 5. Threat Intelligence (CTI)

### `GET /api/intelligence/ip/{ip_address}`
Queries reputation, threat score, abuse reports, and geolocation for an IP indicator.

---

## 6. Simulation Scenarios

### `GET /api/scenarios`
Lists available pre-packaged demo scenarios (`account_takeover`, `privilege_escalation`, `api_abuse`, `data_exfiltration`, `false_positive`, `normal_user`, `ml_failure`, `llm_failure`).

### `POST /api/scenarios/{scenario_id}/execute`
Injects simulated telemetry events sequentially to demonstrate the end-to-end detection, correlation, and response pipeline.

---

## 7. Reporting

### `GET /api/incidents/{incident_id}/report`
Generates a structured Incident Report (JSON format).

### `GET /api/incidents/{incident_id}/stix`
Exports the incident as a STIX 2.1 Threat Report Bundle.

---

## 8. WebSocket Stream

### `WS /api/ws/stream`
Full-duplex WebSocket streaming real-time security events, threat detections, and incident updates.

**Sample Message Payload:**
```json
{
  "type": "NEW_EVENT",
  "data": {
    "event_id": "evt-9821",
    "event_type": "SUSPICIOUS_COMMAND",
    "severity": "HIGH",
    "timestamp": "2026-09-19T10:04:12Z"
  }
}
```
