import unittest
import asyncio
import json
from backend.app.services.ingestion_service import ingestion_service
from backend.app.database import get_repository


class TestLogUploaderAndSimulator(unittest.TestCase):
    def test_csv_parsing(self):
        sample_csv = """timestamp,event_type,user,device,source_ip,destination,action,description
2026-09-19T10:00:00Z,login,victor,PC-099,10.0.1.5,PC-099,login,Standard morning login
2026-09-19T10:05:00Z,process_execution,victor,PC-099,10.0.1.5,PC-099,process_spawn,Suspicious powershell -enc test execution
"""
        records = ingestion_service.parse_csv_content(sample_csv)
        self.assertEqual(len(records), 2)
        self.assertEqual(records[0]["user"], "victor")
        self.assertEqual(records[0]["device"], "PC-099")
        self.assertEqual(records[1]["event_type"], "process_execution")

    def test_json_parsing(self):
        sample_json = json.dumps([
            {"event_id": "TEST-J1", "event_type": "credential_access", "user": "alice", "device": "PC-100", "action": "memory_read", "description": "lsass dump"}
        ])
        records = ingestion_service.parse_json_content(sample_json)
        self.assertEqual(len(records), 1)
        self.assertEqual(records[0]["event_id"], "TEST-J1")

    def test_bulk_ingestion_and_correlation(self):
        async def run_test():
            raw_events = [
                {
                    "event_id": "EVT-UP-01",
                    "timestamp": "2026-09-19T11:00:00Z",
                    "event_type": "login",
                    "user": "developer_dan",
                    "device": "DEV-WS-01",
                    "source_ip": "185.190.40.1",
                    "action": "login",
                    "description": "Unusual external login from remote untrusted IP"
                },
                {
                    "event_id": "EVT-UP-02",
                    "timestamp": "2026-09-19T11:02:00Z",
                    "event_type": "credential_access",
                    "user": "developer_dan",
                    "device": "DEV-WS-01",
                    "source_ip": "185.190.40.1",
                    "action": "memory_read",
                    "description": "LSASS memory dumped on developer workstation"
                }
            ]
            res = await ingestion_service.process_and_ingest_events(raw_events, correlate_immediately=True)
            self.assertEqual(res.total_ingested, 2)
            self.assertGreaterEqual(res.suspicious_count, 1)
            self.assertGreaterEqual(res.incidents_created, 1)

            repo = await get_repository()
            ev = await repo.get_event("EVT-UP-01")
            self.assertIsNotNone(ev)
            self.assertGreaterEqual(ev["risk_score"], 15)

        asyncio.run(run_test())

    def test_scenario_generation(self):
        ransomware_events = ingestion_service.generate_simulated_scenario_events(
            scenario="ransomware_staging",
            user="victim_bob",
            device="FINANCE-PC-01"
        )
        self.assertEqual(len(ransomware_events), 3)
        self.assertTrue(any("vssadmin" in e["description"] for e in ransomware_events))


if __name__ == "__main__":
    unittest.main()
