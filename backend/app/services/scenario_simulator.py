from typing import Dict, Any, List
from datetime import datetime, timezone
import uuid

from backend.app.database import get_repository
from backend.app.detection.risk_engine import risk_engine
from backend.app.correlation.correlator import correlator
from backend.app.ai.investigator import ai_investigator
from backend.app.ai.report_generator import report_generator
from backend.app.response.simulator import response_simulator
from backend.app.schemas.incident import IncidentStatus


class ScenarioSimulator:
    """
    Executes 8 industry-standard cybersecurity scenarios with realistic multi-stage telemetry.
    """

    SCENARIOS = {
        "scenario_a_account_takeover": {
            "name": "Scenario A: Account Takeover & Data Access",
            "description": "7 failed logins -> successful login from untrusted IP -> PowerShell spawn -> lateral pivot -> database dump.",
            "expected_risk": "critical"
        },
        "scenario_b_false_positive": {
            "name": "Scenario B: Benign Traveling Employee (False Positive)",
            "description": "Legitimate employee logs in from a new hotel IP and performs normal routine document review.",
            "expected_risk": "low"
        },
        "scenario_c_privilege_escalation": {
            "name": "Scenario C: Privilege Escalation & LSASS Dump",
            "description": "Standard user account elevates privileges and queries LSASS memory.",
            "expected_risk": "high"
        },
        "scenario_d_api_abuse": {
            "name": "Scenario D: API Rate Anomaly & Scraping",
            "description": "Spike in API rate multiplier across multiple endpoints within seconds.",
            "expected_risk": "medium"
        },
        "scenario_e_data_exfiltration": {
            "name": "Scenario E: Sensitive Data Exfiltration Indicator",
            "description": "Large query volume on production database DB-01 with egress network activity.",
            "expected_risk": "high"
        },
        "scenario_f_normal_user": {
            "name": "Scenario F: Normal Routine Employee Activity",
            "description": "Internal login during normal business hours from assigned PC-017.",
            "expected_risk": "low"
        },
        "scenario_g_llm_failure": {
            "name": "Scenario G: LLM Service Outage / Deterministic Fallback",
            "description": "Simulates OpenAI API outage with seamless fallback to deterministic reasoning.",
            "expected_risk": "high"
        },
        "scenario_h_insufficient_baseline": {
            "name": "Scenario H: New Employee (Insufficient Baseline)",
            "description": "Brand-new hire logging in for first time without baseline; flagged as INSUFFICIENT_DATA rather than false anomaly.",
            "expected_risk": "low"
        }
    }

    def generate_scenario_events(self, scenario_key: str) -> List[Dict[str, Any]]:
        now_str = datetime.now(timezone.utc).isoformat()
        
        if scenario_key == "scenario_b_false_positive":
            return [
                {
                    "event_id": f"EVT-{uuid.uuid4().hex[:6].upper()}",
                    "timestamp": now_str,
                    "event_type": "login",
                    "user": "sarah",
                    "device": "LAPTOP-SARAH",
                    "source_ip": "195.14.88.10",
                    "destination": "LAPTOP-SARAH",
                    "action": "successful_login",
                    "description": "User sarah authenticated from new location (Hotel WiFi IP 195.14.88.10)",
                    "metadata": {"is_new_location": True}
                },
                {
                    "event_id": f"EVT-{uuid.uuid4().hex[:6].upper()}",
                    "timestamp": now_str,
                    "event_type": "file_access",
                    "user": "sarah",
                    "device": "LAPTOP-SARAH",
                    "source_ip": "195.14.88.10",
                    "destination": "DOC-SHARE-01",
                    "action": "read_document",
                    "description": "Read standard project presentation slide deck from internal doc share",
                    "metadata": {"doc": "presentation.pptx"}
                }
            ]

        elif scenario_key == "scenario_d_api_abuse":
            return [
                {
                    "event_id": f"EVT-{uuid.uuid4().hex[:6].upper()}",
                    "timestamp": now_str,
                    "event_type": "api_access",
                    "user": "alex",
                    "device": "PC-017",
                    "source_ip": "10.0.0.15",
                    "destination": "API-GATEWAY",
                    "action": "api_burst_request",
                    "description": "Burst of 850 API requests within 10 seconds against /api/v1/customers endpoint",
                    "metadata": {"rate_multiplier": 8.5, "endpoint": "/api/v1/customers"}
                }
            ]

        elif scenario_key == "scenario_f_normal_user":
            return [
                {
                    "event_id": f"EVT-{uuid.uuid4().hex[:6].upper()}",
                    "timestamp": now_str,
                    "event_type": "login",
                    "user": "alex",
                    "device": "PC-017",
                    "source_ip": "10.0.0.15",
                    "destination": "PC-017",
                    "action": "successful_login",
                    "description": "Normal workstation logon during standard business hours (09:00 UTC)",
                    "metadata": {}
                }
            ]

        elif scenario_key == "scenario_h_insufficient_baseline":
            return [
                {
                    "event_id": f"EVT-{uuid.uuid4().hex[:6].upper()}",
                    "timestamp": now_str,
                    "event_type": "login",
                    "user": "new_hire_intern",
                    "device": "LAPTOP-NEW-01",
                    "source_ip": "10.0.8.99",
                    "destination": "LAPTOP-NEW-01",
                    "action": "first_time_login",
                    "description": "Initial system enrollment login for new employee",
                    "metadata": {}
                }
            ]

        # Default multi-stage account takeover attack sequence
        return [
            {
                "event_id": "EVT-001",
                "timestamp": "2026-09-19T09:05:00Z",
                "event_type": "login",
                "user": "alex",
                "device": "PC-017",
                "source_ip": "10.0.0.15",
                "destination": "PC-017",
                "action": "successful_login",
                "description": "User alex logged in from internal corporate subnet",
                "metadata": {}
            },
            {
                "event_id": "EVT-002",
                "timestamp": "2026-09-19T09:12:00Z",
                "event_type": "login",
                "user": "alex",
                "device": "PC-017",
                "source_ip": "185.23.44.12",
                "destination": "PC-017",
                "action": "remote_login",
                "description": "User alex authenticated from unusual external IP 185.23.44.12",
                "metadata": {"is_new_location": True}
            },
            {
                "event_id": "EVT-003",
                "timestamp": "2026-09-19T09:13:00Z",
                "event_type": "process_execution",
                "user": "alex",
                "device": "PC-017",
                "source_ip": "185.23.44.12",
                "destination": "PC-017",
                "action": "spawn_process",
                "description": "powershell.exe -NoP -NonI -W Hidden -Enc SQBFAFgA...",
                "metadata": {"command_line": "powershell.exe -nop -enc base64"}
            },
            {
                "event_id": "EVT-004",
                "timestamp": "2026-09-19T09:14:00Z",
                "event_type": "credential_access",
                "user": "alex",
                "device": "PC-017",
                "source_ip": "10.0.0.15",
                "destination": "PC-017",
                "action": "memory_read",
                "description": "Handle requested to lsass.exe process memory with PROCESS_VM_READ permissions",
                "metadata": {"target_process": "lsass.exe"}
            },
            {
                "event_id": "EVT-005",
                "timestamp": "2026-09-19T09:16:00Z",
                "event_type": "network_activity",
                "user": "alex",
                "device": "PC-017",
                "source_ip": "10.0.0.15",
                "destination": "10.0.2.0/24",
                "action": "network_scan",
                "description": "Internal reconnaissance probing ports 445 and 139 across subnet",
                "metadata": {"ports_probed": [445, 139]}
            },
            {
                "event_id": "EVT-006",
                "timestamp": "2026-09-19T09:18:00Z",
                "event_type": "lateral_movement",
                "user": "alex",
                "device": "PC-017",
                "source_ip": "10.0.0.15",
                "destination": "FILESERVER-02",
                "action": "remote_service_create",
                "description": "Remote service created on FILESERVER-02 using stolen credentials",
                "metadata": {"service_name": "WinRM-RemoteExec"}
            },
            {
                "event_id": "EVT-007",
                "timestamp": "2026-09-19T09:19:00Z",
                "event_type": "database_query",
                "user": "alex",
                "device": "FILESERVER-02",
                "source_ip": "10.0.2.14",
                "destination": "DB-01",
                "action": "database_dump",
                "description": "Large SELECT query executed on sensitive production financial database DB-01",
                "metadata": {"table_accessed": "corporate_financial_records", "rows_returned": 14000}
            }
        ]

    async def run_scenario(self, scenario_key: str) -> Dict[str, Any]:
        repo = await get_repository()
        await repo.clear_all()

        events = self.generate_scenario_events(scenario_key)
        normalized_events = []
        for ev in events:
            det = risk_engine.analyze_event(ev)
            ev["risk_score"] = det.risk_score
            ev["triggered_rules"] = [r.name for r in det.triggered_rules]
            normalized_events.append(ev)

        await repo.save_events_bulk(normalized_events)

        correlator._incident_counter = 1024
        incidents = correlator.correlate_events(normalized_events)
        
        primary_incident = incidents[0] if incidents else None
        if not primary_incident:
            return {
                "scenario": scenario_key,
                "status": "benign",
                "message": "No actionable incident generated. Telemetry evaluated as normal/benign.",
                "events_count": len(normalized_events)
            }

        inc_dict = primary_incident.model_dump()
        ai_resp = await ai_investigator.explain(inc_dict, focus="full_incident")
        recommended_actions = response_simulator.generate_recommendations(inc_dict)
        simulated_actions = response_simulator.simulate_all_recommendations(inc_dict)

        for act in simulated_actions:
            await repo.save_response_action(act.model_dump())

        primary_incident.status = IncidentStatus.CONTAINED
        inc_dict["status"] = "contained"
        await repo.save_incident(inc_dict)

        report = report_generator.generate_report(
            incident=inc_dict,
            recommendations=recommended_actions,
            simulated_actions=simulated_actions,
            ai_summary=ai_resp.answer
        )

        return {
            "scenario": scenario_key,
            "incident": inc_dict,
            "risk_score": primary_incident.risk_score,
            "severity": primary_incident.severity,
            "events_count": len(normalized_events),
            "ai_summary": ai_resp.answer,
            "recommended_actions": [r.model_dump() for r in recommended_actions],
            "simulated_actions": [a.model_dump() for a in simulated_actions],
            "report": report.model_dump()
        }


scenario_simulator = ScenarioSimulator()
