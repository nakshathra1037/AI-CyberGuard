import httpx
import logging
from typing import Optional, List, Dict, Any
from backend.app.config import settings

logger = logging.getLogger("ai_cyberguard.llm")


class LLMClient:
    """
    OpenAI-compatible LLM Client with timeout protection and offline fallback detection.
    """
    def __init__(self):
        self.api_key = settings.LLM_API_KEY
        self.model = settings.LLM_MODEL
        self.base_url = settings.LLM_BASE_URL.rstrip("/")

    @property
    def is_configured(self) -> bool:
        return bool(self.api_key and self.api_key.strip())

    async def generate_response(self, system_prompt: str, user_prompt: str) -> Optional[str]:
        if not self.is_configured:
            return None

        url = f"{self.base_url}/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            "temperature": 0.2,
            "max_tokens": 800
        }

        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                res = await client.post(url, headers=headers, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    content = data["choices"][0]["message"]["content"]
                    return content
                else:
                    logger.warning(f"LLM API returned status {res.status_code}: {res.text}")
                    return None
        except Exception as e:
            logger.warning(f"LLM API request failed: {e}. Utilizing deterministic fallback.")
            return None


llm_client = LLMClient()
