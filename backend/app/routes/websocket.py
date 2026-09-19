from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import logging
from backend.app.services.websocket_manager import ws_manager

logger = logging.getLogger("ai_cyberguard.routes.ws")

router = APIRouter(tags=["Real-Time WebSockets"])


@router.websocket("/ws/stream")
async def websocket_stream_endpoint(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        # Send initial welcome & connection confirmation
        await websocket.send_json({
            "type": "CONNECTION_ESTABLISHED",
            "data": {
                "message": "Connected to AI-CyberGuard Real-Time Threat Stream",
                "status": "listening"
            }
        })
        while True:
            # Keep connection alive and receive any client-side ping/messages
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_json({"type": "PONG", "data": {}})
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
    except Exception as e:
        logger.warning(f"WebSocket error: {e}")
        ws_manager.disconnect(websocket)
