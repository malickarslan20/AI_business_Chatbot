# routers/chatbot_router.py

import json
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect
from pydantic import BaseModel

from agents.agent import run, stream


router = APIRouter()


# ── Models ────────────────────────────────────────────────────

class ChatRequest(BaseModel):
    message: str
    context: dict = {}


class ChatResponse(BaseModel):
    response: str
    timestamp: str


# ── REST endpoint ─────────────────────────────────────────────

@router.post("/message", response_model=ChatResponse, summary="Send chat message")
async def chat_message(payload: ChatRequest):
    """
    Send a message to the AI agent and get a full response.
    Waits for the complete answer before returning.

    Body: {"message": "show me pending invoices", "context": {}}

    For streaming token-by-token, use the WebSocket at /chat/ws instead.
    """
    if not payload.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    try:
        response_text = run(payload.message, context=payload.context)
        return ChatResponse(
            response=response_text,
            timestamp=datetime.now(timezone.utc).isoformat(),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Agent error: {e}")


# ── WebSocket streaming endpoint ──────────────────────────────

@router.websocket("/ws")
async def chat_websocket(websocket: WebSocket):
    """
    WebSocket for streaming AI responses token by token.

    Client sends : {"message": "your question"}
    Server sends : {"chunk": "Hello", "done": false}  ← repeated per token
    Server sends : {"chunk": "", "done": true}         ← signals end of stream

    Connect: ws://localhost:8000/chat/ws
    """
    await websocket.accept()

    try:
        while True:
            # Wait for message from client
            raw = await websocket.receive_text()

            try:
                data = json.loads(raw)
                user_message = data.get("message", "").strip()
                context = data.get("context", {})
            except json.JSONDecodeError:
                await websocket.send_json({
                    "error": 'Invalid JSON. Send: {"message": "your text"}',
                    "done": True
                })
                continue

            if not user_message:
                await websocket.send_json({"error": "Empty message", "done": True})
                continue

            # Stream agent response back chunk by chunk
            try:
                async for chunk in stream(user_message, context=context):
                    await websocket.send_json({"chunk": chunk, "done": False})

                # Signal stream is complete
                await websocket.send_json({"chunk": "", "done": True})

            except Exception as e:
                await websocket.send_json({
                    "error": f"Agent error: {e}",
                    "done": True
                })

    except WebSocketDisconnect:
        print("WebSocket client disconnected")   # normal — not an error
    except Exception as e:
        print(f"WebSocket error: {e}")