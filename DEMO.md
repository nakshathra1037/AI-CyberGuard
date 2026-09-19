# AI-CyberGuard — Jury & Evaluator Demo Walkthrough

This document provides a step-by-step walkthrough for evaluating the AI-CyberGuard platform, specifically demonstrating the signature **Account Takeover & Autonomous SOC Investigation** flow.

---

## 1. Quick Launch (30 Seconds)

### Step 1: Start Backend & Frontend
Ensure the backend and frontend are running:
```bash
# Terminal 1: Backend
cd backend
python -m uvicorn app.main:app --reload --port 8000

# Terminal 2: Frontend
cd frontend
npm run dev
```
Open **http://localhost:5173** in your browser.

---

## 2. Walkthrough: The Signature "Account Takeover" Story

### Phase 1: Authentication & Role Selection
1. Navigate to the **Login** screen (`/login`).
2. Click the quick-fill button **"Admin (Full Access)"** or enter:
   - **Username:** `admin`
   - **Password:** `Password123!`
3. Click **Sign In to Security Portal**. The authenticated session is established with the `ADMIN` role badge displayed in the navbar.

---

### Phase 2: Live Attack Simulation Injection
1. On the **SOC Executive Overview** dashboard, look at the top action bar.
2. Click **"Run Scenario"** or navigate to the **Scenarios** tab.
3. Select **"Scenario A — Account Takeover"** and click **"Execute Attack Simulation"**.
4. Observe the sequential telemetry generation:
   - `09:41:00` — Multiple consecutive `AUTH_FAILURE` events from an unknown external IP (`198.51.100.44`).
   - `09:43:00` — Successful `AUTH_SUCCESS` login for user `alice.smith`.
   - `09:44:00` — `UNUSUAL_IP` and `DEVICE_CHANGE` events triggered.
   - `09:45:00` — `SENSITIVE_RESOURCE_ACCESS` to `/api/v1/financial-records`.
   - `09:46:00` — `SUSPICIOUS_COMMAND` attempting privilege escalation.

---

### Phase 3: Detection, ML Anomaly Scoring & Correlation
1. The **WebSocket Live Stream** broadcasts incoming events in real-time.
2. The **Isolation Forest ML Model** flags anomalous login timing and unseen device signatures.
3. The **Event Correlator** groups these multi-stage events into a single cohesive security incident: **`Possible Account Takeover - alice.smith`**.
4. The **Risk Engine** computes a high-severity score (e.g., 85/100) with contextual synergy weights.

---

### Phase 4: AI-Assisted Investigation & MITRE ATT&CK Mapping
1. Click on the newly generated incident in the **Active Incidents** list.
2. Review the structured AI investigation card:
   - **FACT:** Unverifiable claims are omitted; log timestamps and IPs are cited directly.
   - **INFERENCE:** Deduced credential compromise following rapid brute-force pattern.
   - **MITRE MAPPING:** T1110 (Brute Force) & T1078 (Valid Accounts).
   - **UNCERTAINTY:** Explicitly notes if the attacker obtained credentials via phish or credential stuffing.
3. Inspect the dynamic **Attack Story Graph** visualising nodes (`alice.smith` → `Session` → `198.51.100.44` → `/financial-records`).

---

### Phase 5: Human-in-the-Loop Approval & Simulated Response
1. Under **Recommended Response Actions**, see pending containment recommendations:
   - `REVOKE_SESSION` (Session `sess-compromised-99`)
   - `BLOCK_IP` (`198.51.100.44`)
   - `REQUIRE_REAUTH` (`alice.smith`)
2. Click **"Approve Containment Action"**.
3. The response engine validates permissions (`ADMIN`), executes the non-destructive containment simulation, and transitions the action status to `EXECUTED`.
4. Check the **Audit Trail** table at the bottom of the incident page to verify the tamper-evident audit record.

---

### Phase 6: Executive Reporting & STIX 2.1 Export
1. Click **"Generate Report"** in the incident header.
2. Review the formatted Executive and Technical briefs.
3. Click **"Download STIX 2.1 JSON"** to inspect the industry-standard threat intelligence bundle.
4. Click **"Print / Export PDF"** to preview the printable compliance report.

---

## 3. Testing Alternative Scenarios

You can also test resilience and edge cases via the Scenarios panel:
- **Scenario B — False Positive:** Routine login from a new coffee shop IP — correctly classified with low risk without false alarm.
- **Scenario C — Privilege Escalation:** Non-admin user attempting sensitive role assignment.
- **Scenario D — API Abuse / Spike:** High-volume automated endpoint scraping.
- **Scenario G/H — ML/LLM Graceful Fallbacks:** Demonstrating offline operation when ML models or cloud APIs are disconnected.
