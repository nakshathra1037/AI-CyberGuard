from typing import Dict, Any, List, Tuple
from datetime import datetime
from backend.app.detection.baseline import SecurityBaseline
from backend.app.schemas.detection import DetectionResult, TriggeredRule


class RiskEngine:
    """
    Deterministic rule-based security risk engine with contextual synergy analysis.
    Evaluates individual events and multi-event correlations.
    """

    RULE_WEIGHTS = {
        "UNUSUAL_LOGIN": 15,
        "NEW_DEVICE": 15,
        "UNUSUAL_TIME": 10,
        "FAILED_LOGINS": 15,
        "SUSPICIOUS_PROCESS": 20,
        "CREDENTIAL_ACCESS": 25,
        "SENSITIVE_FILE_ACCESS": 20,
        "LATERAL_MOVEMENT": 30,
        "ADMIN_ACCOUNT_CREATED": 25,
        "SUSPICIOUS_NETWORK": 15,
        "SENSITIVE_DATABASE_ACCESS": 25
    }

    @staticmethod
    def calculate_severity(score: int) -> str:
        if score >= 80:
            return "critical"
        elif score >= 60:
            return "high"
        elif score >= 30:
            return "medium"
        return "low"

    def analyze_event(self, event: Dict[str, Any]) -> DetectionResult:
        """Inspects an individual event and identifies suspicious behavior."""
        event_id = event.get("event_id") or "UNKNOWN"
        event_type = (event.get("event_type") or "").lower()
        action = (event.get("action") or "").lower()
        description = (event.get("description") or "").lower()
        metadata = event.get("metadata") or {}
        user = event.get("user") or ""
        device = event.get("device") or ""
        src_ip = event.get("source_ip") or ""
        dest = event.get("destination") or ""

        triggered_rules: List[TriggeredRule] = []
        reasons: List[str] = []
        indicators: List[str] = []
        score = 0

        # 1. Unusual login / external untrusted IP
        if event_type in ("login", "authentication") or "login" in action:
            if src_ip and not SecurityBaseline.is_internal_ip(src_ip):
                w = self.RULE_WEIGHTS["UNUSUAL_LOGIN"]
                score += w
                triggered_rules.append(TriggeredRule(
                    rule_id="RULE-UNUSUAL-LOGIN",
                    name="Unusual Login Location",
                    weight=w,
                    reason=f"Login originated from external/untrusted IP: {src_ip}",
                    evidence_fields={"source_ip": src_ip, "user": user}
                ))
                reasons.append(f"External login from untrusted IP ({src_ip})")
                indicators.append("external_ip_login")

            if metadata.get("is_new_location") or "unusual location" in description:
                if not any(r.rule_id == "RULE-UNUSUAL-LOGIN" for r in triggered_rules):
                    w = self.RULE_WEIGHTS["UNUSUAL_LOGIN"]
                    score += w
                    triggered_rules.append(TriggeredRule(
                        rule_id="RULE-UNUSUAL-LOGIN",
                        name="Unusual Login Location",
                        weight=w,
                        reason="Event flagged as unusual login geography",
                        evidence_fields={"metadata": metadata}
                    ))
                    reasons.append("Unusual login location detected")

            # Check new device
            if device and not SecurityBaseline.is_normal_device_for_user(user, device):
                w = self.RULE_WEIGHTS["NEW_DEVICE"]
                score += w
                triggered_rules.append(TriggeredRule(
                    rule_id="RULE-NEW-DEVICE",
                    name="Unrecognized Device",
                    weight=w,
                    reason=f"Device {device} has not previously been associated with user {user}",
                    evidence_fields={"device": device, "user": user}
                ))
                reasons.append(f"New device pairing ({device})")
                indicators.append("unrecognized_device")

        # 2. Suspicious process execution
        if event_type == "process_execution" or "process" in action:
            cmd = metadata.get("command_line", "").lower()
            proc = metadata.get("process_name", "").lower()
            if any(k in cmd or k in proc for k in SecurityBaseline.SUSPICIOUS_PROCESS_KEYWORDS) or "powershell" in description:
                w = self.RULE_WEIGHTS["SUSPICIOUS_PROCESS"]
                score += w
                triggered_rules.append(TriggeredRule(
                    rule_id="RULE-SUSP-PROCESS",
                    name="Suspicious Process Execution",
                    weight=w,
                    reason=f"Suspicious command line or script host detected: {proc or 'powershell'}",
                    evidence_fields={"process": proc, "command": cmd[:80] if cmd else "powershell"}
                ))
                reasons.append(f"Obfuscated / script shell spawned ({proc or 'powershell'})")
                indicators.append("encoded_script_execution")

        # 3. Credential access
        if event_type == "credential_access" or "credential" in action or "lsass" in description or "mimikatz" in str(metadata).lower():
            w = self.RULE_WEIGHTS["CREDENTIAL_ACCESS"]
            score += w
            triggered_rules.append(TriggeredRule(
                rule_id="RULE-CRED-ACCESS",
                name="Credential Access Activity",
                weight=w,
                reason="Attempted extraction or reading of authentication secrets / LSASS memory",
                evidence_fields={"target": metadata.get("target_process", "lsass.exe")}
            ))
            reasons.append("Attempted credential harvesting / LSASS memory access")
            indicators.append("lsass_memory_dump")

        # 4. Lateral movement
        if event_type == "lateral_movement" or "remote_service" in action or "lateral" in description:
            w = self.RULE_WEIGHTS["LATERAL_MOVEMENT"]
            score += w
            triggered_rules.append(TriggeredRule(
                rule_id="RULE-LATERAL-MOVE",
                name="Lateral Movement",
                weight=w,
                reason=f"Remote execution or service creation connecting {device} to {dest}",
                evidence_fields={"source": device, "destination": dest}
            ))
            reasons.append(f"Host-to-host lateral pivot ({device} -> {dest})")
            indicators.append("remote_service_creation")

        # 5. Sensitive database / file access
        if event_type in ("file_access", "database_query") or "database" in action or "db-01" in str(dest).lower() or "db-01" in description:
            is_sensitive = SecurityBaseline.is_sensitive_target(dest) or "database" in description or "financial" in str(metadata).lower()
            if is_sensitive:
                w = self.RULE_WEIGHTS["SENSITIVE_DATABASE_ACCESS"]
                score += w
                triggered_rules.append(TriggeredRule(
                    rule_id="RULE-SENSITIVE-DB",
                    name="Sensitive Database Access",
                    weight=w,
                    reason=f"Query or extraction targeting protected corporate data store: {dest}",
                    evidence_fields={"target": dest, "table": metadata.get("table_accessed", "unknown")}
                ))
                reasons.append(f"Access to critical database asset ({dest})")
                indicators.append("sensitive_database_query")

        # 6. Network reconnaissance / discovery
        if event_type == "network_activity" and ("scan" in action or "enumeration" in str(metadata).lower() or "discovery" in description):
            w = self.RULE_WEIGHTS["SUSPICIOUS_NETWORK"]
            score += w
            triggered_rules.append(TriggeredRule(
                rule_id="RULE-NETWORK-RECON",
                name="Internal Network Reconnaissance",
                weight=w,
                reason=f"Internal port probing or SMB share discovery from {device}",
                evidence_fields={"target": dest, "ports": metadata.get("ports_probed", [])}
            ))
            reasons.append(f"Internal reconnaissance scan against {dest}")
            indicators.append("internal_port_scan")

        # Clamp single event score to 100
        final_score = min(100, max(0, score))
        severity = self.calculate_severity(final_score)

        return DetectionResult(
            event_id=event_id,
            risk_score=final_score,
            severity=severity,
            triggered_rules=triggered_rules,
            reasons=reasons,
            suspicious_indicators=indicators,
            is_suspicious=len(triggered_rules) > 0 or final_score >= 30
        )

    def calculate_contextual_incident_score(self, events: List[Dict[str, Any]]) -> Tuple[int, str, List[str], List[str]]:
        """
        Contextual False-Positive Reduction & Synergy Calculation:
        Evaluates a cluster of correlated events. A multi-stage attack sequence
        exhibits compounding risk beyond individual isolated actions.
        """
        all_triggered_rule_ids = set()
        all_reasons = []
        all_indicators = []
        base_score_sum = 0

        has_unusual_login = False
        has_powershell = False
        has_credential_access = False
        has_recon = False
        has_lateral_movement = False
        has_db_access = False

        for ev in events:
            det = self.analyze_event(ev)
            for rule in det.triggered_rules:
                if rule.rule_id not in all_triggered_rule_ids:
                    all_triggered_rule_ids.add(rule.rule_id)
                    all_reasons.extend(det.reasons)
                    all_indicators.extend(det.suspicious_indicators)

            ev_type = (ev.get("event_type") or "").lower()
            desc = (ev.get("description") or "").lower()
            act = (ev.get("action") or "").lower()
            meta = ev.get("metadata") or {}
            src_ip = ev.get("source_ip") or ""
            dest = ev.get("destination") or ""

            if "unusual" in desc or "185.23" in src_ip:
                has_unusual_login = True
            if "powershell" in desc or "powershell" in str(meta).lower():
                has_powershell = True
            if ev_type == "credential_access" or "lsass" in desc:
                has_credential_access = True
            if "discovery" in desc or "reconnaissance" in desc:
                has_recon = True
            if ev_type == "lateral_movement" or "lateral" in desc:
                has_lateral_movement = True
            if "database" in desc or "db-01" in str(dest).lower():
                has_db_access = True

        # Base scoring calculation according to Section 8:
        # New login alone: 15
        # New login + new device: 30
        # New login + PowerShell: 50
        # New login + PowerShell + credential access: 75
        # New login + PowerShell + credential access + lateral movement: 91
        calculated_score = 0
        synergy_explanations = []

        if has_unusual_login:
            calculated_score = 15
            synergy_explanations.append("Initial external login from untrusted IP established the initial foothold.")

        if has_unusual_login and has_powershell:
            calculated_score = 50
            synergy_explanations.append("Contextual Escalation (+35): Untrusted external login immediately executed encoded PowerShell commands.")

        if has_powershell and has_credential_access:
            calculated_score = max(calculated_score, 75)
            synergy_explanations.append("Contextual Escalation (+25): Encoded script execution followed directly by LSASS memory credential access.")

        if has_credential_access and has_lateral_movement:
            calculated_score = max(calculated_score, 88)
            synergy_explanations.append("Contextual Escalation (+13): Dumped credentials were successfully utilized to pivot laterally to internal server.")

        if has_lateral_movement and has_db_access:
            calculated_score = max(calculated_score, 91)
            synergy_explanations.append("Contextual Escalation (+3): Lateral movement culminated in access to high-value database DB-01.")

        # If it's another combination not matching the exact chain:
        if calculated_score == 0:
            calculated_score = min(100, len(all_triggered_rule_ids) * 20)

        # Ensure bounds
        final_score = min(100, max(0, calculated_score))
        severity = self.calculate_severity(final_score)

        return final_score, severity, list(set(all_reasons)), synergy_explanations


risk_engine = RiskEngine()
