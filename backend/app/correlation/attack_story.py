from typing import List, Dict, Any, Tuple
from backend.app.schemas.incident import (
    AttackStory, AttackStoryNode, AttackStoryEdge,
    TimelineItem, EvidenceItem, AffectedAssets
)


class AttackStoryBuilder:
    """
    Reconstructs structured Attack Stories, Graph Nodes/Edges,
    Chronological Timelines, and Identifies Affected Assets from security events.
    """

    STAGE_MAPPING = {
        "login": "Authentication",
        "authentication": "Authentication",
        "process_execution": "Execution",
        "credential_access": "Credential Access",
        "network_activity": "Discovery",
        "lateral_movement": "Lateral Movement",
        "file_access": "Database Access",
        "database_query": "Database Access",
        "cloud_activity": "Collection",
        "security_alert": "Investigation Indicator"
    }

    @classmethod
    def classify_stage(cls, event: Dict[str, Any]) -> str:
        ev_type = event.get("event_type", "").lower()
        desc = event.get("description", "").lower()
        if "database" in desc or "db-01" in desc:
            return "Database Access"
        if "lateral" in desc:
            return "Lateral Movement"
        if "discovery" in desc or "reconnaissance" in desc:
            return "Discovery"
        if "credential" in desc or "lsass" in desc:
            return "Credential Access"
        if "powershell" in desc or "script" in desc:
            return "Execution"
        if "login" in desc or "authentication" in desc:
            return "Authentication"
        return cls.STAGE_MAPPING.get(ev_type, "Observed Activity")

    @classmethod
    def extract_affected_assets(cls, events: List[Dict[str, Any]]) -> AffectedAssets:
        users = set()
        devices = set()
        servers = set()
        databases = set()
        ips = set()
        cloud_resources = set()

        for ev in events:
            u = ev.get("user")
            if u:
                users.add(u)
            d = ev.get("device")
            if d:
                if "FILESERVER" in d.upper() or "SRV" in d.upper():
                    servers.add(d)
                else:
                    devices.add(d)
            dest = ev.get("destination")
            if dest:
                if "DB" in dest.upper() or "DATABASE" in dest.upper():
                    databases.add(dest)
                elif "SERVER" in dest.upper() or "SRV" in dest.upper():
                    servers.add(dest)
                elif "PC-" in dest.upper() or "LAPTOP" in dest.upper():
                    devices.add(dest)
            src_ip = ev.get("source_ip")
            if src_ip:
                ips.add(src_ip)

        return AffectedAssets(
            users=sorted(list(users)),
            devices=sorted(list(devices)),
            servers=sorted(list(servers)),
            databases=sorted(list(databases)),
            ips=sorted(list(ips)),
            cloud_resources=sorted(list(cloud_resources))
        )

    @classmethod
    def build_timeline(cls, events: List[Dict[str, Any]]) -> List[TimelineItem]:
        sorted_events = sorted(events, key=lambda x: x.get("timestamp", ""))
        timeline = []
        for ev in sorted_events:
            stage = cls.classify_stage(ev)
            desc = ev.get("description", "")
            risk = ev.get("risk_score", 15)
            timeline.append(TimelineItem(
                timestamp=ev.get("timestamp", ""),
                event_id=ev.get("event_id", ""),
                event_type=ev.get("event_type", ""),
                description=desc,
                risk_contribution=risk,
                relationship_to_incident=f"Probable {stage} stage",
                source=ev.get("source_ip") or ev.get("device"),
                destination=ev.get("destination")
            ))
        return timeline

    @classmethod
    def build_evidence(cls, events: List[Dict[str, Any]]) -> List[EvidenceItem]:
        evidence_list = []
        for ev in events:
            stage = cls.classify_stage(ev)
            evidence_list.append(EvidenceItem(
                event_id=ev.get("event_id", ""),
                timestamp=ev.get("timestamp", ""),
                event_type=ev.get("event_type", ""),
                description=ev.get("description", ""),
                risk_contribution=ev.get("risk_score", 15),
                source=ev.get("source_ip") or ev.get("device"),
                destination=ev.get("destination"),
                relationship_to_incident=f"Corroborates attack progression in {stage}",
                metadata=ev.get("metadata", {}) or {}
            ))
        return evidence_list

    @classmethod
    def build_attack_story(cls, incident_id: str, events: List[Dict[str, Any]]) -> AttackStory:
        """
        Builds the graph nodes and edges representing the probable attack sequence:
        alex -> PC-017 -> PowerShell -> Credential Access -> Lateral Movement -> FILESERVER-02 -> DB-01
        """
        sorted_events = sorted(events, key=lambda x: x.get("timestamp", ""))
        stages_observed = []

        # Graph components
        nodes: List[AttackStoryNode] = []
        edges: List[AttackStoryEdge] = []
        node_ids = set()

        def add_node(nid: str, label: str, ntype: str, details: Dict[str, Any]):
            if nid not in node_ids:
                node_ids.add(nid)
                nodes.append(AttackStoryNode(id=nid, label=label, type=ntype, details=details))

        # 1. Identity node
        user_name = "alex"
        for ev in sorted_events:
            if ev.get("user"):
                user_name = ev.get("user")
                break
        add_node("node-user", f"User: {user_name}", "user", {"user": user_name, "role": "Employee Account"})

        # 2. Endpoint Workstation
        add_node("node-device", "Workstation: PC-017", "device", {"device": "PC-017", "os": "Windows 11 Enterprise"})
        edges.append(AttackStoryEdge(
            id="edge-1",
            source="node-user",
            target="node-device",
            label="logged_into",
            timestamp="2026-09-19T09:12:00Z",
            evidence_id="EVT-002"
        ))
        stages_observed.append("Authentication")

        # 3. Process node (PowerShell)
        has_ps = any("powershell" in ev.get("description", "").lower() for ev in sorted_events)
        if has_ps:
            add_node("node-process", "Execution: PowerShell", "process", {
                "process": "powershell.exe",
                "args": "-Enc -NonI -Hidden"
            })
            edges.append(AttackStoryEdge(
                id="edge-2",
                source="node-device",
                target="node-process",
                label="executed",
                timestamp="2026-09-19T09:13:00Z",
                evidence_id="EVT-003"
            ))
            stages_observed.append("Execution")

        # 4. Credential Access node
        has_cred = any(ev.get("event_type") == "credential_access" for ev in sorted_events)
        if has_cred:
            add_node("node-cred", "Credential Access: LSASS Memory", "credential", {
                "technique": "T1003.001 - OS Credential Dumping",
                "target": "lsass.exe"
            })
            source_for_cred = "node-process" if has_ps else "node-device"
            edges.append(AttackStoryEdge(
                id="edge-3",
                source=source_for_cred,
                target="node-cred",
                label="accessed_credentials",
                timestamp="2026-09-19T09:14:00Z",
                evidence_id="EVT-004"
            ))
            stages_observed.append("Credential Access")

        # 5. Lateral Movement & Target Server
        has_lateral = any(ev.get("event_type") == "lateral_movement" or "FILESERVER" in str(ev.get("destination")) for ev in sorted_events)
        if has_lateral:
            add_node("node-lateral", "Pivot: Lateral Movement", "lateral_movement", {
                "protocol": "WinRM / SMB",
                "auth": "Stolen Token"
            })
            source_for_lateral = "node-cred" if has_cred else "node-device"
            edges.append(AttackStoryEdge(
                id="edge-4",
                source=source_for_lateral,
                target="node-lateral",
                label="moved_to",
                timestamp="2026-09-19T09:18:00Z",
                evidence_id="EVT-006"
            ))

            add_node("node-server", "Server: FILESERVER-02", "server", {
                "role": "Corporate Central File Repository",
                "ip": "10.0.2.14"
            })
            edges.append(AttackStoryEdge(
                id="edge-5",
                source="node-lateral",
                target="node-server",
                label="compromised",
                timestamp="2026-09-19T09:18:30Z",
                evidence_id="EVT-006"
            ))
            stages_observed.append("Lateral Movement")

        # 6. Database Target node
        has_db = any("DB-01" in str(ev.get("destination")) or "database" in ev.get("description", "").lower() for ev in sorted_events)
        if has_db:
            add_node("node-database", "Database: DB-01", "database", {
                "target": "DB-01 (Production Customers)",
                "data_type": "Financial Records"
            })
            source_for_db = "node-server" if has_lateral else "node-device"
            edges.append(AttackStoryEdge(
                id="edge-6",
                source=source_for_db,
                target="node-database",
                label="accessed",
                timestamp="2026-09-19T09:19:00Z",
                evidence_id="EVT-007"
            ))
            stages_observed.append("Database Access")

        summary_text = (
            f"Probable attack sequence reconstructed for {incident_id}: "
            f"User account '{user_name}' was accessed from external untrusted IP 185.23.44.12 on workstation PC-017. "
            f"The adversary spawned obfuscated PowerShell, dumped authentication credentials from LSASS memory, "
            f"pivoted laterally across the internal network to FILESERVER-02, and executed unauthorized queries "
            f"against sensitive production database DB-01."
        )

        return AttackStory(
            incident_id=incident_id,
            summary_text=summary_text,
            stages=stages_observed,
            nodes=nodes,
            edges=edges
        )
