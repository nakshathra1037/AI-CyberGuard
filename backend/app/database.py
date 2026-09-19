import logging
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
import asyncio

logger = logging.getLogger("ai_cyberguard.database")


class BaseRepository:
    """Abstract interface for storage operations"""
    async def init_db(self):
        pass

    async def get_storage_type(self) -> str:
        raise NotImplementedError


class InMemoryRepository(BaseRepository):
    """Zero-dependency in-memory thread-safe repository with seeded security intelligence"""
    def __init__(self):
        self._events: Dict[str, Dict[str, Any]] = {}
        self._incidents: Dict[str, Dict[str, Any]] = {}
        self._investigations: List[Dict[str, Any]] = []
        self._response_actions: Dict[str, List[Dict[str, Any]]] = {}  # incident_id -> actions
        self._feedback: List[Dict[str, Any]] = []
        self._patterns: Dict[str, Dict[str, Any]] = {}
        self._lock = asyncio.Lock()
        self._seed_default_patterns()

    def _seed_default_patterns(self):
        default_patterns = [
            {
                "pattern_id": "PAT-001",
                "pattern_signature": "unusual_login + powershell + credential_access",
                "description": "Suspicious login followed swiftly by PowerShell spawn and LSASS memory access",
                "occurrences": 4,
                "severity": "high",
                "mitre_techniques": ["T1078", "T1059.001", "T1003.001"],
                "last_observed": "2026-09-19T09:14:00Z",
                "examples_incidents": ["INC-1024", "INC-0992"]
            },
            {
                "pattern_id": "PAT-002",
                "pattern_signature": "lateral_movement + database_query",
                "description": "Internal lateral hop to file/app server immediately pivoting to sensitive DB",
                "occurrences": 2,
                "severity": "critical",
                "mitre_techniques": ["T1021.002", "T1005"],
                "last_observed": "2026-09-19T09:19:00Z",
                "examples_incidents": ["INC-1024"]
            },
            {
                "pattern_id": "PAT-003",
                "pattern_signature": "repeated_failed_logins + password_spray",
                "description": "Cluster of rapid failed logins across multiple user accounts from single external IP",
                "occurrences": 8,
                "severity": "medium",
                "mitre_techniques": ["T1110.003"],
                "last_observed": "2026-09-18T22:45:00Z",
                "examples_incidents": ["INC-1011", "INC-1018"]
            }
        ]
        for pat in default_patterns:
            self._patterns[pat["pattern_id"]] = pat

    async def get_storage_type(self) -> str:
        return "InMemoryRepository"

    # --- Events ---
    async def save_event(self, event_data: Dict[str, Any]) -> Dict[str, Any]:
        async with self._lock:
            self._events[event_data["event_id"]] = event_data
            return event_data

    async def save_events_bulk(self, events_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        async with self._lock:
            for ev in events_data:
                self._events[ev["event_id"]] = ev
            return events_data

    async def get_event(self, event_id: str) -> Optional[Dict[str, Any]]:
        return self._events.get(event_id)

    async def get_all_events(self, limit: int = 100) -> List[Dict[str, Any]]:
        return list(self._events.values())[:limit]

    # --- Incidents ---
    async def save_incident(self, incident_data: Dict[str, Any]) -> Dict[str, Any]:
        async with self._lock:
            self._incidents[incident_data["incident_id"]] = incident_data
            return incident_data

    async def get_incident(self, incident_id: str) -> Optional[Dict[str, Any]]:
        return self._incidents.get(incident_id)

    async def get_all_incidents(self) -> List[Dict[str, Any]]:
        return list(self._incidents.values())

    async def update_incident_status(self, incident_id: str, status: str, comment: Optional[str] = None) -> Optional[Dict[str, Any]]:
        async with self._lock:
            inc = self._incidents.get(incident_id)
            if not inc:
                return None
            inc["status"] = status
            inc["updated_at"] = datetime.now(timezone.utc).isoformat()
            if "status_history" not in inc:
                inc["status_history"] = []
            inc["status_history"].append({
                "status": status,
                "timestamp": inc["updated_at"],
                "comment": comment or f"Status changed to {status}"
            })
            return inc

    # --- Responses ---
    async def save_response_action(self, action_data: Dict[str, Any]) -> Dict[str, Any]:
        async with self._lock:
            inc_id = action_data["incident_id"]
            if inc_id not in self._response_actions:
                self._response_actions[inc_id] = []
            self._response_actions[inc_id].append(action_data)
            return action_data

    async def get_response_actions(self, incident_id: str) -> List[Dict[str, Any]]:
        return self._response_actions.get(incident_id, [])

    async def get_all_response_actions(self) -> List[Dict[str, Any]]:
        all_actions = []
        for acts in self._response_actions.values():
            all_actions.extend(acts)
        return all_actions

    # --- Investigations (AI Chat History) ---
    async def save_investigation_record(self, record_data: Dict[str, Any]) -> Dict[str, Any]:
        async with self._lock:
            self._investigations.append(record_data)
            return record_data

    async def get_investigation_history(self, incident_id: str) -> List[Dict[str, Any]]:
        return [r for r in self._investigations if r.get("incident_id") == incident_id]

    # --- Feedback & Learning ---
    async def save_feedback(self, feedback_data: Dict[str, Any]) -> Dict[str, Any]:
        async with self._lock:
            self._feedback.append(feedback_data)
            # Check if this confirms a threat and update patterns
            inc_id = feedback_data.get("incident_id")
            inc = self._incidents.get(inc_id)
            if inc and feedback_data.get("feedback_type") == "confirmed_threat":
                # Increment matching pattern
                for p in self._patterns.values():
                    if "unusual_login" in p["pattern_signature"]:
                        p["occurrences"] += 1
                        p["last_observed"] = datetime.now(timezone.utc).isoformat()
            return feedback_data

    async def get_all_feedback(self) -> List[Dict[str, Any]]:
        return self._feedback

    # --- Patterns ---
    async def get_all_patterns(self) -> List[Dict[str, Any]]:
        return list(self._patterns.values())

    async def upsert_pattern(self, pattern_signature: str, details: Dict[str, Any]) -> Dict[str, Any]:
        async with self._lock:
            for pid, pat in self._patterns.items():
                if pat["pattern_signature"] == pattern_signature:
                    pat["occurrences"] += 1
                    pat["last_observed"] = datetime.now(timezone.utc).isoformat()
                    return pat
            new_pid = f"PAT-00{len(self._patterns) + 1}"
            details["pattern_id"] = new_pid
            details["pattern_signature"] = pattern_signature
            details["occurrences"] = 1
            details["last_observed"] = datetime.now(timezone.utc).isoformat()
            self._patterns[new_pid] = details
            return details

    # --- Reset (for Demo Mode) ---
    async def clear_all(self):
        async with self._lock:
            self._events.clear()
            self._incidents.clear()
            self._investigations.clear()
            self._response_actions.clear()
            self._feedback.clear()
            self._patterns.clear()
            self._seed_default_patterns()


class MongoRepository(BaseRepository):
    """MongoDB implementation with connection pooling and graceful error handling"""
    def __init__(self, uri: str, db_name: str):
        self.uri = uri
        self.db_name = db_name
        self.client = None
        self.db = None

    async def init_db(self):
        from motor.motor_asyncio import AsyncIOMotorClient
        self.client = AsyncIOMotorClient(self.uri, serverSelectionTimeoutMS=2000)
        self.db = self.client[self.db_name]
        # Ping to test connection
        await self.client.admin.command('ping')
        logger.info("Successfully connected to MongoDB.")

    async def get_storage_type(self) -> str:
        return "MongoRepository"

    async def save_event(self, event_data: Dict[str, Any]) -> Dict[str, Any]:
        data = dict(event_data)
        data["_id"] = data["event_id"]
        await self.db.events.replace_one({"_id": data["_id"]}, data, upsert=True)
        return event_data

    async def save_events_bulk(self, events_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        for ev in events_data:
            await self.save_event(ev)
        return events_data

    async def get_event(self, event_id: str) -> Optional[Dict[str, Any]]:
        doc = await self.db.events.find_one({"event_id": event_id})
        if doc:
            doc.pop("_id", None)
        return doc

    async def get_all_events(self, limit: int = 100) -> List[Dict[str, Any]]:
        cursor = self.db.events.find({}).limit(limit)
        docs = await cursor.to_list(length=limit)
        for d in docs:
            d.pop("_id", None)
        return docs

    async def save_incident(self, incident_data: Dict[str, Any]) -> Dict[str, Any]:
        data = dict(incident_data)
        data["_id"] = data["incident_id"]
        await self.db.incidents.replace_one({"_id": data["_id"]}, data, upsert=True)
        return incident_data

    async def get_incident(self, incident_id: str) -> Optional[Dict[str, Any]]:
        doc = await self.db.incidents.find_one({"incident_id": incident_id})
        if doc:
            doc.pop("_id", None)
        return doc

    async def get_all_incidents(self) -> List[Dict[str, Any]]:
        cursor = self.db.incidents.find({})
        docs = await cursor.to_list(length=200)
        for d in docs:
            d.pop("_id", None)
        return docs

    async def update_incident_status(self, incident_id: str, status: str, comment: Optional[str] = None) -> Optional[Dict[str, Any]]:
        inc = await self.get_incident(incident_id)
        if not inc:
            return None
        now_str = datetime.now(timezone.utc).isoformat()
        status_entry = {
            "status": status,
            "timestamp": now_str,
            "comment": comment or f"Status changed to {status}"
        }
        await self.db.incidents.update_one(
            {"incident_id": incident_id},
            {
                "$set": {"status": status, "updated_at": now_str},
                "$push": {"status_history": status_entry}
            }
        )
        return await self.get_incident(incident_id)

    async def save_response_action(self, action_data: Dict[str, Any]) -> Dict[str, Any]:
        data = dict(action_data)
        data["_id"] = data["action_id"]
        await self.db.response_actions.replace_one({"_id": data["_id"]}, data, upsert=True)
        return action_data

    async def get_response_actions(self, incident_id: str) -> List[Dict[str, Any]]:
        cursor = self.db.response_actions.find({"incident_id": incident_id})
        docs = await cursor.to_list(length=100)
        for d in docs:
            d.pop("_id", None)
        return docs

    async def get_all_response_actions(self) -> List[Dict[str, Any]]:
        cursor = self.db.response_actions.find({})
        docs = await cursor.to_list(length=200)
        for d in docs:
            d.pop("_id", None)
        return docs

    async def save_investigation_record(self, record_data: Dict[str, Any]) -> Dict[str, Any]:
        await self.db.investigations.insert_one(dict(record_data))
        return record_data

    async def get_investigation_history(self, incident_id: str) -> List[Dict[str, Any]]:
        cursor = self.db.investigations.find({"incident_id": incident_id})
        docs = await cursor.to_list(length=100)
        for d in docs:
            d.pop("_id", None)
        return docs

    async def save_feedback(self, feedback_data: Dict[str, Any]) -> Dict[str, Any]:
        await self.db.feedback.insert_one(dict(feedback_data))
        return feedback_data

    async def get_all_feedback(self) -> List[Dict[str, Any]]:
        cursor = self.db.feedback.find({})
        docs = await cursor.to_list(length=200)
        for d in docs:
            d.pop("_id", None)
        return docs

    async def get_all_patterns(self) -> List[Dict[str, Any]]:
        cursor = self.db.patterns.find({})
        docs = await cursor.to_list(length=50)
        for d in docs:
            d.pop("_id", None)
        return docs

    async def upsert_pattern(self, pattern_signature: str, details: Dict[str, Any]) -> Dict[str, Any]:
        now_str = datetime.now(timezone.utc).isoformat()
        await self.db.patterns.update_one(
            {"pattern_signature": pattern_signature},
            {
                "$set": {"last_observed": now_str, "description": details.get("description", "")},
                "$inc": {"occurrences": 1},
                "$setOnInsert": {
                    "pattern_id": details.get("pattern_id", "PAT-AUTO"),
                    "severity": details.get("severity", "high"),
                    "mitre_techniques": details.get("mitre_techniques", [])
                }
            },
            upsert=True
        )
        doc = await self.db.patterns.find_one({"pattern_signature": pattern_signature})
        if doc:
            doc.pop("_id", None)
        return doc

    async def clear_all(self):
        await self.db.events.delete_many({})
        await self.db.incidents.delete_many({})
        await self.db.investigations.delete_many({})
        await self.db.response_actions.delete_many({})
        await self.db.feedback.delete_many({})
        await self.db.patterns.delete_many({})


# Global repository factory
_repo_instance: Optional[BaseRepository] = None


async def get_repository() -> BaseRepository:
    """Returns initialized repository instance, automatically falling back to InMemory if Mongo is unavailable"""
    global _repo_instance
    if _repo_instance is not None:
        return _repo_instance

    from backend.app.config import settings

    if settings.MONGODB_URI:
        try:
            mongo_repo = MongoRepository(settings.MONGODB_URI, settings.MONGODB_DATABASE)
            await mongo_repo.init_db()
            logger.info("Using MongoRepository as database engine.")
            _repo_instance = mongo_repo
            return _repo_instance
        except Exception as e:
            logger.warning(f"MongoDB connection failed ({e}). Falling back to InMemoryRepository.")

    # Default fallback
    logger.info("Using InMemoryRepository (zero-dependency fallback).")
    _repo_instance = InMemoryRepository()
    return _repo_instance
