import unittest
import asyncio
from backend.app.ai.investigator import ai_investigator
from backend.app.response.simulator import response_simulator
from backend.app.schemas.incident import Incident, IncidentStatus, AffectedAssets


class TestAIAndResponseEngine(unittest.TestCase):
    def setUp(self):
        self.mock_incident = {
            "incident_id": "INC-1024",
            "title": "Possible Account Compromise with Lateral Movement",
            "risk_score": 91,
            "severity": "critical",
            "status": "investigating",
            "affected_assets": {
                "users": ["alex"],
                "devices": ["PC-017"],
                "servers": ["FILESERVER-02"],
                "databases": ["DB-01"],
                "ips": ["185.23.44.12"]
            },
            "evidence": [
                {"event_id": "EVT-002", "description": "Unusual login"},
                {"event_id": "EVT-003", "description": "PowerShell execution"},
                {"event_id": "EVT-004", "description": "Credential dump"},
                {"event_id": "EVT-006", "description": "Lateral movement to FILESERVER-02"},
                {"event_id": "EVT-007", "description": "DB-01 access"}
            ],
            "timeline": []
        }

    def test_deterministic_ai_answers(self):
        async def run_ai_tests():
            # Test 1: What happened?
            res1 = await ai_investigator.investigate(self.mock_incident, "What happened?")
            self.assertIn("alex", res1.answer)
            self.assertIn("PC-017", res1.answer)
            self.assertIn("EVT-002", res1.evidence_referenced)

            # Test 2: Why is this suspicious?
            res2 = await ai_investigator.investigate(self.mock_incident, "Why is this suspicious?")
            self.assertIn("91", res2.answer)
            self.assertIn("CRITICAL", res2.answer.upper())

            # Test 3: Which devices are affected?
            res3 = await ai_investigator.investigate(self.mock_incident, "Which devices are affected?")
            self.assertIn("PC-017", res3.answer)
            self.assertIn("FILESERVER-02", res3.answer)

            # Test 4: General explanation
            res4 = await ai_investigator.explain(self.mock_incident)
            self.assertIn("AI Security Explanation", res4.answer)

        asyncio.run(run_ai_tests())

    def test_response_recommendation_and_simulation(self):
        recs = response_simulator.generate_recommendations(self.mock_incident)
        self.assertGreaterEqual(len(recs), 3)
        action_types = [r.action_type for r in recs]
        self.assertIn("isolate_endpoint", action_types)
        self.assertIn("revoke_session", action_types)
        self.assertIn("block_ip", action_types)

        # Test single simulation
        sim_action = response_simulator.simulate_action("INC-1024", "isolate_endpoint", "PC-017")
        self.assertTrue(sim_action.simulation)
        self.assertEqual(sim_action.status, "completed")
        self.assertIn("SIMULATED", sim_action.command_simulated)


if __name__ == "__main__":
    unittest.main()
