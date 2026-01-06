"""AG-UI Protocol endpoint for CopilotKit integration.

This module implements the AG-UI (Agent-User Interaction) protocol
for streaming agent responses to the frontend.
"""

from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse
from openai import AsyncOpenAI
from app.config import get_settings
import json
import uuid
import time
from typing import AsyncGenerator, Any, Optional

router = APIRouter()
settings = get_settings()
client = AsyncOpenAI(api_key=settings.openai_api_key)

SYSTEM_PROMPT = """You are TripMate AI, an expert travel planning assistant. Your role is to help users plan their perfect trip by understanding their preferences and providing personalized recommendations.

CAPABILITIES:
- Recommend destinations based on user preferences
- Create detailed day-by-day itineraries
- Estimate trip costs and budgets
- Suggest activities, restaurants, and accommodations
- Provide practical travel tips and advice

GUIDELINES:
1. Ask clarifying questions when information is missing (dates, budget, interests, travelers)
2. Always consider: budget constraints, travel dates, group composition, accessibility needs
3. Provide specific, actionable recommendations (not generic advice)
4. Include practical details: costs, opening hours, booking requirements
5. Be honest about limitations and uncertainties
6. Consider seasonality and local events

RESPONSE FORMAT:
- Be conversational but concise
- Use structured formats for itineraries and recommendations
- Include reasoning for recommendations
- Offer alternatives when appropriate"""


def create_event(event_type: str, **kwargs) -> str:
    """Create an AG-UI formatted event."""
    event = {
        "type": event_type,
        "timestamp": int(time.time() * 1000),
        **kwargs
    }
    return f"data: {json.dumps(event)}\n\n"


async def stream_agent_response(
    messages: list,
    thread_id: str,
    run_id: str
) -> AsyncGenerator[str, None]:
    """Stream AG-UI events from the OpenAI agent."""

    # Emit RUN_STARTED event
    yield create_event(
        "RUN_STARTED",
        thread_id=thread_id,
        run_id=run_id
    )

    # Prepare messages for OpenAI
    openai_messages = [{"role": "system", "content": SYSTEM_PROMPT}]

    for msg in messages[-10:]:  # Keep last 10 messages for context
        role = msg.get("role", "user")
        content = msg.get("content", "")
        if role in ["user", "assistant"] and content:
            openai_messages.append({"role": role, "content": content})

    try:
        # Create message ID for this response
        message_id = f"msg_{uuid.uuid4().hex[:8]}"

        # Emit TEXT_MESSAGE_START event
        yield create_event(
            "TEXT_MESSAGE_START",
            message_id=message_id,
            role="assistant"
        )

        # Stream from OpenAI
        stream = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=openai_messages,
            temperature=0.7,
            max_tokens=2000,
            stream=True
        )

        full_content = ""
        async for chunk in stream:
            if chunk.choices and chunk.choices[0].delta.content:
                content_chunk = chunk.choices[0].delta.content
                full_content += content_chunk

                # Emit TEXT_MESSAGE_CONTENT event for each chunk
                yield create_event(
                    "TEXT_MESSAGE_CONTENT",
                    message_id=message_id,
                    delta=content_chunk
                )

        # Emit TEXT_MESSAGE_END event
        yield create_event(
            "TEXT_MESSAGE_END",
            message_id=message_id
        )

        # Emit RUN_FINISHED event
        yield create_event(
            "RUN_FINISHED",
            thread_id=thread_id,
            run_id=run_id
        )

    except Exception as e:
        # Emit RUN_ERROR event
        yield create_event(
            "RUN_ERROR",
            message=str(e),
            code="AGENT_ERROR"
        )


@router.post("/agent")
async def agent_endpoint(request: Request):
    """AG-UI protocol endpoint for agent execution.

    This endpoint accepts messages and streams AG-UI events back to the client.
    Compatible with CopilotKit's useAgent hook.
    """
    body = await request.json()

    # Extract messages from the request
    messages = body.get("messages", [])

    # Generate thread and run IDs
    thread_id = body.get("threadId") or f"thread_{uuid.uuid4().hex[:8]}"
    run_id = f"run_{uuid.uuid4().hex[:8]}"

    return StreamingResponse(
        stream_agent_response(messages, thread_id, run_id),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        }
    )


@router.get("/agent/info")
async def agent_info():
    """Return information about the agent and available actions."""
    return {
        "name": "TripMate AI",
        "description": "An intelligent travel planning assistant",
        "version": "2.0.0",
        "protocol": "ag-ui",
        "capabilities": [
            "travel-planning",
            "destination-recommendations",
            "itinerary-generation",
            "budget-estimation"
        ],
        "actions": [
            {
                "name": "planTrip",
                "description": "Plan a complete trip based on user preferences",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "destination": {"type": "string", "description": "Travel destination"},
                        "startDate": {"type": "string", "description": "Trip start date"},
                        "endDate": {"type": "string", "description": "Trip end date"},
                        "budget": {"type": "number", "description": "Total budget"},
                        "travelers": {"type": "integer", "description": "Number of travelers"}
                    },
                    "required": ["destination"]
                }
            },
            {
                "name": "recommendDestinations",
                "description": "Get destination recommendations based on preferences",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "interests": {"type": "array", "items": {"type": "string"}},
                        "budget": {"type": "string", "enum": ["budget", "mid-range", "luxury"]},
                        "climate": {"type": "string"},
                        "count": {"type": "integer", "default": 5}
                    }
                }
            },
            {
                "name": "generateItinerary",
                "description": "Generate a detailed day-by-day itinerary",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "destination": {"type": "string"},
                        "days": {"type": "integer"},
                        "interests": {"type": "array", "items": {"type": "string"}},
                        "pace": {"type": "string", "enum": ["relaxed", "moderate", "packed"]}
                    },
                    "required": ["destination", "days"]
                }
            },
            {
                "name": "estimateBudget",
                "description": "Calculate budget estimate for the trip",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "destination": {"type": "string"},
                        "duration": {"type": "integer"},
                        "travelers": {"type": "integer"},
                        "style": {"type": "string", "enum": ["budget", "mid-range", "luxury"]}
                    },
                    "required": ["destination", "duration"]
                }
            }
        ]
    }
