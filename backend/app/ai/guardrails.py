import re
from typing import Dict, Any, List

INJECTION_PATTERNS = [
    re.compile(r"ignore\s+(all\s+)?(previous|above|prior)\s+instructions?", re.IGNORECASE),
    re.compile(r"(system\s+override|admin\s+mode|developer\s+mode)", re.IGNORECASE),
    re.compile(r"reveal\s+(the\s+)?(api[_\s]?key|password|secret|token)", re.IGNORECASE),
    re.compile(r"(drop|delete|truncate)\s+table", re.IGNORECASE),
    re.compile(r"exec(ute)?\s+command", re.IGNORECASE),
    re.compile(r"you\s+are\s+now\s+an?\s+unrestricted", re.IGNORECASE)
]


class PromptGuardrail:
    """
    Sanitizes untrusted telemetry payloads and enforces strict structural separation
    between System Prompts and Security Log Evidence.
    """

    @classmethod
    def sanitize_untrusted_text(cls, text: str, max_length: int = 500) -> str:
        if not text:
            return ""
        sanitized = str(text)[:max_length]
        for pattern in INJECTION_PATTERNS:
            sanitized = pattern.sub("[FILTERED_UNTRUSTED_INPUT]", sanitized)
        # Neutralize markdown/prompt escaping attempts
        sanitized = sanitized.replace("```", "'''")
        return sanitized

    @classmethod
    def build_secure_context(cls, incident: Dict[str, Any]) -> str:
        """Constructs an isolated, read-only data block labeled explicitly as untrusted telemetry."""
        inc_id = cls.sanitize_untrusted_text(incident.get("incident_id", "INC-UNKNOWN"))
        title = cls.sanitize_untrusted_text(incident.get("title", ""))
        sev = cls.sanitize_untrusted_text(str(incident.get("severity", "unknown")))
        score = incident.get("risk_score", 0)
        
        evidence_lines = []
        for e in incident.get("evidence", [])[:10]:
            ev_id = cls.sanitize_untrusted_text(e.get("event_id", ""))
            desc = cls.sanitize_untrusted_text(e.get("description", ""))
            evidence_lines.append(f"- [{ev_id}] {desc}")

        evidence_str = "\n".join(evidence_lines) if evidence_lines else "- No explicit evidence items attached."

        return (
            f"=== BEGIN UNTRUSTED SECURITY EVIDENCE (READ-ONLY DATA) ===\n"
            f"Incident ID: {inc_id}\n"
            f"Title: {title}\n"
            f"Evaluated Risk Score: {score}/100 ({sev.upper()})\n"
            f"Observed Evidence:\n{evidence_str}\n"
            f"=== END UNTRUSTED SECURITY EVIDENCE ==="
        )
