import unittest
import json
from pathlib import Path

from backend.app.correlation.correlator import correlator
from backend.app.correlation.attack_story import AttackStoryBuilder


class TestCorrelationEngine(unittest.TestCase):
    def setUp(self):
        sample_path = Path("data/sample_events.json")
        with open(sample_path, "r", encoding="utf-8") as f:
            self.sample_events = json.load(f)

    def test_single_incident_created_from_cluster(self):
        correlator._incident_counter = 1024
        incidents = correlator.correlate_events(self.sample_events)
        # Should correlate into 1 primary incident rather than 7 disconnected incidents
        self.assertEqual(len(incidents), 1)
        inc = incidents[0]
        self.assertEqual(inc.incident_id, "INC-1024")
        self.assertEqual(inc.severity, "critical")
        self.assertGreaterEqual(inc.risk_score, 85)
        self.assertIn("alex", inc.affected_users)

    def test_affected_assets_extraction(self):
        assets = AttackStoryBuilder.extract_affected_assets(self.sample_events)
        self.assertIn("alex", assets.users)
        self.assertIn("PC-017", assets.devices)
        self.assertIn("FILESERVER-02", assets.servers)
        self.assertIn("DB-01", assets.databases)
        self.assertIn("185.23.44.12", assets.ips)

    def test_attack_story_graph_generation(self):
        story = AttackStoryBuilder.build_attack_story("INC-1024", self.sample_events)
        node_labels = [n.label for n in story.nodes]
        self.assertTrue(any("alex" in l for l in node_labels))
        self.assertTrue(any("PC-017" in l for l in node_labels))
        self.assertTrue(any("PowerShell" in l for l in node_labels))
        self.assertTrue(any("Credential Access" in l for l in node_labels))
        self.assertTrue(any("FILESERVER-02" in l for l in node_labels))
        self.assertTrue(any("DB-01" in l for l in node_labels))

        # Check edges
        edge_labels = [e.label for e in story.edges]
        self.assertIn("logged_into", edge_labels)
        self.assertIn("executed", edge_labels)
        self.assertIn("accessed_credentials", edge_labels)
        self.assertIn("moved_to", edge_labels)
        self.assertIn("accessed", edge_labels)

    def test_chronological_timeline(self):
        timeline = AttackStoryBuilder.build_timeline(self.sample_events)
        self.assertEqual(len(timeline), 7)
        # Verify chronological order
        timestamps = [t.timestamp for t in timeline]
        self.assertEqual(timestamps, sorted(timestamps))


if __name__ == "__main__":
    unittest.main()
