from typing import Dict, Any, List, Set, Optional
from datetime import datetime, timezone
import math


class BaselineManager:
    """
    Learns and maintains behavioral baselines for users and host devices.
    Returns INSUFFICIENT_DATA rather than false anomalies when history is insufficient.
    """
    MIN_OBSERVATIONS_FOR_BASELINE = 3

    def __init__(self):
        # user -> { "known_ips": set(), "known_devices": set(), "event_count": int, "normal_hours": set() }
        self._user_profiles: Dict[str, Dict[str, Any]] = {
            "alex": {
                "known_ips": {"10.0.0.15", "10.0.0.22"},
                "known_devices": {"PC-017", "LAPTOP-ALEX"},
                "event_count": 48,
                "normal_hours": {8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18}
            },
            "sarah": {
                "known_ips": {"10.0.1.42"},
                "known_devices": {"PC-042"},
                "event_count": 32,
                "normal_hours": {9, 10, 11, 12, 13, 14, 15, 16, 17}
            },
            "admin": {
                "known_ips": {"10.0.0.5"},
                "known_devices": {"JUMP-SRV-01"},
                "event_count": 60,
                "normal_hours": {7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19}
            }
        }

    def evaluate_user_baseline(self, user: str, ip: str, device: str, timestamp_iso: Optional[str] = None) -> Dict[str, Any]:
        user_key = (user or "unknown").lower()
        profile = self._user_profiles.get(user_key)

        if not profile or profile["event_count"] < self.MIN_OBSERVATIONS_FOR_BASELINE:
            return {
                "status": "INSUFFICIENT_DATA",
                "is_new_user": profile is None,
                "is_unseen_ip": False,
                "is_unseen_device": False,
                "is_after_hours": False,
                "confidence": 0.2
            }

        hour = 12
        if timestamp_iso:
            try:
                dt = datetime.fromisoformat(timestamp_iso.replace("Z", "+00:00"))
                hour = dt.hour
            except Exception:
                hour = 12

        is_unseen_ip = bool(ip and ip not in profile["known_ips"] and not (ip.startswith("10.") or ip.startswith("192.168.")))
        is_unseen_device = bool(device and device.upper() not in profile["known_devices"])
        is_after_hours = hour not in profile["normal_hours"]

        return {
            "status": "BASELINE_ACTIVE",
            "is_new_user": False,
            "is_unseen_ip": is_unseen_ip,
            "is_unseen_device": is_unseen_device,
            "is_after_hours": is_after_hours,
            "confidence": min(1.0, profile["event_count"] / 50.0)
        }

    def record_normal_observation(self, user: str, ip: str, device: str):
        user_key = (user or "unknown").lower()
        if user_key not in self._user_profiles:
            self._user_profiles[user_key] = {
                "known_ips": set(),
                "known_devices": set(),
                "event_count": 0,
                "normal_hours": set(range(8, 19))
            }
        p = self._user_profiles[user_key]
        p["event_count"] += 1
        if ip:
            p["known_ips"].add(ip)
        if device:
            p["known_devices"].add(device.upper())


baseline_manager = BaselineManager()
