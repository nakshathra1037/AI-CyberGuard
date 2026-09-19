from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
import uuid
from backend.app.schemas.response import ResponseRecommendation, SimulatedAction


class ResponseSimulator:
    """
    Defensive Response Recommendation and Safe Simulation Engine.
    GUARANTEE: No real system modifications or network changes occur.
    All actions execute as audit-logged simulations.
    """

    SIMULATED_COMMAND_TEMPLATES = {
        "isolate_endpoint": "SIMULATED_FIREWALL: Block all inbound/outbound network adapters on host '{target}' except SecOps management tunnel",
        "revoke_session": "SIMULATED_IDP: Invalidate all active OAuth tokens, Kerberos tickets, and web sessions for user identity '{target}'",
        "reset_credentials": "SIMULATED_ACTIVE_DIRECTORY: Force password rotation and revoke MFA tokens for '{target}'",
        "block_ip": "SIMULATED_BORDER_GATEWAY: Append drop rule on ingress firewall for external IP address '{target}'",
        "notify_security_team": "SIMULATED_ALERT: Dispatch high-priority incident webhook to SOC on-call channel (#soc-critical-alerts) regarding '{target}'"
    }

    def generate_recommendations(self, incident: Dict[str, Any]) -> List[ResponseRecommendation]:
        """Generates contextual response recommendations based on severity and affected assets."""
        sev = incident.get("severity", "low").lower()
        assets = incident.get("affected_assets", {})
        users = assets.get("users", ["alex"])
        devices = assets.get("devices", ["PC-017"])
        ips = assets.get("ips", ["185.23.44.12"])
        external_ips = [ip for ip in ips if not ip.startswith("10.") and not ip.startswith("192.")]
        target_ip = external_ips[0] if external_ips else (ips[0] if ips else "185.23.44.12")
        target_user = users[0] if users else "alex"
        target_device = devices[0] if devices else "PC-017"

        recommendations: List[ResponseRecommendation] = []

        if sev in ("critical", "high"):
            recommendations.append(ResponseRecommendation(
                action_type="isolate_endpoint",
                target=target_device,
                priority="immediate",
                description=f"Simulate host network isolation for {target_device}",
                rationale="Sever external command-and-control and halt lateral traversal across subnet",
                requires_approval=False
            ))
            recommendations.append(ResponseRecommendation(
                action_type="revoke_session",
                target=target_user,
                priority="immediate",
                description=f"Simulate session invalidation for user '{target_user}'",
                rationale="Terminate active attacker sessions utilizing compromised authentication tokens",
                requires_approval=False
            ))
            recommendations.append(ResponseRecommendation(
                action_type="reset_credentials",
                target=target_user,
                priority="high",
                description=f"Simulate forced password rotation for '{target_user}'",
                rationale="Prevent re-entry using harvested credentials",
                requires_approval=True
            ))
            recommendations.append(ResponseRecommendation(
                action_type="block_ip",
                target=target_ip,
                priority="high",
                description=f"Simulate edge firewall drop rule for {target_ip}",
                rationale="Block inbound connections originating from external untrusted attacker source",
                requires_approval=True
            ))
            recommendations.append(ResponseRecommendation(
                action_type="notify_security_team",
                target=incident.get("incident_id", "INC-1024"),
                priority="immediate",
                description="Simulate automated SOC alert broadcast",
                rationale="Alert Level 3 response team for rapid forensic data acquisition",
                requires_approval=False
            ))
        elif sev == "medium":
            recommendations.append(ResponseRecommendation(
                action_type="revoke_session",
                target=target_user,
                priority="medium",
                description=f"Simulate step-up authentication requirement for '{target_user}'",
                rationale="Confirm legitimacy of recent session activity",
                requires_approval=True
            ))
            recommendations.append(ResponseRecommendation(
                action_type="notify_security_team",
                target=incident.get("incident_id", "INC-1024"),
                priority="medium",
                description="Log warning in Tier 1 analyst triage queue",
                rationale="Maintain enhanced monitoring for next 24 hours",
                requires_approval=False
            ))
        else:
            recommendations.append(ResponseRecommendation(
                action_type="notify_security_team",
                target=incident.get("incident_id", "INC-1024"),
                priority="low",
                description="Record telemetry baseline adjustment",
                rationale="Low anomaly, continue standard passive monitoring",
                requires_approval=False
            ))

        return recommendations

    def simulate_action(self, incident_id: str, action_type: str, target: str, parameters: Optional[Dict[str, Any]] = None) -> SimulatedAction:
        """Executes a simulated defensive response action with an audit log."""
        now_str = datetime.now(timezone.utc).isoformat()
        action_id = f"RA-{uuid.uuid4().hex[:6].upper()}"
        template = self.SIMULATED_COMMAND_TEMPLATES.get(
            action_type,
            f"SIMULATED_ACTION: Execute mock security control '{action_type}' for target '{target}'"
        )
        simulated_cmd = template.format(target=target)

        return SimulatedAction(
            action_id=action_id,
            incident_id=incident_id,
            action_type=action_type,
            target=target,
            status="completed",
            simulation=True,
            timestamp=now_str,
            details={
                "simulation_engine": "AI-CyberGuard Safe Response Simulator",
                "execution_mode": "dry-run",
                "safety_verified": True,
                "parameters": parameters or {}
            },
            executed_by="AI-CyberGuard-Simulator",
            command_simulated=simulated_cmd
        )

    def simulate_all_recommendations(self, incident: Dict[str, Any]) -> List[SimulatedAction]:
        """Automatically executes all recommended actions in simulation mode."""
        recs = self.generate_recommendations(incident)
        inc_id = incident.get("incident_id", "INC-1024")
        actions = []
        for rec in recs:
            act = self.simulate_action(inc_id, rec.action_type, rec.target)
            actions.append(act)
        return actions


response_simulator = ResponseSimulator()
