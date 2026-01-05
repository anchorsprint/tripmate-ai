from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse
import json
from app.services.agent_service import TravelAgent

router = APIRouter()
travel_agent = TravelAgent()


@router.post("/copilotkit")
async def copilotkit_endpoint(request: Request):
    """CopilotKit remote endpoint for agent execution"""
    body = await request.json()

    # Handle CopilotKit protocol
    messages = body.get("messages", [])
    actions = body.get("actions", [])

    async def generate():
        try:
            # Process the last user message
            user_message = None
            for msg in reversed(messages):
                if msg.get("role") == "user":
                    user_message = msg.get("content", "")
                    break

            if user_message:
                response = await travel_agent.process(user_message, messages)

                # Stream response in CopilotKit format
                yield f"data: {json.dumps({'type': 'textMessageStart', 'id': 'msg-1'})}\n\n"
                yield f"data: {json.dumps({'type': 'textMessageContent', 'id': 'msg-1', 'content': response['message']})}\n\n"
                yield f"data: {json.dumps({'type': 'textMessageEnd', 'id': 'msg-1'})}\n\n"

                # If there are action results, include them
                if response.get("metadata"):
                    yield f"data: {json.dumps({'type': 'actionResult', 'data': response['metadata']})}\n\n"

            yield "data: [DONE]\n\n"

        except Exception as e:
            yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"
            yield "data: [DONE]\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        }
    )


@router.get("/copilotkit/info")
async def copilotkit_info():
    """Return information about available actions"""
    return {
        "actions": [
            {
                "name": "planTrip",
                "description": "Plan a complete trip based on user preferences",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "destination": {"type": "string"},
                        "dates": {"type": "string"},
                        "budget": {"type": "number"},
                        "travelers": {"type": "integer"}
                    }
                }
            },
            {
                "name": "recommendDestinations",
                "description": "Get destination recommendations based on preferences",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "preferences": {"type": "object"},
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
                        "start_date": {"type": "string"},
                        "end_date": {"type": "string"},
                        "interests": {"type": "array", "items": {"type": "string"}}
                    }
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
                        "style": {"type": "string"}
                    }
                }
            }
        ]
    }
