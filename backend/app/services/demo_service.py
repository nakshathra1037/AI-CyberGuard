import json
from pathlib import Path
from typing import Dict, Any, List
from datetime import datetime, timezone
import logging

from backend.app.database import get_repository
from backend.app.detection.risk_engine import risk_engine
from backend.app.correlation.correlator import correlator
from backend.app.correlation.attack_story import AttackStoryBuilder
from backend.app.ai.investigator import ai_investigator
from backend.app.ai.report_generator import report_generator
from backend.app.response.simulator import response_simulator
from backend.app.schemas.incident import IncidentStatus

logger = logging.getLogger("ai_cyberguard.demo")


class DemoService:
    """
    Executes the End-to-End Buildathon Demo Pipeline:
    DETECT -> CORRELATE -> EXPLAIN -> INVESTIGATE -> RESPOND -> REPORT -> LEARN
    """

    @staticmethod
    def load_sample_events() -> List[Dict[str, Any]]:
        # Find sample_events.json relative to repository root or current file
        possible_paths = [
            Path(__file__).resolve().parent.parent.parent.parent / "data" / "sample_events.json",
            Path("data/sample_events.json"),
            Path("../data/sample_events.json")
        ]
        for p in possible_paths:
            if p.exists():
                with open(p, "r", encoding="utf-8") as f:
                    return json.load(f)
        raise FileNotFoundError("Could not find sample_events.json in data/ directory")

    async def run_demo(self) -> Dict[str, Any]:
        """Runs the entire autonomous AI cybersecurity pipeline."""
        repo = await get_repository()

        # Step 0: Reset repository for pristine demo state
        await repo.clear_all()

        # Step 1: Load and normalize synthetic events
        raw_events = self.load_sample_events()
        normalized_events = []
        for ev in raw_events:
            det = risk_engine.analyze_event(ev)
            ev["risk_score"] = det.risk_score
            ev["triggered_rules"] = [r.name for r in det.triggered_rules]
            normalized_events.append(ev)

        # Save events in repository
        await repo.save_events_bulk(normalized_events)

        # Step 2: Correlate events into unified incident
        # Force correlator counter to 1024 for standard demo output
        correlator._incident_counter = 1024
        incidents = correlator.correlate_events(normalized_events)
        if not incidents:
            raise RuntimeError("Correlation engine failed to generate an incident from sample events")

        primary_incident = incidents[0]
        inc_dict = primary_incident.model_dump()

        # Step 3: Explain & Summarize with AI Investigator
        ai_resp = await ai_investigator.explain(inc_dict, focus="full_incident")
        ai_summary = ai_resp.answer

        # Record AI explanation in investigation history
        await repo.save_investigation_record({
            "record_id": "INV-001",
            "incident_id": primary_incident.incident_id,
            "question": "Explain incident and attack sequence",
            "answer": ai_summary,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "evidence_referenced": ai_resp.evidence_referenced
        })

        # Step 4: Generate defensive response recommendations
        recommended_actions = response_simulator.generate_recommendations(inc_dict)

        # Step 5: Execute simulated defensive response actions
        simulated_actions = response_simulator.simulate_all_recommendations(inc_dict)
        for act in simulated_actions:
            await repo.save_response_action(act.model_dump())

        # Update incident status to contained following simulation
        primary_incident.status = IncidentStatus.CONTAINED
        inc_dict["status"] = "contained"
        now_str = datetime.now(timezone.utc).isoformat()
        inc_dict["updated_at"] = now_str
        inc_dict["status_history"].append({
            "status": "contained",
            "timestamp": now_str,
            "comment": f"Executed {len(simulated_actions)} simulated containment actions (Endpoint isolation, session revocation, IP block)."
        })

        # Step 6: Generate structured incident report
        report = report_generator.generate_report(
            incident=inc_dict,
            recommendations=recommended_actions,
            simulated_actions=simulated_actions,
            ai_summary=ai_summary
        )

        # Save incident in repository
        await repo.save_incident(inc_dict)

        # Step 7: Update learning & recurring pattern detection
        await repo.upsert_pattern(
            pattern_signature="unusual_login + powershell + credential_access",
            details={
                "pattern_id": "PAT-001",
                "description": "Suspicious external login followed immediately by PowerShell and credential dump",
                "severity": "high",
                "mitre_techniques": ["T1078", "T1059.001", "T1003.001"]
            }
        )

        return {
            "demo_id": "DEMO-001",
            "incident": inc_dict,
            "risk_score": primary_incident.risk_score,
            "severity": primary_incident.severity,
            "events": normalized_events,
            "attack_story": primary_incident.attack_story.model_dump() if primary_incident.attack_story else {},
            "affected_assets": primary_incident.affected_assets.model_dump(),
            "ai_summary": ai_summary,
            "recommended_actions": [r.model_dump() for r in recommended_actions],
            "simulated_actions": [a.model_dump() for a in simulated_actions],
            "report": report.model_dump()
        }

    async def reset_demo(self) -> Dict[str, Any]:
        """Clears all stored data and returns system to clean state."""
        repo = await get_repository()
        await repo.clear_all()
        return {"status": "success", "message": "All security events, incidents, and actions have been reset."}


demo_service = DemoService()
