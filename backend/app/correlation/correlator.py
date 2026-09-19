from typing import List, Dict, Any
from datetime import datetime, timezone
from backend.app.schemas.incident import Incident, IncidentStatus
from backend.app.detection.risk_engine import risk_engine
from backend.app.correlation.attack_story import AttackStoryBuilder


class EventCorrelator:
    """
    Correlates disconnected security events into cohesive, multi-stage incidents.
    Prevents alert fatigue by clustering related events across user, host, IP, and temporal proximity.
    """

    def __init__(self):
        self._incident_counter = 1024

    def correlate_events(self, events: List[Dict[str, Any]]) -> List[Incident]:
        """
        Groups events into incidents based on entity overlap (user, device, IP, destination)
        and chronological proximity.
        """
        if not events:
            return []

        # Sort events chronologically
        sorted_events = sorted(events, key=lambda x: x.get("timestamp", ""))

        # Grouping by cluster key (User or Primary Device or Source IP)
        clusters: Dict[str, List[Dict[str, Any]]] = {}
        for ev in sorted_events:
            # Determine cluster key
            user = ev.get("user")
            dev = ev.get("device")
            ip = ev.get("source_ip")
            cluster_key = user or dev or ip or "general"
            if cluster_key not in clusters:
                clusters[cluster_key] = []
            clusters[cluster_key].append(ev)

        incidents: List[Incident] = []
        now_str = datetime.now(timezone.utc).isoformat()

        for key, cluster_events in clusters.items():
            # Check if any event is suspicious
            any_suspicious = False
            for ev in cluster_events:
                det = risk_engine.analyze_event(ev)
                ev["risk_score"] = det.risk_score
                ev["triggered_rules"] = [r.name for r in det.triggered_rules]
                if det.is_suspicious:
                    any_suspicious = True

            if not any_suspicious and len(cluster_events) == 1:
                # Single benign event doesn't warrant an active incident
                continue

            # Calculate contextual incident risk score & severity
            score, severity, reasons, synergies = risk_engine.calculate_contextual_incident_score(cluster_events)

            # Assign incident ID
            inc_id = f"INC-{self._incident_counter}"
            self._incident_counter += 1

            # Extract affected assets, timeline, evidence, and attack story
            affected_assets = AttackStoryBuilder.extract_affected_assets(cluster_events)
            timeline = AttackStoryBuilder.build_timeline(cluster_events)
            evidence = AttackStoryBuilder.build_evidence(cluster_events)
            attack_story = AttackStoryBuilder.build_attack_story(inc_id, cluster_events)

            # Determine appropriate incident title and type
            has_lateral = any(ev.get("event_type") == "lateral_movement" for ev in cluster_events)
            has_db = any("DB-01" in str(ev.get("destination")) for ev in cluster_events)
            has_cred = any(ev.get("event_type") == "credential_access" for ev in cluster_events)

            if has_lateral and has_db:
                title = "Possible Account Compromise with Lateral Movement"
                inc_type = "lateral_movement"
            elif has_cred:
                title = "Credential Harvesting and Privilege Escalation"
                inc_type = "credential_access"
            elif has_lateral:
                title = "Internal Network Lateral Traversal"
                inc_type = "lateral_movement"
            else:
                title = f"Suspicious Activity Detected for {key}"
                inc_type = "suspicious_activity"

            incident = Incident(
                incident_id=inc_id,
                title=title,
                type=inc_type,
                severity=severity,
                risk_score=score,
                status=IncidentStatus.INVESTIGATING,
                event_ids=[e["event_id"] for e in cluster_events],
                affected_users=affected_assets.users,
                affected_devices=affected_assets.devices + affected_assets.servers,
                affected_assets=affected_assets,
                timeline=timeline,
                evidence=evidence,
                attack_story=attack_story,
                created_at=cluster_events[0].get("timestamp", now_str),
                updated_at=now_str,
                status_history=[{
                    "status": "investigating",
                    "timestamp": now_str,
                    "comment": f"Correlated {len(cluster_events)} events into unified attack story. Risk score: {score} ({severity.upper()})."
                }]
            )
            incidents.append(incident)

        return incidents


correlator = EventCorrelator()
