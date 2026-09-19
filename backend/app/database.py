import logging
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
import asyncio

logger = logging.getLogger("ai_cyberguard.database")


class BaseRepository:
    """Abstract interface for storage operations"""
    async def init_db(self):
        pass

    async def get_storage_type(self) -> str:
        raise NotImplementedError


class InMemoryRepository(BaseRepository):
    """Zero-dependency in-memory thread-safe repository with seeded security intelligence"""
    def __init__(self):
        self._events: Dict[str, Dict[str, Any]] = {}
        self._incidents: Dict[str, Dict[str, Any]] = {}
        self._investigations: List[Dict[str, Any]] = []
        self._response_actions: Dict[str, List[Dict[str, Any]]] = {}  # incident_id -> actions
        self._feedback: List[Dict[str, Any]] = []
        self._patterns: Dict[str, Dict[str, Any]] = {}
        self._lock = asyncio.Lock()
        self._seed_default_patterns()
        self._seed_default_data()

    def _seed_default_data(self):
        seed_events = [
            {
                "event_id": "EVT-9001",
                "timestamp": "2026-09-19T09:41:12Z",
                "event_type": "AUTH_FAILURE",
                "user_id": "alice.smith",
                "user": "alice.smith",
                "device_id": "DEV-CORP-017",
                "device": "DEV-CORP-017",
                "source_ip": "198.51.100.44",
                "resource": "auth-service",
                "action": "login",
                "status": "failed",
                "severity": "HIGH",
                "description": "4 consecutive failed login attempts detected in 30s",
                "risk_score": 35,
                "triggered_rules": ["RULE-CRED-01: Rapid Authentication Failure Cluster"],
                "metadata": {"attempt_count": 4, "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
            },
            {
                "event_id": "EVT-9002",
                "timestamp": "2026-09-19T09:43:08Z",
                "event_type": "AUTH_SUCCESS",
                "user_id": "alice.smith",
                "user": "alice.smith",
                "device_id": "DEV-CORP-017",
                "device": "DEV-CORP-017",
                "source_ip": "198.51.100.44",
                "resource": "auth-service",
                "action": "login",
                "status": "success",
                "severity": "LOW",
                "description": "Successful password authentication after failures",
                "risk_score": 10,
                "triggered_rules": [],
                "metadata": {"auth_method": "password", "session_id": "sess-compromised-99"}
            },
            {
                "event_id": "EVT-9003",
                "timestamp": "2026-09-19T09:44:31Z",
                "event_type": "UNUSUAL_IP",
                "user_id": "alice.smith",
                "user": "alice.smith",
                "device_id": "DEV-UNKNOWN-98",
                "device": "DEV-UNKNOWN-98",
                "source_ip": "198.51.100.44",
                "resource": "corporate-vpn",
                "action": "session_bind",
                "status": "success",
                "severity": "HIGH",
                "description": "Active session bound to previously unseen external IP 198.51.100.44",
                "risk_score": 45,
                "triggered_rules": ["RULE-IP-02: Unseen External IP with Privileged Session"],
                "metadata": {"country": "Romania", "asn": "AS49349", "threat_score": 78}
            },
            {
                "event_id": "EVT-9004",
                "timestamp": "2026-09-19T09:44:50Z",
                "event_type": "DEVICE_CHANGE",
                "user_id": "alice.smith",
                "user": "alice.smith",
                "device_id": "DEV-UNKNOWN-98",
                "device": "DEV-UNKNOWN-98",
                "source_ip": "198.51.100.44",
                "resource": "iam-directory",
                "action": "device_register",
                "status": "alert",
                "severity": "HIGH",
                "description": "Hardware device fingerprint mismatch with baseline profile",
                "risk_score": 40,
                "triggered_rules": ["RULE-DEV-03: Unrecognized Device Hardware Fingerprint"],
                "metadata": {"os": "Linux x86_64", "browser": "HeadlessChrome"}
            },
            {
                "event_id": "EVT-9005",
                "timestamp": "2026-09-19T09:45:15Z",
                "event_type": "SUSPICIOUS_COMMAND",
                "user_id": "alice.smith",
                "user": "alice.smith",
                "device_id": "DEV-UNKNOWN-98",
                "device": "DEV-UNKNOWN-98",
                "source_ip": "198.51.100.44",
                "resource": "powershell.exe",
                "action": "execute",
                "status": "alert",
                "severity": "CRITICAL",
                "description": "Obfuscated PowerShell memory read command executed",
                "risk_score": 70,
                "triggered_rules": ["RULE-CMD-05: Suspicious PowerShell / System Shell Execution"],
                "metadata": {"command_line": "powershell.exe -enc SQBFAFgA... -bypass", "pid": 4820}
            },
            {
                "event_id": "EVT-9006",
                "timestamp": "2026-09-19T09:45:40Z",
                "event_type": "SENSITIVE_RESOURCE_ACCESS",
                "user_id": "alice.smith",
                "user": "alice.smith",
                "device_id": "DEV-UNKNOWN-98",
                "device": "DEV-UNKNOWN-98",
                "source_ip": "198.51.100.44",
                "resource": "/api/v1/financial-records/wire-transfers",
                "action": "api_query",
                "status": "success",
                "severity": "CRITICAL",
                "description": "Direct unconstrained query on confidential wire transfer database",
                "risk_score": 65,
                "triggered_rules": ["RULE-API-04: Sensitive Financial/Admin Endpoint Access"],
                "metadata": {"endpoint": "/api/v1/financial-records", "records_requested": 5000}
            },
            {
                "event_id": "EVT-9007",
                "timestamp": "2026-09-19T09:46:10Z",
                "event_type": "DATABASE_ACCESS",
                "user_id": "alice.smith",
                "user": "alice.smith",
                "device_id": "DB-FINANCE-01",
                "device": "DB-FINANCE-01",
                "source_ip": "198.51.100.44",
                "resource": "DB-FINANCE-01",
                "action": "SELECT",
                "status": "success",
                "severity": "CRITICAL",
                "description": "Bulk exfiltration query executed on database table 'customer_accounts'",
                "risk_score": 85,
                "triggered_rules": ["RULE-API-04: Sensitive Financial/Admin Endpoint Access"],
                "metadata": {"database": "DB-FINANCE-01", "table": "customer_accounts", "rows_returned": 14200}
            }
        ]
        for ev in seed_events:
            self._events[ev["event_id"]] = ev

        inc_1024 = {
            "incident_id": "INC-1024",
            "title": "Possible Account Takeover & Financial Data Exfiltration",
            "type": "account_takeover",
            "severity": "critical",
            "risk_score": 88,
            "status": "investigating",
            "affected_user": "alice.smith",
            "affected_users": ["alice.smith"],
            "affected_devices": ["DEV-CORP-017", "DEV-UNKNOWN-98", "DB-FINANCE-01"],
            "event_ids": [e["event_id"] for e in seed_events],
            "affected_assets": {
                "users": ["alice.smith"],
                "devices": ["DEV-CORP-017", "DEV-UNKNOWN-98"],
                "servers": ["auth-service", "corporate-vpn"],
                "databases": ["DB-FINANCE-01"],
                "ips": ["198.51.100.44"]
            },
            "timeline": [
                {
                    "timestamp": "2026-09-19T09:41:12Z",
                    "event_id": "EVT-9001",
                    "event_type": "AUTH_FAILURE",
                    "description": "4 failed login attempts from external IP 198.51.100.44",
                    "risk_contribution": 25,
                    "relationship_to_incident": "Initial Brute Force Access Attempt",
                    "source": "198.51.100.44",
                    "destination": "auth-service"
                },
                {
                    "timestamp": "2026-09-19T09:43:08Z",
                    "event_id": "EVT-9002",
                    "event_type": "AUTH_SUCCESS",
                    "description": "Valid authentication established session sess-compromised-99",
                    "risk_contribution": 10,
                    "relationship_to_incident": "Credential Compromise / Login Success",
                    "source": "198.51.100.44",
                    "destination": "auth-service"
                },
                {
                    "timestamp": "2026-09-19T09:44:31Z",
                    "event_id": "EVT-9003",
                    "event_type": "UNUSUAL_IP",
                    "description": "Session active on unseen Romanian IP 198.51.100.44",
                    "risk_contribution": 20,
                    "relationship_to_incident": "Egress/Ingress Anomaly",
                    "source": "198.51.100.44",
                    "destination": "corporate-vpn"
                },
                {
                    "timestamp": "2026-09-19T09:44:50Z",
                    "event_id": "EVT-9004",
                    "event_type": "DEVICE_CHANGE",
                    "description": "Session transferred to Linux hardware signature",
                    "risk_contribution": 20,
                    "relationship_to_incident": "Device Identity Drift",
                    "source": "DEV-UNKNOWN-98",
                    "destination": "iam-directory"
                },
                {
                    "timestamp": "2026-09-19T09:45:15Z",
                    "event_id": "EVT-9005",
                    "event_type": "SUSPICIOUS_COMMAND",
                    "description": "PowerShell execution with base64 encoded payload",
                    "risk_contribution": 35,
                    "relationship_to_incident": "Memory & Token Harvest",
                    "source": "DEV-UNKNOWN-98",
                    "destination": "powershell.exe"
                },
                {
                    "timestamp": "2026-09-19T09:46:10Z",
                    "event_id": "EVT-9007",
                    "event_type": "DATABASE_ACCESS",
                    "description": "Bulk SQL query executed on customer wire transfers",
                    "risk_contribution": 26,
                    "relationship_to_incident": "Data Exfiltration Impact",
                    "source": "198.51.100.44",
                    "destination": "DB-FINANCE-01"
                }
            ],
            "evidence": [
                {
                    "event_id": "EVT-9001",
                    "timestamp": "2026-09-19T09:41:12Z",
                    "event_type": "AUTH_FAILURE",
                    "description": "4 consecutive failed password attempts on Okta gateway",
                    "risk_contribution": 25,
                    "source": "198.51.100.44",
                    "destination": "auth-service",
                    "relationship_to_incident": "Credential Brute Force",
                    "metadata": {"reason": "bad_password", "attempt_count": 4}
                },
                {
                    "event_id": "EVT-9003",
                    "timestamp": "2026-09-19T09:44:31Z",
                    "event_type": "UNUSUAL_IP",
                    "description": "Unregistered external ISP IP 198.51.100.44",
                    "risk_contribution": 20,
                    "source": "198.51.100.44",
                    "destination": "corporate-vpn",
                    "relationship_to_incident": "External Network Ingress",
                    "metadata": {"reputation_score": 78, "country": "Romania"}
                },
                {
                    "event_id": "EVT-9005",
                    "timestamp": "2026-09-19T09:45:15Z",
                    "event_type": "SUSPICIOUS_COMMAND",
                    "description": "Base64 encoded PowerShell invocation",
                    "risk_contribution": 35,
                    "source": "DEV-UNKNOWN-98",
                    "destination": "powershell.exe",
                    "relationship_to_incident": "Execution Technique T1059.001",
                    "metadata": {"pid": 4820, "encoded": True}
                },
                {
                    "event_id": "EVT-9007",
                    "timestamp": "2026-09-19T09:46:10Z",
                    "event_type": "DATABASE_ACCESS",
                    "description": "14,200 wire transfer records dumped via SQL query",
                    "risk_contribution": 26,
                    "source": "198.51.100.44",
                    "destination": "DB-FINANCE-01",
                    "relationship_to_incident": "Exfiltration Target",
                    "metadata": {"records": 14200, "table": "customer_accounts"}
                }
            ],
            "attack_story": {
                "incident_id": "INC-1024",
                "summary_text": "An external entity conducted rapid credential brute-forcing against user 'alice.smith' from IP 198.51.100.44. Following a successful login, the session was bound to an unrecognized Linux workstation, spawned an encoded PowerShell execution, and queried 14,200 sensitive records on DB-FINANCE-01.",
                "stages": ["Initial Access", "Credential Abuse", "Device Drift", "Execution", "Data Access"],
                "nodes": [
                    {"id": "node-user", "label": "alice.smith", "type": "user", "details": {"role": "Finance Analyst", "dept": "Treasury"}},
                    {"id": "node-ip", "label": "198.51.100.44", "type": "ip", "details": {"country": "Romania", "reputation": "Suspicious (78%)"}},
                    {"id": "node-device", "label": "DEV-UNKNOWN-98", "type": "device", "details": {"os": "Linux x86_64", "first_seen": "Today"}},
                    {"id": "node-process", "label": "PowerShell Cradle", "type": "process", "details": {"pid": 4820, "cmd": "enc -bypass"}},
                    {"id": "node-cred", "label": "Auth Token Access", "type": "credential", "details": {"tech": "T1078 (Valid Accounts)"}},
                    {"id": "node-server", "label": "API Gateway", "type": "server", "details": {"endpoint": "/api/v1/customers"}},
                    {"id": "node-database", "label": "Financial DB-01", "type": "database", "details": {"table": "wire_transfers"}}
                ],
                "edges": [
                    {"id": "e1", "source": "node-user", "target": "node-ip", "label": "logged_from"},
                    {"id": "e2", "source": "node-ip", "target": "node-device", "label": "used_device"},
                    {"id": "e3", "source": "node-device", "target": "node-process", "label": "spawned"},
                    {"id": "e4", "source": "node-process", "target": "node-cred", "label": "harvested"},
                    {"id": "e5", "source": "node-cred", "target": "node-server", "label": "targeted"},
                    {"id": "e6", "source": "node-server", "target": "node-database", "label": "exfiltrated_from"}
                ]
            },
            "created_at": "2026-09-19T09:41:12Z",
            "updated_at": "2026-09-19T09:46:30Z"
        }
        self._incidents["INC-1024"] = inc_1024

        inc_1025 = {
            "incident_id": "INC-1025",
            "title": "Privilege Escalation & Unauthorized IAM Modification",
            "type": "privilege_escalation",
            "severity": "high",
            "risk_score": 82,
            "status": "investigating",
            "affected_user": "john.doe",
            "affected_users": ["john.doe"],
            "affected_devices": ["DEV-CORP-401"],
            "event_ids": ["EVT-9101"],
            "affected_assets": {
                "users": ["john.doe"],
                "devices": ["DEV-CORP-401"],
                "servers": ["iam-service"],
                "databases": [],
                "ips": ["10.0.4.19"]
            },
            "timeline": [
                {
                    "timestamp": "2026-09-19T08:15:00Z",
                    "event_id": "EVT-9101",
                    "event_type": "PRIVILEGE_CHANGE",
                    "description": "Standard user role elevated to Domain Administrator",
                    "risk_contribution": 45,
                    "relationship_to_incident": "IAM Role Modification",
                    "source": "DEV-CORP-401",
                    "destination": "iam-service"
                }
            ],
            "evidence": [],
            "created_at": "2026-09-19T08:15:00Z",
            "updated_at": "2026-09-19T08:18:00Z"
        }
        self._incidents["INC-1025"] = inc_1025

        inc_1026 = {
            "incident_id": "INC-1026",
            "title": "Automated API Scraping & Credential Stuffing Surge",
            "type": "api_abuse",
            "severity": "high",
            "risk_score": 76,
            "status": "contained",
            "affected_user": "external_crawler",
            "affected_users": ["external_crawler"],
            "affected_devices": ["API-GATEWAY-01"],
            "event_ids": ["EVT-9201"],
            "affected_assets": {
                "users": ["external_crawler"],
                "devices": ["API-GATEWAY-01"],
                "servers": ["API-GATEWAY-01"],
                "databases": [],
                "ips": ["45.33.32.156"]
            },
            "timeline": [],
            "evidence": [],
            "created_at": "2026-09-19T07:30:00Z",
            "updated_at": "2026-09-19T07:45:00Z"
        }
        self._incidents["INC-1026"] = inc_1026

        self._response_actions["INC-1024"] = [
            {
                "action_id": "ACT-REVOKE-01",
                "incident_id": "INC-1024",
                "action_type": "revoke_session",
                "target": "sess-compromised-99 (alice.smith)",
                "status": "APPROVED",
                "simulation": True,
                "timestamp": "2026-09-19T09:47:00Z",
                "executed_by": "marcus.vance (ADMIN)",
                "command_simulated": "IAM.revokeSession(session_id='sess-compromised-99')"
            },
            {
                "action_id": "ACT-BLOCK-02",
                "incident_id": "INC-1024",
                "action_type": "block_ip",
                "target": "198.51.100.44",
                "status": "APPROVED",
                "simulation": True,
                "timestamp": "2026-09-19T09:47:15Z",
                "executed_by": "marcus.vance (ADMIN)",
                "command_simulated": "Firewall.addBlockRule(ip='198.51.100.44', duration='24h')"
            }
        ]

        self._investigations.append({
            "incident_id": "INC-1024",
            "question": "Why is this incident classified as High Risk?",
            "answer": "The risk calculation (88/100) is driven by a multi-vector attack chain: (1) Rapid credential brute-force failures (+25), (2) Login from an unrecorded external IP (+20), (3) Immediate device fingerprint drift (+20), and (4) Direct SQL extraction of 14,200 wire transfer records (+26).",
            "evidence_referenced": ["EVT-9001", "EVT-9003", "EVT-9004", "EVT-9007"],
            "timestamp": "2026-09-19T09:46:45Z"
        })

    def _seed_default_patterns(self):
        default_patterns = [
            {
                "pattern_id": "PAT-001",
                "pattern_signature": "unusual_login + powershell + credential_access",
                "description": "Suspicious login followed swiftly by PowerShell spawn and LSASS memory access",
                "occurrences": 4,
                "severity": "high",
                "mitre_techniques": ["T1078", "T1059.001", "T1003.001"],
                "last_observed": "2026-09-19T09:14:00Z",
                "examples_incidents": ["INC-1024", "INC-0992"]
            },
            {
                "pattern_id": "PAT-002",
                "pattern_signature": "lateral_movement + database_query",
                "description": "Internal lateral hop to file/app server immediately pivoting to sensitive DB",
                "occurrences": 2,
                "severity": "critical",
                "mitre_techniques": ["T1021.002", "T1005"],
                "last_observed": "2026-09-19T09:19:00Z",
                "examples_incidents": ["INC-1024"]
            },
            {
                "pattern_id": "PAT-003",
                "pattern_signature": "repeated_failed_logins + password_spray",
                "description": "Cluster of rapid failed logins across multiple user accounts from single external IP",
                "occurrences": 8,
                "severity": "medium",
                "mitre_techniques": ["T1110.003"],
                "last_observed": "2026-09-18T22:45:00Z",
                "examples_incidents": ["INC-1011", "INC-1018"]
            }
        ]
        for pat in default_patterns:
            self._patterns[pat["pattern_id"]] = pat

    async def get_storage_type(self) -> str:
        return "InMemoryRepository"

    # --- Events ---
    async def save_event(self, event_data: Dict[str, Any]) -> Dict[str, Any]:
        async with self._lock:
            self._events[event_data["event_id"]] = event_data
            return event_data

    async def save_events_bulk(self, events_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        async with self._lock:
            for ev in events_data:
                self._events[ev["event_id"]] = ev
            return events_data

    async def get_event(self, event_id: str) -> Optional[Dict[str, Any]]:
        return self._events.get(event_id)

    async def get_all_events(self, limit: int = 100) -> List[Dict[str, Any]]:
        return list(self._events.values())[:limit]

    # --- Incidents ---
    async def save_incident(self, incident_data: Dict[str, Any]) -> Dict[str, Any]:
        async with self._lock:
            self._incidents[incident_data["incident_id"]] = incident_data
            return incident_data

    async def get_incident(self, incident_id: str) -> Optional[Dict[str, Any]]:
        return self._incidents.get(incident_id)

    async def get_all_incidents(self) -> List[Dict[str, Any]]:
        return list(self._incidents.values())

    async def update_incident_status(self, incident_id: str, status: str, comment: Optional[str] = None) -> Optional[Dict[str, Any]]:
        async with self._lock:
            inc = self._incidents.get(incident_id)
            if not inc:
                return None
            inc["status"] = status
            inc["updated_at"] = datetime.now(timezone.utc).isoformat()
            if "status_history" not in inc:
                inc["status_history"] = []
            inc["status_history"].append({
                "status": status,
                "timestamp": inc["updated_at"],
                "comment": comment or f"Status changed to {status}"
            })
            return inc

    # --- Responses ---
    async def save_response_action(self, action_data: Dict[str, Any]) -> Dict[str, Any]:
        async with self._lock:
            inc_id = action_data["incident_id"]
            if inc_id not in self._response_actions:
                self._response_actions[inc_id] = []
            self._response_actions[inc_id].append(action_data)
            return action_data

    async def get_response_actions(self, incident_id: str) -> List[Dict[str, Any]]:
        return self._response_actions.get(incident_id, [])

    async def get_all_response_actions(self) -> List[Dict[str, Any]]:
        all_actions = []
        for acts in self._response_actions.values():
            all_actions.extend(acts)
        return all_actions

    # --- Investigations (AI Chat History) ---
    async def save_investigation_record(self, record_data: Dict[str, Any]) -> Dict[str, Any]:
        async with self._lock:
            self._investigations.append(record_data)
            return record_data

    async def get_investigation_history(self, incident_id: str) -> List[Dict[str, Any]]:
        return [r for r in self._investigations if r.get("incident_id") == incident_id]

    # --- Feedback & Learning ---
    async def save_feedback(self, feedback_data: Dict[str, Any]) -> Dict[str, Any]:
        async with self._lock:
            self._feedback.append(feedback_data)
            # Check if this confirms a threat and update patterns
            inc_id = feedback_data.get("incident_id")
            inc = self._incidents.get(inc_id)
            if inc and feedback_data.get("feedback_type") == "confirmed_threat":
                # Increment matching pattern
                for p in self._patterns.values():
                    if "unusual_login" in p["pattern_signature"]:
                        p["occurrences"] += 1
                        p["last_observed"] = datetime.now(timezone.utc).isoformat()
            return feedback_data

    async def get_all_feedback(self) -> List[Dict[str, Any]]:
        return self._feedback

    # --- Patterns ---
    async def get_all_patterns(self) -> List[Dict[str, Any]]:
        return list(self._patterns.values())

    async def upsert_pattern(self, pattern_signature: str, details: Dict[str, Any]) -> Dict[str, Any]:
        async with self._lock:
            for pid, pat in self._patterns.items():
                if pat["pattern_signature"] == pattern_signature:
                    pat["occurrences"] += 1
                    pat["last_observed"] = datetime.now(timezone.utc).isoformat()
                    return pat
            new_pid = f"PAT-00{len(self._patterns) + 1}"
            details["pattern_id"] = new_pid
            details["pattern_signature"] = pattern_signature
            details["occurrences"] = 1
            details["last_observed"] = datetime.now(timezone.utc).isoformat()
            self._patterns[new_pid] = details
            return details

    # --- Reset (for Demo Mode) ---
    async def clear_all(self):
        async with self._lock:
            self._events.clear()
            self._incidents.clear()
            self._investigations.clear()
            self._response_actions.clear()
            self._feedback.clear()
            self._patterns.clear()
            self._seed_default_patterns()


class MongoRepository(BaseRepository):
    """MongoDB implementation with connection pooling and graceful error handling"""
    def __init__(self, uri: str, db_name: str):
        self.uri = uri
        self.db_name = db_name
        self.client = None
        self.db = None

    async def init_db(self):
        from motor.motor_asyncio import AsyncIOMotorClient
        self.client = AsyncIOMotorClient(self.uri, serverSelectionTimeoutMS=2000)
        self.db = self.client[self.db_name]
        # Ping to test connection
        await self.client.admin.command('ping')
        logger.info("Successfully connected to MongoDB.")

    async def get_storage_type(self) -> str:
        return "MongoRepository"

    async def save_event(self, event_data: Dict[str, Any]) -> Dict[str, Any]:
        data = dict(event_data)
        data["_id"] = data["event_id"]
        await self.db.events.replace_one({"_id": data["_id"]}, data, upsert=True)
        return event_data

    async def save_events_bulk(self, events_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        for ev in events_data:
            await self.save_event(ev)
        return events_data

    async def get_event(self, event_id: str) -> Optional[Dict[str, Any]]:
        doc = await self.db.events.find_one({"event_id": event_id})
        if doc:
            doc.pop("_id", None)
        return doc

    async def get_all_events(self, limit: int = 100) -> List[Dict[str, Any]]:
        cursor = self.db.events.find({}).limit(limit)
        docs = await cursor.to_list(length=limit)
        for d in docs:
            d.pop("_id", None)
        return docs

    async def save_incident(self, incident_data: Dict[str, Any]) -> Dict[str, Any]:
        data = dict(incident_data)
        data["_id"] = data["incident_id"]
        await self.db.incidents.replace_one({"_id": data["_id"]}, data, upsert=True)
        return incident_data

    async def get_incident(self, incident_id: str) -> Optional[Dict[str, Any]]:
        doc = await self.db.incidents.find_one({"incident_id": incident_id})
        if doc:
            doc.pop("_id", None)
        return doc

    async def get_all_incidents(self) -> List[Dict[str, Any]]:
        cursor = self.db.incidents.find({})
        docs = await cursor.to_list(length=200)
        for d in docs:
            d.pop("_id", None)
        return docs

    async def update_incident_status(self, incident_id: str, status: str, comment: Optional[str] = None) -> Optional[Dict[str, Any]]:
        inc = await self.get_incident(incident_id)
        if not inc:
            return None
        now_str = datetime.now(timezone.utc).isoformat()
        status_entry = {
            "status": status,
            "timestamp": now_str,
            "comment": comment or f"Status changed to {status}"
        }
        await self.db.incidents.update_one(
            {"incident_id": incident_id},
            {
                "$set": {"status": status, "updated_at": now_str},
                "$push": {"status_history": status_entry}
            }
        )
        return await self.get_incident(incident_id)

    async def save_response_action(self, action_data: Dict[str, Any]) -> Dict[str, Any]:
        data = dict(action_data)
        data["_id"] = data["action_id"]
        await self.db.response_actions.replace_one({"_id": data["_id"]}, data, upsert=True)
        return action_data

    async def get_response_actions(self, incident_id: str) -> List[Dict[str, Any]]:
        cursor = self.db.response_actions.find({"incident_id": incident_id})
        docs = await cursor.to_list(length=100)
        for d in docs:
            d.pop("_id", None)
        return docs

    async def get_all_response_actions(self) -> List[Dict[str, Any]]:
        cursor = self.db.response_actions.find({})
        docs = await cursor.to_list(length=200)
        for d in docs:
            d.pop("_id", None)
        return docs

    async def save_investigation_record(self, record_data: Dict[str, Any]) -> Dict[str, Any]:
        await self.db.investigations.insert_one(dict(record_data))
        return record_data

    async def get_investigation_history(self, incident_id: str) -> List[Dict[str, Any]]:
        cursor = self.db.investigations.find({"incident_id": incident_id})
        docs = await cursor.to_list(length=100)
        for d in docs:
            d.pop("_id", None)
        return docs

    async def save_feedback(self, feedback_data: Dict[str, Any]) -> Dict[str, Any]:
        await self.db.feedback.insert_one(dict(feedback_data))
        return feedback_data

    async def get_all_feedback(self) -> List[Dict[str, Any]]:
        cursor = self.db.feedback.find({})
        docs = await cursor.to_list(length=200)
        for d in docs:
            d.pop("_id", None)
        return docs

    async def get_all_patterns(self) -> List[Dict[str, Any]]:
        cursor = self.db.patterns.find({})
        docs = await cursor.to_list(length=50)
        for d in docs:
            d.pop("_id", None)
        return docs

    async def upsert_pattern(self, pattern_signature: str, details: Dict[str, Any]) -> Dict[str, Any]:
        now_str = datetime.now(timezone.utc).isoformat()
        await self.db.patterns.update_one(
            {"pattern_signature": pattern_signature},
            {
                "$set": {"last_observed": now_str, "description": details.get("description", "")},
                "$inc": {"occurrences": 1},
                "$setOnInsert": {
                    "pattern_id": details.get("pattern_id", "PAT-AUTO"),
                    "severity": details.get("severity", "high"),
                    "mitre_techniques": details.get("mitre_techniques", [])
                }
            },
            upsert=True
        )
        doc = await self.db.patterns.find_one({"pattern_signature": pattern_signature})
        if doc:
            doc.pop("_id", None)
        return doc

    async def clear_all(self):
        await self.db.events.delete_many({})
        await self.db.incidents.delete_many({})
        await self.db.investigations.delete_many({})
        await self.db.response_actions.delete_many({})
        await self.db.feedback.delete_many({})
        await self.db.patterns.delete_many({})


# Global repository factory
_repo_instance: Optional[BaseRepository] = None


async def get_repository() -> BaseRepository:
    """Returns initialized repository instance, automatically falling back to InMemory if Mongo is unavailable"""
    global _repo_instance
    if _repo_instance is not None:
        return _repo_instance

    from backend.app.config import settings

    if settings.MONGODB_URI:
        try:
            mongo_repo = MongoRepository(settings.MONGODB_URI, settings.MONGODB_DATABASE)
            await mongo_repo.init_db()
            logger.info("Using MongoRepository as database engine.")
            _repo_instance = mongo_repo
            return _repo_instance
        except Exception as e:
            logger.warning(f"MongoDB connection failed ({e}). Falling back to InMemoryRepository.")

    # Default fallback
    logger.info("Using InMemoryRepository (zero-dependency fallback).")
    _repo_instance = InMemoryRepository()
    return _repo_instance
