import unittest
from backend.app.detection.risk_engine import risk_engine
from backend.app.detection.baseline import SecurityBaseline


class TestDetectionEngine(unittest.TestCase):
    def test_benign_event_scoring(self):
        event = {
            "event_id": "TEST-001",
            "event_type": "login",
            "user": "alex",
            "device": "PC-017",
            "source_ip": "10.0.4.55",
            "destination": "PC-017",
            "action": "login",
            "description": "Standard login from known workstation",
            "metadata": {}
        }
        res = risk_engine.analyze_event(event)
        self.assertEqual(res.risk_score, 0)
        self.assertEqual(res.severity, "low")
        self.assertFalse(res.is_suspicious)

    def test_unusual_login_external_ip(self):
        event = {
            "event_id": "TEST-002",
            "event_type": "authentication",
            "user": "alex",
            "device": "PC-017",
            "source_ip": "185.23.44.12",
            "action": "login",
            "description": "Unusual login from external IP",
            "metadata": {"is_new_location": True}
        }
        res = risk_engine.analyze_event(event)
        self.assertGreaterEqual(res.risk_score, 15)
        self.assertTrue(res.is_suspicious)
        rule_ids = [r.rule_id for r in res.triggered_rules]
        self.assertIn("RULE-UNUSUAL-LOGIN", rule_ids)

    def test_suspicious_powershell_execution(self):
        event = {
            "event_id": "TEST-003",
            "event_type": "process_execution",
            "user": "alex",
            "device": "PC-017",
            "action": "process_spawn",
            "description": "Suspicious PowerShell execution",
            "metadata": {
                "process_name": "powershell.exe",
                "command_line": "powershell.exe -NoP -NonI -Enc SQBFA..."
            }
        }
        res = risk_engine.analyze_event(event)
        self.assertGreaterEqual(res.risk_score, 20)
        rule_ids = [r.rule_id for r in res.triggered_rules]
        self.assertIn("RULE-SUSP-PROCESS", rule_ids)

    def test_credential_access_detection(self):
        event = {
            "event_id": "TEST-004",
            "event_type": "credential_access",
            "user": "alex",
            "device": "PC-017",
            "action": "memory_read",
            "description": "LSASS memory access",
            "metadata": {"target_process": "lsass.exe"}
        }
        res = risk_engine.analyze_event(event)
        self.assertGreaterEqual(res.risk_score, 25)
        rule_ids = [r.rule_id for r in res.triggered_rules]
        self.assertIn("RULE-CRED-ACCESS", rule_ids)

    def test_contextual_scoring_synergy(self):
        # Multi-stage attack chain
        events = [
            {"event_id": "E1", "event_type": "login", "source_ip": "185.23.44.12", "description": "unusual login"},
            {"event_id": "E2", "event_type": "process_execution", "description": "powershell executed"},
            {"event_id": "E3", "event_type": "credential_access", "description": "lsass dump"},
            {"event_id": "E4", "event_type": "lateral_movement", "description": "lateral pivot"},
            {"event_id": "E5", "event_type": "file_access", "destination": "DB-01", "description": "database query"}
        ]
        score, severity, reasons, synergies = risk_engine.calculate_contextual_incident_score(events)
        self.assertGreaterEqual(score, 85)
        self.assertEqual(severity, "critical")
        self.assertGreater(len(synergies), 0)


if __name__ == "__main__":
    unittest.main()
