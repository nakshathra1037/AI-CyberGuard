import unittest
import asyncio
from backend.app.auth.security import TokenManager, PasswordHasher
from backend.app.routes.auth import ENTERPRISE_USERS
from backend.app.database import get_repository
from backend.app.detection.risk_engine import risk_engine
from backend.app.ml.anomaly_detector import anomaly_detector
from backend.app.correlation.correlator import correlator
from backend.app.ai.investigator import ai_investigator
from backend.app.response.simulator import response_simulator
from backend.app.ai.report_generator import report_generator
from backend.app.schemas.incident import IncidentStatus


class TestEndToEndSOCPipeline(unittest.TestCase):
    """
    Comprehensive End-to-End Pipeline Verification Test (Section 42):
    User login -> Event ingestion -> Failed logins -> Successful login -> Unusual IP ->
    Sensitive API -> ML anomaly -> Risk calculation -> Event correlation ->
    Incident creation -> Timeline -> Attack graph -> MITRE mapping ->
    AI investigation -> Recommended response -> Human approval -> Response simulation ->
    Audit log -> Report generation.
    """

    def test_complete_e2e_soc_workflow(self):
        async def run_e2e():
            repo = await get_repository()
            await repo.clear_all()

            # 1. User Authentication
            admin_user = ENTERPRISE_USERS["admin@cyberguard.ai"]
            self.assertTrue(PasswordHasher.verify_password("admin123", admin_user["password_hash"]))
            token = TokenManager.create_access_token({
                "sub": admin_user["id"],
                "role": admin_user["role"].value,
                "email": admin_user["email"]
            })
            token_payload = TokenManager.decode_token(token)
            self.assertIsNotNone(token_payload)
            self.assertEqual(token_payload["role"], "ADMIN")

            # 2. Event Ingestion Sequence
            raw_telemetry = [
                {
                    "event_id": "EVT-E2E-01",
                    "timestamp": "2026-09-19T09:00:00Z",
                    "event_type": "auth_failure",
                    "user": "alex",
                    "device": "PC-017",
                    "source_ip": "185.23.44.12",
                    "destination": "PC-017",
                    "action": "failed_login",
                    "description": "Repeated authentication failure (invalid password)",
                    "metadata": {"attempt_count": 5}
                },
                {
                    "event_id": "EVT-E2E-02",
                    "timestamp": "2026-09-19T09:05:00Z",
                    "event_type": "auth_success",
                    "user": "alex",
                    "device": "PC-017",
                    "source_ip": "185.23.44.12",
                    "destination": "PC-017",
                    "action": "successful_login",
                    "description": "User alex authenticated from untrusted external IP 185.23.44.12",
                    "metadata": {"is_new_location": True}
                },
                {
                    "event_id": "EVT-E2E-03",
                    "timestamp": "2026-09-19T09:08:00Z",
                    "event_type": "credential_access",
                    "user": "alex",
                    "device": "PC-017",
                    "source_ip": "185.23.44.12",
                    "destination": "PC-017",
                    "action": "memory_read",
                    "description": "powershell.exe -enc execution requesting LSASS process memory handle",
                    "metadata": {"target_process": "lsass.exe"}
                },
                {
                    "event_id": "EVT-E2E-04",
                    "timestamp": "2026-09-19T09:12:00Z",
                    "event_type": "lateral_movement",
                    "user": "alex",
                    "device": "PC-017",
                    "source_ip": "10.0.0.15",
                    "destination": "FILESERVER-02",
                    "action": "remote_service_create",
                    "description": "Lateral WinRM connection established to FILESERVER-02",
                    "metadata": {"service": "WinRM"}
                },
                {
                    "event_id": "EVT-E2E-05",
                    "timestamp": "2026-09-19T09:15:00Z",
                    "event_type": "database_query",
                    "user": "alex",
                    "device": "FILESERVER-02",
                    "source_ip": "10.0.2.14",
                    "destination": "DB-01",
                    "action": "database_dump",
                    "description": "Unauthorized SQL dump against production financial database DB-01",
                    "metadata": {"table": "financial_records"}
                }
            ]

            # 3. Detection & ML Anomaly Scoring
            scored_events = []
            for ev in raw_telemetry:
                ml_res = anomaly_detector.detect_anomaly(ev)
                det = risk_engine.analyze_event(ev)
                ev["risk_score"] = det.risk_score
                ev["triggered_rules"] = [r.name for r in det.triggered_rules]
                ev["ml_anomaly"] = ml_res["is_anomaly"]
                scored_events.append(ev)

            await repo.save_events_bulk(scored_events)

            # 4. Correlation & Attack Graph Reassembly
            correlator._incident_counter = 2001
            incidents = correlator.correlate_events(scored_events)
            self.assertEqual(len(incidents), 1)

            inc = incidents[0]
            self.assertEqual(inc.incident_id, "INC-2001")
            self.assertGreaterEqual(inc.risk_score, 80)
            self.assertEqual(inc.severity, "critical")
            self.assertIsNotNone(inc.attack_story)
            self.assertGreaterEqual(len(inc.attack_story.nodes), 4)

            # 5. AI Investigation & Explanation
            inc_dict = inc.model_dump()
            ai_exp = await ai_investigator.explain(inc_dict, focus="full_incident")
            self.assertTrue(len(ai_exp.answer) > 50)
            self.assertIn("EVT-E2E-02", ai_exp.evidence_referenced)

            # 6. Response Recommendation & Safe Simulation
            recs = response_simulator.generate_recommendations(inc_dict)
            self.assertGreaterEqual(len(recs), 3)

            # Require human approval check for high-impact actions
            disruptive_actions = [r for r in recs if r.requires_approval]
            self.assertTrue(len(disruptive_actions) >= 1)

            # Simulate execution
            sim_actions = response_simulator.simulate_all_recommendations(inc_dict)
            for act in sim_actions:
                self.assertTrue(act.simulation)
                self.assertEqual(act.status, "completed")
                await repo.save_response_action(act.model_dump())

            inc_dict["status"] = IncidentStatus.CONTAINED.value
            await repo.save_incident(inc_dict)

            # 7. Incident Report Generation
            report = report_generator.generate_report(
                incident=inc_dict,
                recommendations=recs,
                simulated_actions=sim_actions,
                ai_summary=ai_exp.answer
            )
            self.assertEqual(report.incident_id, "INC-2001")
            self.assertIn("SAFE SIMULATION MODE", report.disclaimer)

            # 8. Verify Repository Audit Records
            stored_inc = await repo.get_incident("INC-2001")
            self.assertIsNotNone(stored_inc)
            self.assertEqual(stored_inc["status"], "contained")

            stored_actions = await repo.get_response_actions("INC-2001")
            self.assertEqual(len(stored_actions), len(sim_actions))

        asyncio.run(run_e2e())


if __name__ == "__main__":
    unittest.main()
