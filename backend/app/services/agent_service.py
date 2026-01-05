from openai import AsyncOpenAI
from app.config import get_settings
from typing import List, Dict, Any, Optional
import json

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
- Offer alternatives when appropriate

When generating destination recommendations, format them as JSON with this structure:
{
  "recommendations": [
    {
      "name": "City Name",
      "country": "Country",
      "match_score": 85,
      "match_reasons": ["reason1", "reason2"],
      "best_time_to_visit": "March-May",
      "daily_budget": {"budget": 50, "mid_range": 100, "luxury": 250},
      "highlights": ["highlight1", "highlight2"],
      "pros": ["pro1", "pro2"],
      "cons": ["con1", "con2"]
    }
  ]
}

When generating itineraries, format them as JSON with day-by-day activities."""


class TravelAgent:
    def __init__(self):
        self.client = client
        self.system_prompt = SYSTEM_PROMPT

    async def process(self, message: str, history: List[Dict] = None) -> Dict[str, Any]:
        """Process a message and return AI response"""
        messages = [{"role": "system", "content": self.system_prompt}]

        if history:
            for msg in history[-10:]:  # Keep last 10 messages for context
                messages.append({
                    "role": msg.get("role", "user"),
                    "content": msg.get("content", "")
                })

        messages.append({"role": "user", "content": message})

        try:
            response = await self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=messages,
                temperature=0.7,
                max_tokens=2000
            )

            content = response.choices[0].message.content

            # Try to extract structured data if present
            metadata = None
            if "```json" in content:
                try:
                    json_start = content.index("```json") + 7
                    json_end = content.index("```", json_start)
                    json_str = content[json_start:json_end].strip()
                    metadata = json.loads(json_str)
                except (ValueError, json.JSONDecodeError):
                    pass

            return {
                "message": content,
                "metadata": metadata
            }

        except Exception as e:
            return {
                "message": f"I apologize, but I encountered an error processing your request. Please try again. Error: {str(e)}",
                "metadata": None
            }


async def process_chat_message(
    message: str,
    history: List[Dict] = None,
    trip_context: Optional[Dict] = None
) -> Dict[str, Any]:
    """Process a chat message with the travel agent"""
    agent = TravelAgent()

    # Add trip context to message if provided
    if trip_context:
        context_str = f"\n\nCurrent trip context: {json.dumps(trip_context)}"
        message = message + context_str

    return await agent.process(message, history)


async def generate_itinerary_for_trip(trip, preferences: Optional[Dict] = None) -> Dict:
    """Generate an itinerary for a trip using AI"""
    agent = TravelAgent()

    prompt = f"""Generate a detailed day-by-day itinerary for the following trip:

Destination: {trip.destination}
Start Date: {trip.start_date}
End Date: {trip.end_date}
Number of Travelers: {trip.travelers}
Budget: {trip.budget} {trip.currency}
Notes: {trip.notes or 'None'}

{"Additional preferences: " + json.dumps(preferences) if preferences else ""}

Please provide a complete itinerary in JSON format with the following structure:
{{
  "destination": "destination name",
  "start_date": "YYYY-MM-DD",
  "end_date": "YYYY-MM-DD",
  "days": [
    {{
      "day_number": 1,
      "date": "YYYY-MM-DD",
      "theme": "Day theme",
      "activities": [
        {{
          "id": "act_1",
          "name": "Activity name",
          "type": "attraction|activity|transport|rest",
          "time_slot": "morning|afternoon|evening",
          "start_time": "HH:MM",
          "duration": 120,
          "location": {{"name": "Location", "address": "Address"}},
          "cost": 0,
          "currency": "USD",
          "booking_required": false,
          "notes": "Optional notes"
        }}
      ],
      "meals": [
        {{
          "type": "breakfast|lunch|dinner",
          "suggestion": "Restaurant name",
          "cuisine": "Cuisine type",
          "price_range": "$|$$|$$$",
          "location": "Area/Address"
        }}
      ],
      "daily_cost": 150
    }}
  ],
  "total_estimated_cost": 1500,
  "notes": ["Tip 1", "Tip 2"]
}}"""

    response = await agent.process(prompt)

    # Parse the JSON from response
    if response.get("metadata"):
        return response["metadata"]

    # Try to parse from message content
    content = response["message"]
    try:
        if "```json" in content:
            json_start = content.index("```json") + 7
            json_end = content.index("```", json_start)
            return json.loads(content[json_start:json_end].strip())
        elif "{" in content:
            start = content.index("{")
            end = content.rindex("}") + 1
            return json.loads(content[start:end])
    except (ValueError, json.JSONDecodeError):
        pass

    # Return a default structure if parsing fails
    return {
        "destination": trip.destination,
        "start_date": trip.start_date,
        "end_date": trip.end_date,
        "days": [],
        "total_estimated_cost": 0,
        "notes": ["Unable to generate itinerary automatically. Please try again."]
    }
