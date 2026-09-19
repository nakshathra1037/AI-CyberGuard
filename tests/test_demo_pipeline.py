import unittest
import asyncio
from backend.app.services.demo_service import demo_service
from backend.app.database import get_repository


class TestDemoPipeline(unittest.TestCase):
    def test_demo_pipeline(self):
        """
        Verifies the full autonomous AI cybersecurity pipeline end-to-end:
        events -> detection -> scoring -> correlation -> incident -> attack story -> AI -> response -> report -> feedback -> patterns
        """
        async def run_pipeline():
            # Execute full demo
            result = await demo_service.run_demo()

            # 1. Verify Demo ID & structure
            self.assertEqual(result["demo_id"], "DEMO-001")
            self.assertIn("incident", result)
            self.assertIn("events", result)
            self.assertIn("attack_story", result)
            self.assertIn("ai_summary", result)
            self.assertIn("recommended_actions", result)
            self.assertIn("simulated_actions", result)
            self.assertIn("report", result)

            # 2. Verify events ingestion & detection
            events = result["events"]
            self.assertEqual(len(events), 7)
            for ev in events:
                self.assertIn("risk_score", ev)
                self.assertIn("triggered_rules", ev)

            # 3. Verify correlation & incident
            inc = result["incident"]
            self.assertEqual(inc["incident_id"], "INC-1024")
            self.assertIn("alex", inc["affected_users"])
            self.assertIn("PC-017", inc["affected_devices"])
            self.assertEqual(inc["status"], "contained")
            self.assertGreaterEqual(result["risk_score"], 80)
            self.assertEqual(result["severity"], "critical")

            # 4. Verify Attack Story
            story = result["attack_story"]
            self.assertGreaterEqual(len(story["nodes"]), 5)
            self.assertGreaterEqual(len(story["edges"]), 4)
            node_labels = " ".join([n["label"] for n in story["nodes"]])
            self.assertIn("alex", node_labels)
            self.assertIn("PC-017", node_labels)
            self.assertIn("PowerShell", node_labels)
            self.assertIn("Credential Access", node_labels)
            self.assertIn("FILESERVER-02", node_labels)
            self.assertIn("DB-01", node_labels)

            # 5. Verify AI summary
            ai_summary = result["ai_summary"]
            self.assertTrue(len(ai_summary) > 50)

            # 6. Verify Response actions
            simulated_actions = result["simulated_actions"]
            self.assertGreaterEqual(len(simulated_actions), 3)
            for act in simulated_actions:
                self.assertTrue(act["simulation"])
                self.assertEqual(act["status"], "completed")

            # 7. Verify Incident Report
            rep = result["report"]
            self.assertEqual(rep["incident_id"], "INC-1024")
            self.assertIn("SAFE SIMULATION MODE", rep["disclaimer"])
            self.assertIn("executive_summary", rep)
            self.assertIn("risk_assessment", rep)

            # 8. Verify repository persistence
            repo = await get_repository()
            stored_inc = await repo.get_incident("INC-1024")
            self.assertIsNotNone(stored_inc)
            self.assertEqual(stored_inc["incident_id"], "INC-1024")

            patterns = await repo.get_all_patterns()
            self.assertGreaterEqual(len(patterns), 1)

        asyncio.run(run_pipeline())


if __name__ == "__main__":
    unittest.main()
