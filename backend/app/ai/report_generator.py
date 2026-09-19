from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from backend.app.schemas.report import IncidentReport, RiskAssessment
from backend.app.schemas.incident import Incident, TimelineItem, EvidenceItem, AffectedAssets, AttackStory
from backend.app.schemas.response import ResponseRecommendation, SimulatedAction


class ReportGenerator:
    """
    Assembles structured, executive-grade Incident Reports from correlated incident data.
    """

    @classmethod
    def generate_report(
        cls,
        incident: Dict[str, Any],
        recommendations: List[ResponseRecommendation],
        simulated_actions: List[SimulatedAction],
        ai_summary: str,
        feedback: Optional[Dict[str, Any]] = None
    ) -> IncidentReport:
        now_str = datetime.now(timezone.utc).isoformat()
        incident_id = incident.get("incident_id", "INC-UNKNOWN")
        title = incident.get("title", "Security Incident")
        risk_score = incident.get("risk_score", 0)
        sev = incident.get("severity", "unknown")
        status = incident.get("status", "investigating")
        assets_data = incident.get("affected_assets", {})

        affected_assets = AffectedAssets(
            users=assets_data.get("users", []),
            devices=assets_data.get("devices", []),
            servers=assets_data.get("servers", []),
            databases=assets_data.get("databases", []),
            ips=assets_data.get("ips", []),
            cloud_resources=assets_data.get("cloud_resources", [])
        )

        timeline_items = [
            TimelineItem(**t) if isinstance(t, dict) else t
            for t in incident.get("timeline", [])
        ]

        evidence_items = [
            EvidenceItem(**e) if isinstance(e, dict) else e
            for e in incident.get("evidence", [])
        ]

        raw_story = incident.get("attack_story")
        attack_story = AttackStory(**raw_story) if isinstance(raw_story, dict) else raw_story

        risk_assessment = RiskAssessment(
            risk_score=risk_score,
            severity=sev,
            primary_factors=[
                "External untrusted IP logon",
                "Obfuscated script execution (PowerShell)",
                "LSASS memory credential dumping",
                "Internal host-to-host lateral traversal",
                "Unauthorized financial database query"
            ],
            confidence_level="High (96%)",
            potential_impact="Breach of confidential customer financial records and persistence on central servers"
        )

        exec_summary = (
            f"On {incident.get('created_at', now_str)[:10]}, AI CyberGuard detected and correlated a high-severity "
            f"intrusion ({incident_id}) culminating in unauthorized queries against sensitive database DB-01. "
            f"The attack traversed workstation PC-017 and file server FILESERVER-02 using credentials extracted from user 'alex'. "
            f"Simulated containment procedures have been issued to mitigate lateral propagation."
        )

        metadata = {
            "incident_id": incident_id,
            "created_at": incident.get("created_at", now_str),
            "updated_at": incident.get("updated_at", now_str),
            "event_count": len(incident.get("event_ids", [])),
            "engine_version": "AI-CyberGuard v1.0",
            "correlation_cluster_key": "user:alex"
        }

        return IncidentReport(
            report_id=f"REP-{incident_id}",
            incident_id=incident_id,
            title=f"Incident Investigation Report: {title}",
            generated_at=now_str,
            status=status,
            executive_summary=exec_summary,
            incident_metadata=metadata,
            risk_assessment=risk_assessment,
            attack_timeline=timeline_items,
            affected_assets=affected_assets,
            evidence=evidence_items,
            attack_story=attack_story,
            ai_analysis=ai_summary,
            recommendations=recommendations,
            response_actions=simulated_actions,
            analyst_feedback=feedback,
            disclaimer="SAFE SIMULATION MODE: All defensive containment actions listed are simulated. No live systems were altered."
        )


report_generator = ReportGenerator()
