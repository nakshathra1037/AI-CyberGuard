from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
import logging

logger = logging.getLogger("ai_cyberguard.cti")


class CTIService:
    """
    Cyber Threat Intelligence (CTI) Enrichment Service.
    Enriches indicators (IPs, hashes, domain, commands) with threat actor attribution,
    reputation scoring, and MITRE ATT&CK mapping.
    """

    KNOWN_MALICIOUS_IPS = {
        "185.23.44.12": {
            "reputation_score": 95,
            "status": "malicious",
            "threat_actor": "APT29 (Cozy Bear) Proxy Node",
            "country": "Netherlands (Hosting Provider: Stark Industries NL)",
            "threat_category": "Initial Access / Command & Control",
            "first_seen": "2026-08-10",
            "abuse_reports": 142
        },
        "194.26.29.114": {
            "reputation_score": 88,
            "status": "malicious",
            "threat_actor": "FIN7 / Carbanak Infrastructure",
            "country": "Romania",
            "threat_category": "Credential Access / Botnet",
            "first_seen": "2026-09-01",
            "abuse_reports": 89
        },
        "45.142.214.50": {
            "reputation_score": 92,
            "status": "malicious",
            "threat_actor": "LockBit 3.0 Affiliate Scanner",
            "country": "Russia",
            "threat_category": "Reconnaissance / Vulnerability Scanner",
            "first_seen": "2026-07-22",
            "abuse_reports": 210
        }
    }

    KNOWN_THREAT_SIGNATURES = {
        "powershell.exe -enc": {
            "tactic": "Execution",
            "technique": "T1059.001",
            "description": "Base64 encoded PowerShell command line execution commonly used in dropper stages."
        },
        "lsass": {
            "tactic": "Credential Access",
            "technique": "T1003.001",
            "description": "LSASS process memory reading/dumping to extract plain-text passwords and Kerberos tickets."
        },
        "mimikatz": {
            "tactic": "Credential Access",
            "technique": "T1003",
            "description": "Known post-exploitation tool for harvesting Windows credentials."
        },
        "psexec": {
            "tactic": "Lateral Movement",
            "technique": "T1021.002",
            "description": "Sysinternals utility abused for remote code execution across LAN."
        }
    }

    @classmethod
    def lookup_ip(cls, ip: str) -> Dict[str, Any]:
        """Looks up threat intelligence reputation for a given IP address."""
        if not ip:
            return {"status": "unknown", "reputation_score": 0, "is_internal": True}

        # Internal IP check
        if ip.startswith("10.") or ip.startswith("192.168.") or ip.startswith("172.16.") or ip in ("127.0.0.1", "localhost"):
            return {
                "ip": ip,
                "status": "trusted_internal",
                "reputation_score": 0,
                "is_internal": True,
                "country": "Internal Enterprise LAN",
                "threat_actor": "None (Private Network)"
            }

        if ip in cls.KNOWN_MALICIOUS_IPS:
            data = dict(cls.KNOWN_MALICIOUS_IPS[ip])
            data["ip"] = ip
            data["is_internal"] = False
            return data

        # Default external reputation evaluation
        return {
            "ip": ip,
            "status": "unclassified_external",
            "reputation_score": 45,
            "is_internal": False,
            "country": "External Public IP",
            "threat_actor": "Unattributed Source",
            "threat_category": "Standard Inbound Traffic"
        }

    @classmethod
    def enrich_event(cls, event: Dict[str, Any]) -> Dict[str, Any]:
        """Attaches CTI metadata to an incoming security event."""
        src_ip = event.get("source_ip", "")
        metadata = event.get("metadata", {}) or {}
        cti_info = {}

        if src_ip:
            ip_intel = cls.lookup_ip(src_ip)
            cti_info["ip_intelligence"] = ip_intel

        desc = (event.get("description", "") + " " + str(metadata)).lower()
        matched_signatures = []
        for sig, details in cls.KNOWN_THREAT_SIGNATURES.items():
            if sig in desc:
                matched_signatures.append(details)

        if matched_signatures:
            cti_info["threat_signatures"] = matched_signatures

        enriched_event = dict(event)
        if "metadata" not in enriched_event or not isinstance(enriched_event["metadata"], dict):
            enriched_event["metadata"] = {}
        enriched_event["metadata"]["cti_enrichment"] = cti_info

        return enriched_event


cti_service = CTIService()
