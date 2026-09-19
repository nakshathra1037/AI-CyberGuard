"""
Baseline security profiles representing known corporate norms for users, devices, and networks.
Used to detect anomalies deterministically.
"""

from typing import Dict, Any, List, Set


class SecurityBaseline:
    # Known normal user-to-device mappings
    USER_NORMAL_DEVICES: Dict[str, Set[str]] = {
        "alex": {"PC-017", "LAPTOP-ALEX"},
        "sarah": {"PC-042"},
        "admin": {"JUMP-SRV-01", "SEC-ADMIN-PC"}
    }

    # Internal safe IP subnets/prefixes
    INTERNAL_SUBNETS: List[str] = [
        "10.0.",
        "192.168.",
        "172.16."
    ]

    # Standard business hours (UTC)
    BUSINESS_HOURS_START = 8
    BUSINESS_HOURS_END = 19

    # Known high-value / sensitive target servers and databases
    CRITICAL_ASSETS: Set[str] = {
        "FILESERVER-02",
        "DB-01",
        "DC-01",
        "PAYROLL-SRV"
    }

    # Known suspicious process indicators
    SUSPICIOUS_PROCESS_KEYWORDS: List[str] = [
        "powershell.exe -nop",
        "-enc",
        "mimikatz",
        "lsass",
        "vssadmin",
        "certutil -urlcache",
        "psexec",
        "wmic process call create",
        "rundll32"
    ]

    @classmethod
    def is_internal_ip(cls, ip: str) -> bool:
        if not ip:
            return True
        return any(ip.startswith(prefix) for prefix in cls.INTERNAL_SUBNETS) or ip.lower() in ("localhost", "127.0.0.1")

    @classmethod
    def is_normal_device_for_user(cls, user: str, device: str) -> bool:
        if not user or not device:
            return True
        normal_devices = cls.USER_NORMAL_DEVICES.get(user.lower())
        if not normal_devices:
            return True
        return device.upper() in normal_devices

    @classmethod
    def is_sensitive_target(cls, target: str) -> bool:
        if not target:
            return False
        return target.upper() in cls.CRITICAL_ASSETS
