from typing import Dict, Any, List, Optional
import time
import uuid
import logging

logger = logging.getLogger("ai_cyberguard.session")


class SessionManager:
    """
    Tracks and validates active user sessions, device associations, and impossible travel.
    """
    def __init__(self):
        self._sessions: Dict[str, Dict[str, Any]] = {}

    def create_session(self, user_id: str, username: str, device: str, ip: str) -> Dict[str, Any]:
        session_id = f"SES-{uuid.uuid4().hex[:8].upper()}"
        now = time.time()
        session_data = {
            "session_id": session_id,
            "user_id": user_id,
            "username": username,
            "device": device,
            "ip": ip,
            "login_time": now,
            "last_activity": now,
            "is_revoked": False,
            "expires_at": now + (86400 * 7)  # 7 days
        }
        self._sessions[session_id] = session_data
        return session_data

    def get_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        session = self._sessions.get(session_id)
        if not session:
            return None
        if session["is_revoked"] or session["expires_at"] < time.time():
            return None
        # update last activity
        session["last_activity"] = time.time()
        return session

    def revoke_session(self, session_id: str) -> bool:
        if session_id in self._sessions:
            self._sessions[session_id]["is_revoked"] = True
            return True
        return False

    def revoke_all_user_sessions(self, user_id: str) -> int:
        count = 0
        for s in self._sessions.values():
            if s["user_id"] == user_id and not s["is_revoked"]:
                s["is_revoked"] = True
                count += 1
        return count

    def get_user_active_sessions(self, user_id: str) -> List[Dict[str, Any]]:
        now = time.time()
        return [
            s for s in self._sessions.values()
            if s["user_id"] == user_id and not s["is_revoked"] and s["expires_at"] > now
        ]

    def check_suspicious_session_transition(self, user_id: str, new_ip: str, new_device: str) -> Dict[str, Any]:
        """Identifies concurrent logins from anomalous geographic or device vectors."""
        active = self.get_user_active_sessions(user_id)
        is_new_ip = not any(s["ip"] == new_ip for s in active)
        is_new_device = not any(s["device"] == new_device for s in active)
        
        # Check impossible travel: external login while active on internal subnet within 15 mins
        is_impossible_travel = False
        if is_new_ip and not (new_ip.startswith("10.") or new_ip.startswith("192.168.")):
            recent_internal = [
                s for s in active
                if (s["ip"].startswith("10.") or s["ip"].startswith("192.168.")) and (time.time() - s["last_activity"] < 900)
            ]
            if recent_internal:
                is_impossible_travel = True

        return {
            "is_new_ip": is_new_ip,
            "is_new_device": is_new_device,
            "is_impossible_travel": is_impossible_travel,
            "active_session_count": len(active)
        }


session_manager = SessionManager()
