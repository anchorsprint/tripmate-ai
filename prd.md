# Product Requirements Document: Travel AI Planner

## Document Metadata
- **Version**: 1.1
- **Status**: Draft
- **Target**: AI-assisted development
- **Tech Stack**: Python (FastAPI) backend, Next.js frontend, CopilotKit for agentic UI, AWS Strands Agents for AI orchestration

---

## 1. Executive Summary

### 1.1 Product Name
**TripMate AI** - Your Intelligent Travel Planning Assistant

### 1.2 Problem Statement
Travel planning is time-consuming and fragmented. Users spend an average of 4-6 hours researching destinations, comparing prices, coordinating dates, and building itineraries across multiple websites and apps. This leads to:
- Decision fatigue from too many options
- Missed opportunities for better deals or experiences
- Poorly optimized itineraries with wasted travel time
- Difficulty coordinating group trips
- Forgotten bookings and scheduling conflicts

### 1.3 Solution
An AI-powered travel assistant that consolidates the entire planning process into a single conversational interface. Users describe their trip preferences in natural language, and the AI generates personalized itineraries, budget estimates, and actionable booking recommendations.

### 1.4 Value Proposition
Reduce travel planning time from hours to minutes while discovering better-optimized trips tailored to individual preferences.

---

## 2. Target Users

### 2.1 Primary Personas

#### Persona 1: Busy Professional
- **Demographics**: 25-45, full-time employed, disposable income
- **Pain Points**: Limited time for research, wants efficient planning
- **Goals**: Quick weekend getaways, business trip optimization
- **Tech Comfort**: High

#### Persona 2: Budget Traveler
- **Demographics**: 18-35, students or early career
- **Pain Points**: Maximizing experiences within tight budget
- **Goals**: Find deals, affordable destinations, hostels/budget stays
- **Tech Comfort**: High

#### Persona 3: Family Vacation Planner
- **Demographics**: 30-50, parents with children
- **Pain Points**: Coordinating activities for different ages, safety concerns
- **Goals**: Family-friendly destinations, kid activities, convenient logistics
- **Tech Comfort**: Medium

---

## 3. Feature Specification

### 3.1 MVP Features (Phase 1)

#### F1: Conversational Trip Planning
**Priority**: P0 (Critical)
**Description**: Natural language interface for users to describe trip preferences

**Functional Requirements**:
- Accept free-form text input describing trip desires
- Parse and extract: destination preferences, dates, budget, travelers count, interests
- Handle follow-up questions and refinements
- Maintain conversation context across multiple messages
- Support clarifying questions when input is ambiguous

**Input Examples**:
```
"I want to go somewhere warm in March for about a week, budget around $2000"
"Planning a romantic anniversary trip to Europe, 10 days in September"
"Family vacation with 2 kids (ages 5 and 8), somewhere with beaches"
```

**Acceptance Criteria**:
- [ ] AI correctly extracts trip parameters from natural language
- [ ] AI asks clarifying questions for missing critical info
- [ ] Conversation history persists within a session
- [ ] Response time < 3 seconds for initial reply

---

#### F2: Destination Recommendations
**Priority**: P0 (Critical)
**Description**: AI-generated destination suggestions based on user preferences

**Functional Requirements**:
- Generate 3-5 destination recommendations per query
- Each recommendation includes:
  - Destination name and country
  - Why it matches user preferences (reasoning)
  - Best time to visit
  - Estimated daily budget range
  - Key attractions/highlights (3-5 items)
  - Pros and cons
- Filter by: budget, climate, travel style, accessibility
- Consider seasonal factors and travel advisories

**Data Structure**:
```typescript
interface DestinationRecommendation {
  id: string;
  name: string;
  country: string;
  matchScore: number; // 0-100
  matchReasons: string[];
  bestTimeToVisit: string;
  climate: {
    temperature: string;
    conditions: string;
  };
  dailyBudget: {
    budget: number;
    midRange: number;
    luxury: number;
    currency: string;
  };
  highlights: string[];
  pros: string[];
  cons: string[];
  imageUrl?: string;
}
```

**Acceptance Criteria**:
- [ ] Returns relevant destinations matching stated preferences
- [ ] Provides clear reasoning for each recommendation
- [ ] Budget estimates are within 20% of actual costs
- [ ] Handles edge cases (no matches, conflicting preferences)

---

#### F3: Itinerary Generation
**Priority**: P0 (Critical)
**Description**: Day-by-day trip itinerary with activities, timings, and logistics

**Functional Requirements**:
- Generate complete day-by-day itinerary
- Each day includes:
  - Morning, afternoon, evening activities
  - Estimated duration per activity
  - Travel time between locations
  - Meal suggestions (breakfast, lunch, dinner spots)
  - Estimated costs per activity
- Optimize for:
  - Geographic efficiency (minimize backtracking)
  - Opening hours and availability
  - Pace (not over-scheduled)
  - User-stated interests
- Allow regeneration with different preferences
- Support manual adjustments (add/remove/reorder)

**Data Structure**:
```typescript
interface Itinerary {
  id: string;
  tripId: string;
  destination: string;
  startDate: string;
  endDate: string;
  days: ItineraryDay[];
  totalEstimatedCost: number;
  notes: string[];
}

interface ItineraryDay {
  dayNumber: number;
  date: string;
  theme?: string; // e.g., "Beach Day", "Cultural Exploration"
  activities: Activity[];
  meals: Meal[];
  accommodation?: string;
  dailyCost: number;
}

interface Activity {
  id: string;
  name: string;
  type: 'attraction' | 'activity' | 'transport' | 'rest';
  timeSlot: 'morning' | 'afternoon' | 'evening';
  startTime?: string;
  duration: number; // minutes
  location: {
    name: string;
    address?: string;
    coordinates?: { lat: number; lng: number };
  };
  cost: number;
  currency: string;
  bookingRequired: boolean;
  bookingUrl?: string;
  notes?: string;
}

interface Meal {
  type: 'breakfast' | 'lunch' | 'dinner';
  suggestion: string;
  cuisine: string;
  priceRange: '$' | '$$' | '$$$';
  location?: string;
}
```

**Acceptance Criteria**:
- [ ] Generates logical day-by-day flow
- [ ] Activities are geographically grouped
- [ ] Includes realistic travel times
- [ ] Respects user's pace preference (relaxed/moderate/packed)
- [ ] Total costs sum correctly

---

#### F4: Budget Estimation & Tracking
**Priority**: P1 (High)
**Description**: Comprehensive trip cost breakdown and budget management

**Functional Requirements**:
- Generate cost estimates for:
  - Flights (estimated ranges)
  - Accommodation (per night)
  - Daily expenses (food, transport, activities)
  - Miscellaneous (tips, souvenirs, emergencies)
- Display breakdown by category
- Show total trip cost estimate
- Compare against user's stated budget
- Suggest cost-saving alternatives when over budget

**Data Structure**:
```typescript
interface BudgetEstimate {
  tripId: string;
  currency: string;
  breakdown: {
    flights: { min: number; max: number; estimated: number };
    accommodation: { perNight: number; total: number; nights: number };
    food: { perDay: number; total: number };
    activities: { total: number; items: { name: string; cost: number }[] };
    localTransport: { perDay: number; total: number };
    miscellaneous: number;
  };
  totalEstimate: { min: number; max: number; likely: number };
  userBudget?: number;
  budgetStatus: 'under' | 'on-target' | 'over';
  savingsSuggestions?: string[];
}
```

**Acceptance Criteria**:
- [ ] Provides itemized cost breakdown
- [ ] Estimates within reasonable accuracy (30% margin)
- [ ] Flags when over budget with suggestions
- [ ] Supports multiple currencies

---

#### F5: Trip Storage & Management
**Priority**: P1 (High)
**Description**: Save, organize, and manage multiple trip plans

**Functional Requirements**:
- Save trips to user account
- List all saved trips with summary view
- Edit existing trips
- Delete trips
- Duplicate trips as starting point
- Mark trips as: draft, planned, booked, completed
- Basic sharing via link (read-only)

**Data Structure**:
```typescript
interface Trip {
  id: string;
  userId: string;
  name: string;
  status: 'draft' | 'planned' | 'booked' | 'completed';
  destination: string;
  startDate: string;
  endDate: string;
  travelers: number;
  budget?: number;
  itinerary?: Itinerary;
  budgetEstimate?: BudgetEstimate;
  notes: string;
  createdAt: string;
  updatedAt: string;
  shareId?: string;
}
```

**Acceptance Criteria**:
- [ ] CRUD operations work correctly
- [ ] Trips persist across sessions
- [ ] Share links generate and work
- [ ] Status updates reflect in UI

---

#### F6: User Authentication
**Priority**: P1 (High)
**Description**: Account creation and authentication system

**Functional Requirements**:
- Email/password registration
- Email/password login
- OAuth support (Google, optionally Apple)
- Password reset via email
- Session management
- Guest mode with limited features (no saving)

**Acceptance Criteria**:
- [ ] Users can register and login
- [ ] OAuth flow works end-to-end
- [ ] Sessions persist appropriately
- [ ] Password reset emails send and work
- [ ] Guest users can plan but not save

---

### 3.2 Post-MVP Features (Phase 2)

#### F7: Flight Search Integration
- Connect to flight APIs (Skyscanner, Amadeus)
- Display real flight options with prices
- Deep links to booking sites

#### F8: Accommodation Search
- Connect to hotel APIs (Booking.com, Hotels.com)
- Filter by location, price, amenities
- Show availability for trip dates

#### F9: Collaborative Planning
- Invite others to trip
- Real-time collaboration on itinerary
- Voting on activities
- Comments and discussions

#### F10: Smart Packing Lists
- Generate packing lists based on destination, weather, activities
- Customizable templates
- Check-off functionality

#### F11: Travel Document Checklist
- Visa requirements by nationality
- Passport validity checks
- Required vaccinations
- Travel insurance reminders

#### F12: Offline Access
- Download itinerary for offline use
- Cached maps and directions
- Works without internet connection

---

## 4. Technical Architecture

### 4.1 System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Next.js / React Application                 │   │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────────┐   │   │
│  │  │  Chat   │ │Itinerary│ │  Trips  │ │    Auth     │   │   │
│  │  │   UI    │ │  View   │ │  List   │ │   Pages     │   │   │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────────┘   │   │
│  │  ┌─────────────────────────────────────────────────┐   │   │
│  │  │              CopilotKit Integration              │   │   │
│  │  │  (Agentic UI, Chat Components, Actions)         │   │   │
│  │  └─────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Python Backend API                           │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              FastAPI / Python Application                │   │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────────┐   │   │
│  │  │  Chat   │ │  Trip   │ │  User   │ │  Itinerary  │   │   │
│  │  │ Service │ │ Service │ │ Service │ │   Service   │   │   │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────────┘   │   │
│  │  ┌─────────────────────────────────────────────────┐   │   │
│  │  │           CopilotKit Backend Runtime             │   │   │
│  │  │        (Agent Execution, Action Handlers)        │   │   │
│  │  └─────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│   AI Service    │ │    Database     │ │  External APIs  │
│  ┌───────────┐  │ │  ┌───────────┐  │ │  ┌───────────┐  │
│  │   AWS     │  │ │  │PostgreSQL │  │ │  │  Google   │  │
│  │  Strands  │  │ │  │  /SQLite  │  │ │  │  Places   │  │
│  │  Agents   │  │ │  └───────────┘  │ │  └───────────┘  │
│  └───────────┘  │ │                 │ │  ┌───────────┐  │
│  ┌───────────┐  │ │                 │ │  │  Weather  │  │
│  │  Claude/  │  │ │                 │ │  │   API     │  │
│  │  Bedrock  │  │ │                 │ │  └───────────┘  │
│  └───────────┘  │ │                 │ │                 │
└─────────────────┘ └─────────────────┘ └─────────────────┘
```

### 4.2 Technology Stack

#### Frontend
| Component | Technology | Rationale |
|-----------|------------|-----------|
| Framework | Next.js 14+ | SSR, excellent DX, React ecosystem |
| Language | TypeScript | Type safety, better AI code generation |
| Styling | Tailwind CSS | Rapid UI development, consistent design |
| State | Zustand or React Context | Simple, lightweight state management |
| Forms | React Hook Form + Zod | Validation, good UX |
| HTTP Client | Fetch / TanStack Query | Caching, loading states |
| Agentic UI | CopilotKit | AI-native UI components, chat interface, frontend actions |

#### Backend
| Component | Technology | Rationale |
|-----------|------------|-----------|
| Runtime | Python 3.11+ | Rich AI/ML ecosystem, excellent async support |
| Framework | FastAPI | High performance, automatic OpenAPI docs, async native |
| Validation | Pydantic | Runtime validation, schema generation, type hints |
| Auth | FastAPI-Users or custom JWT | OAuth support, session management |
| Agentic Runtime | CopilotKit Python SDK | Backend agent execution, action handlers |

#### Database
| Component | Technology | Rationale |
|-----------|------------|-----------|
| Primary DB | PostgreSQL | Reliable, SQL support, production-ready |
| ORM | SQLAlchemy 2.0 + Alembic | Type-safe queries, migrations, async support |

#### AI & Agentic Services
| Component | Technology | Rationale |
|-----------|------------|-----------|
| Agent Framework | AWS Strands Agents | Production-ready agent orchestration, AWS ecosystem integration |
| LLM Provider | Amazon Bedrock (Claude) | Managed LLM access, enterprise security, scalability |
| Agent Tools | AWS Strands Tools | Pre-built tools for web search, code execution, file handling |
| Agent Memory | AWS Strands Memory | Conversation persistence, context management |

#### External Services
| Component | Technology | Rationale |
|-----------|------------|-----------|
| Places Data | Google Places API | Comprehensive location data |
| Weather | OpenWeatherMap | Free tier available |
| Images | Unsplash API | Free travel photos |

#### CopilotKit Integration
| Component | Description |
|-----------|-------------|
| `<CopilotKit>` | Root provider wrapping the application |
| `<CopilotChat>` | Pre-built chat UI component for travel planning conversations |
| `<CopilotTextarea>` | AI-enhanced text input for trip descriptions |
| `useCopilotAction` | Define frontend actions (save trip, modify itinerary) |
| `useCopilotReadable` | Share app state with AI (current trip, user preferences) |
| CopilotKit Remote Endpoint | Python backend endpoint for agent execution |

#### AWS Strands Integration
| Component | Description |
|-----------|-------------|
| Strands Agent | Core agent class for travel planning logic |
| Tool Definitions | Custom tools for destination search, itinerary generation, budget calculation |
| Model Configuration | Bedrock Claude configuration for reasoning |
| Memory Store | Conversation and trip context persistence |

### 4.3 Database Schema

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  name VARCHAR(255),
  avatar_url VARCHAR(500),
  oauth_provider VARCHAR(50),
  oauth_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trips table
CREATE TABLE trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'draft',
  destination VARCHAR(255),
  start_date DATE,
  end_date DATE,
  travelers INTEGER DEFAULT 1,
  budget DECIMAL(10,2),
  currency VARCHAR(3) DEFAULT 'USD',
  notes TEXT,
  share_id VARCHAR(50) UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Itineraries table
CREATE TABLE itineraries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
  data JSONB NOT NULL, -- Stores full itinerary structure
  version INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Chat sessions table
CREATE TABLE chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  trip_id UUID REFERENCES trips(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Chat messages table
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL, -- 'user' or 'assistant'
  content TEXT NOT NULL,
  metadata JSONB, -- Stores parsed data, recommendations, etc.
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Budget estimates table
CREATE TABLE budget_estimates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
  breakdown JSONB NOT NULL,
  total_min DECIMAL(10,2),
  total_max DECIMAL(10,2),
  total_likely DECIMAL(10,2),
  currency VARCHAR(3) DEFAULT 'USD',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 4.4 API Endpoints

> **Note**: All API endpoints are served from the Python/FastAPI backend at `http://localhost:8000`. The Next.js frontend communicates with these endpoints via HTTP client.

```yaml
# Authentication
POST   /api/auth/register        # Create new account
POST   /api/auth/login           # Login with credentials
POST   /api/auth/logout          # End session
POST   /api/auth/forgot-password # Request password reset
POST   /api/auth/reset-password  # Reset password with token
GET    /api/auth/me              # Get current user

# Chat
POST   /api/chat                 # Send message, get AI response
GET    /api/chat/sessions        # List chat sessions
GET    /api/chat/sessions/:id    # Get session with messages
DELETE /api/chat/sessions/:id    # Delete chat session

# Trips
GET    /api/trips                # List user's trips
POST   /api/trips                # Create new trip
GET    /api/trips/:id            # Get trip details
PUT    /api/trips/:id            # Update trip
DELETE /api/trips/:id            # Delete trip
POST   /api/trips/:id/duplicate  # Duplicate trip
POST   /api/trips/:id/share      # Generate share link
GET    /api/shared/:shareId      # Get shared trip (public)

# Itinerary
GET    /api/trips/:id/itinerary  # Get trip itinerary
POST   /api/trips/:id/itinerary  # Generate new itinerary
PUT    /api/trips/:id/itinerary  # Update itinerary
POST   /api/trips/:id/itinerary/regenerate # Regenerate with new params

# Budget
GET    /api/trips/:id/budget     # Get budget estimate
POST   /api/trips/:id/budget     # Generate budget estimate
PUT    /api/trips/:id/budget     # Update budget estimate

# Destinations (AI-powered)
POST   /api/destinations/recommend # Get destination recommendations
GET    /api/destinations/:name   # Get destination details
```

---

## 5. AI Prompt Engineering

### 5.1 System Prompts

#### Trip Planning Assistant
```
You are TripMate AI, an expert travel planning assistant. Your role is to help users plan their perfect trip by understanding their preferences and providing personalized recommendations.

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

When generating itineraries, output valid JSON matching the specified schema.
```

### 5.2 AWS Strands Agent Tools (Python)

```python
# backend/app/tools/destination_search.py
from strands import tool
from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum

class BudgetLevel(str, Enum):
    BUDGET = "budget"
    MID_RANGE = "mid-range"
    LUXURY = "luxury"

class Climate(str, Enum):
    WARM = "warm"
    COLD = "cold"
    MODERATE = "moderate"
    ANY = "any"

class TravelStyle(str, Enum):
    RELAXED = "relaxed"
    ACTIVE = "active"
    CULTURAL = "cultural"
    ADVENTURE = "adventure"

class TravelPreferences(BaseModel):
    budget: BudgetLevel
    climate: Climate
    interests: List[str]
    travel_style: TravelStyle
    duration: int = Field(description="Trip length in days")
    month: str = Field(description="Travel month")

@tool
def recommend_destinations(
    preferences: TravelPreferences,
    count: int = 5
) -> List[dict]:
    """Generate destination recommendations based on user preferences.

    Args:
        preferences: User's travel preferences including budget, climate, interests
        count: Number of recommendations to return (default: 5)

    Returns:
        List of destination recommendations with match scores and details
    """
    # Implementation using Google Places API and AI reasoning
    pass


@tool
def generate_itinerary(
    destination: str,
    start_date: str,
    end_date: str,
    travelers: int = 1,
    budget: BudgetLevel = BudgetLevel.MID_RANGE,
    interests: Optional[List[str]] = None,
    pace: str = "moderate"
) -> dict:
    """Create a day-by-day itinerary for a destination.

    Args:
        destination: Target destination city/country
        start_date: Trip start date (YYYY-MM-DD)
        end_date: Trip end date (YYYY-MM-DD)
        travelers: Number of travelers
        budget: Budget level for the trip
        interests: List of user interests
        pace: Trip pace - relaxed, moderate, or packed

    Returns:
        Complete itinerary with daily activities, meals, and logistics
    """
    pass


@tool
def estimate_budget(
    destination: str,
    duration: int,
    travelers: int,
    style: BudgetLevel = BudgetLevel.MID_RANGE,
    include_flights: bool = True
) -> dict:
    """Generate a cost estimate for a trip.

    Args:
        destination: Target destination
        duration: Trip length in days
        travelers: Number of travelers
        style: Budget style level
        include_flights: Whether to include flight estimates

    Returns:
        Detailed budget breakdown with min/max/likely costs
    """
    pass
```

### 5.3 AWS Strands Agent Definition

```python
# backend/app/agents/travel_agent.py
from strands import Agent
from strands.models import BedrockModel
from app.tools.destination_search import recommend_destinations
from app.tools.itinerary_generator import generate_itinerary
from app.tools.budget_calculator import estimate_budget
from app.tools.places_lookup import lookup_place_details
from app.tools.weather_check import get_weather_forecast

# Configure the Bedrock model
model = BedrockModel(
    model_id="anthropic.claude-3-sonnet-20240229-v1:0",
    max_tokens=4096,
    temperature=0.7
)

# Create the travel planning agent
travel_agent = Agent(
    model=model,
    tools=[
        recommend_destinations,
        generate_itinerary,
        estimate_budget,
        lookup_place_details,
        get_weather_forecast
    ],
    system_prompt="""You are TripMate AI, an expert travel planning assistant.
Your role is to help users plan their perfect trip by understanding their
preferences and providing personalized recommendations.

CAPABILITIES:
- Recommend destinations based on user preferences
- Create detailed day-by-day itineraries
- Estimate trip costs and budgets
- Suggest activities, restaurants, and accommodations
- Provide practical travel tips and advice

GUIDELINES:
1. Ask clarifying questions when information is missing
2. Always consider: budget, dates, group composition, accessibility
3. Provide specific, actionable recommendations
4. Include practical details: costs, hours, booking requirements
5. Be honest about limitations and uncertainties
6. Consider seasonality and local events
"""
)
```

### 5.4 CopilotKit Integration

```python
# backend/app/api/routes/copilotkit.py
from fastapi import APIRouter
from copilotkit.integrations.fastapi import add_fastapi_endpoint
from copilotkit import CopilotKitSDK, Action
from app.agents.travel_agent import travel_agent

router = APIRouter()

# Define CopilotKit actions that trigger AWS Strands agents
sdk = CopilotKitSDK(
    actions=[
        Action(
            name="planTrip",
            description="Plan a complete trip based on user preferences",
            handler=lambda args: travel_agent.run(args["message"])
        ),
        Action(
            name="generateItinerary",
            description="Generate a detailed day-by-day itinerary",
            handler=lambda args: generate_itinerary_handler(args)
        ),
        Action(
            name="estimateBudget",
            description="Calculate budget estimate for the trip",
            handler=lambda args: estimate_budget_handler(args)
        )
    ]
)

# Add CopilotKit endpoint
add_fastapi_endpoint(router, sdk, "/copilotkit")
```

```typescript
// frontend/src/app/api/copilotkit/route.ts
import { CopilotRuntime, copilotRuntimeNextJSAppRouterEndpoint } from "@copilotkit/runtime";

export const POST = async (req: Request) => {
  const runtime = new CopilotRuntime({
    remoteEndpoints: [
      {
        url: process.env.NEXT_PUBLIC_API_URL + "/api/copilotkit",
      },
    ],
  });

  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    endpoint: "/api/copilotkit",
  });

  return handleRequest(req);
};
```

---

## 6. User Interface Specifications

### 6.1 Page Structure

```
/                     # Landing page (marketing)
/login               # Login page
/register            # Registration page
/app                 # Main app dashboard
/app/chat            # Chat interface (primary planning)
/app/trips           # List of saved trips
/app/trips/:id       # Trip detail view
/app/trips/:id/edit  # Edit trip/itinerary
/app/settings        # User settings
/shared/:shareId     # Public shared trip view
```

### 6.2 Key UI Components

#### Chat Interface
```
┌────────────────────────────────────────────────────────────┐
│  TripMate AI                                    [New Chat] │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ AI: Hi! I'm TripMate AI. Tell me about the trip     │ │
│  │     you're dreaming of, and I'll help you plan it.  │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ You: I want to go somewhere warm in March for       │ │
│  │      about a week. Budget around $2000.             │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ AI: Great! Here are my top recommendations:         │ │
│  │                                                      │ │
│  │ ┌────────────┐ ┌────────────┐ ┌────────────┐       │ │
│  │ │  Cancun    │ │  Lisbon    │ │  Thailand  │       │ │
│  │ │  Mexico    │ │  Portugal  │ │  Bangkok   │       │ │
│  │ │  $1,800    │ │  $1,950    │ │  $1,700    │       │ │
│  │ │ [Details]  │ │ [Details]  │ │ [Details]  │       │ │
│  │ └────────────┘ └────────────┘ └────────────┘       │ │
│  │                                                      │ │
│  │ Would you like me to create an itinerary for any   │ │
│  │ of these destinations?                              │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
├────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────┐ [Send]   │
│  │ Type your message...                        │          │
│  └────────────────────────────────────────────┘          │
└────────────────────────────────────────────────────────────┘
```

#### Itinerary View
```
┌────────────────────────────────────────────────────────────┐
│  Cancun, Mexico                           [Edit] [Share]   │
│  March 15-22, 2024 • 2 travelers                          │
├────────────────────────────────────────────────────────────┤
│  Budget: $1,800 estimated                                  │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ ████████████████████░░░░░ 75% of $2,000 budget     │  │
│  └─────────────────────────────────────────────────────┘  │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  [Day 1] [Day 2] [Day 3] [Day 4] [Day 5] [Day 6] [Day 7]  │
│                                                            │
│  ═══════════════════════════════════════════════════════  │
│  DAY 1 - Saturday, March 15                               │
│  Theme: Arrival & Beach Day                               │
│  ═══════════════════════════════════════════════════════  │
│                                                            │
│  MORNING                                                   │
│  ┌────────────────────────────────────────────────────┐   │
│  │ ✈️  Arrive at Cancun Airport                       │   │
│  │    10:00 AM • Transfer to hotel (45 min)          │   │
│  │    Cost: $35 (shuttle)                            │   │
│  └────────────────────────────────────────────────────┘   │
│                                                            │
│  ┌────────────────────────────────────────────────────┐   │
│  │ 🏨 Check in: Hotel Zona                            │   │
│  │    12:00 PM • Hotel Zone                          │   │
│  │    $120/night                                     │   │
│  └────────────────────────────────────────────────────┘   │
│                                                            │
│  AFTERNOON                                                 │
│  ┌────────────────────────────────────────────────────┐   │
│  │ 🏖️  Beach time at Playa Delfines                  │   │
│  │    2:00 PM - 5:00 PM (3 hours)                    │   │
│  │    Free public beach                              │   │
│  └────────────────────────────────────────────────────┘   │
│                                                            │
│  EVENING                                                   │
│  ┌────────────────────────────────────────────────────┐   │
│  │ 🍽️  Dinner: La Habichuela Sunset                  │   │
│  │    7:00 PM • Mayan-inspired cuisine               │   │
│  │    $$ • Reservation recommended                   │   │
│  └────────────────────────────────────────────────────┘   │
│                                                            │
│  Daily Total: $155                                        │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### 6.3 Design System

#### Colors
```css
/* Primary */
--primary-500: #2563eb;     /* Blue - main actions */
--primary-600: #1d4ed8;     /* Blue - hover states */

/* Secondary */
--secondary-500: #10b981;   /* Green - success, savings */
--secondary-600: #059669;

/* Accent */
--accent-500: #f59e0b;      /* Amber - highlights, warnings */

/* Neutrals */
--gray-50: #f9fafb;
--gray-100: #f3f4f6;
--gray-200: #e5e7eb;
--gray-500: #6b7280;
--gray-700: #374151;
--gray-900: #111827;

/* Semantic */
--error: #ef4444;
--success: #22c55e;
--warning: #f59e0b;
--info: #3b82f6;
```

#### Typography
```css
/* Font Family */
--font-sans: 'Inter', system-ui, sans-serif;
--font-mono: 'JetBrains Mono', monospace;

/* Font Sizes */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
```

---

## 7. Non-Functional Requirements

### 7.1 Performance
| Metric | Target |
|--------|--------|
| Initial page load | < 2 seconds |
| AI response (first token) | < 2 seconds |
| AI response (complete) | < 10 seconds |
| API response (non-AI) | < 500ms |
| Time to Interactive | < 3 seconds |

### 7.2 Scalability
- Support 1,000 concurrent users (MVP)
- Handle 10,000 trips in database
- Message queue for AI requests to handle bursts

### 7.3 Security
- HTTPS everywhere
- Password hashing (bcrypt)
- JWT tokens with expiration
- Rate limiting on API endpoints
- Input sanitization
- CORS configuration
- SQL injection prevention (ORM)
- XSS prevention

### 7.4 Accessibility
- WCAG 2.1 Level AA compliance
- Keyboard navigation support
- Screen reader compatibility
- Color contrast ratios
- Focus indicators

---

## 8. Success Metrics

### 8.1 Key Performance Indicators (KPIs)

| Metric | Target (MVP) | Measurement |
|--------|--------------|-------------|
| User Registration | 500 users | First 3 months |
| Trip Plans Created | 1,000 trips | First 3 months |
| User Retention (7-day) | 30% | Return within 7 days |
| Itinerary Completion | 60% | Full itinerary generated |
| User Satisfaction | 4.0/5.0 | Post-planning survey |
| Average Planning Time | < 15 min | Session analytics |

### 8.2 Analytics Events to Track
```typescript
// User events
'user.registered'
'user.logged_in'
'user.logged_out'

// Chat events
'chat.session_started'
'chat.message_sent'
'chat.response_received'

// Trip events
'trip.created'
'trip.itinerary_generated'
'trip.itinerary_edited'
'trip.saved'
'trip.shared'
'trip.deleted'

// Destination events
'destination.recommended'
'destination.selected'
'destination.rejected'

// Budget events
'budget.estimated'
'budget.over_limit'
'budget.adjusted'
```

---

## 9. Development Phases

### Phase 1: MVP (Core Features)
**Scope**: F1-F6 (Conversational planning, recommendations, itinerary, budget, storage, auth)

**Deliverables**:
1. Working chat interface with AI
2. Destination recommendations
3. Basic itinerary generation
4. Budget estimation
5. User accounts and trip storage
6. Basic responsive design

---

### Phase 2: Enhanced Experience
**Scope**: F7-F9 (Flight search, accommodation, collaboration)

**Deliverables**:
1. Flight search integration
2. Hotel search integration
3. Multi-user trip collaboration
4. Enhanced itinerary editing

---

### Phase 3: Full Feature Set
**Scope**: F10-F12 (Packing lists, documents, offline)

**Deliverables**:
1. Smart packing lists
2. Travel document checklist
3. PWA with offline support
4. Mobile app (React Native)

---

## 10. File Structure (Recommended)

```
travel-app/
├── frontend/                   # Next.js Frontend
│   ├── src/
│   │   ├── app/                # Next.js App Router
│   │   │   ├── (auth)/
│   │   │   │   ├── login/
│   │   │   │   └── register/
│   │   │   ├── (app)/
│   │   │   │   ├── chat/
│   │   │   │   ├── trips/
│   │   │   │   └── settings/
│   │   │   ├── api/
│   │   │   │   └── copilotkit/  # CopilotKit proxy endpoint
│   │   │   │       └── route.ts
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── components/
│   │   │   ├── ui/             # Reusable UI components
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   ├── Card.tsx
│   │   │   │   └── ...
│   │   │   ├── chat/           # Chat-specific components
│   │   │   │   ├── TravelChat.tsx      # CopilotChat wrapper
│   │   │   │   ├── Message.tsx
│   │   │   │   └── DestinationCard.tsx
│   │   │   ├── trips/          # Trip-specific components
│   │   │   │   ├── TripCard.tsx
│   │   │   │   ├── ItineraryView.tsx
│   │   │   │   └── BudgetBreakdown.tsx
│   │   │   └── layout/         # Layout components
│   │   │       ├── Header.tsx
│   │   │       ├── Sidebar.tsx
│   │   │       └── Footer.tsx
│   │   ├── lib/
│   │   │   ├── copilotkit/     # CopilotKit configuration
│   │   │   │   ├── actions.ts  # Frontend actions
│   │   │   │   └── config.ts
│   │   │   ├── api/            # API client
│   │   │   │   └── client.ts
│   │   │   └── utils/          # General utilities
│   │   │       ├── format.ts
│   │   │       └── validation.ts
│   │   ├── hooks/              # Custom React hooks
│   │   │   ├── useTrips.ts
│   │   │   └── useAuth.ts
│   │   ├── stores/             # State management
│   │   │   ├── chatStore.ts
│   │   │   └── tripStore.ts
│   │   ├── types/              # TypeScript types
│   │   │   ├── trip.ts
│   │   │   ├── itinerary.ts
│   │   │   ├── chat.ts
│   │   │   └── user.ts
│   │   └── styles/
│   │       └── globals.css
│   ├── public/
│   │   └── images/
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   └── next.config.js
│
├── backend/                    # Python Backend
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py             # FastAPI application entry
│   │   ├── config.py           # Configuration settings
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   ├── routes/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── auth.py     # Authentication endpoints
│   │   │   │   ├── trips.py    # Trip CRUD endpoints
│   │   │   │   ├── itinerary.py
│   │   │   │   └── copilotkit.py  # CopilotKit remote endpoint
│   │   │   └── deps.py         # Dependency injection
│   │   ├── agents/             # AWS Strands Agents
│   │   │   ├── __init__.py
│   │   │   ├── travel_agent.py     # Main travel planning agent
│   │   │   ├── destination_agent.py # Destination recommendation agent
│   │   │   ├── itinerary_agent.py  # Itinerary generation agent
│   │   │   └── budget_agent.py     # Budget estimation agent
│   │   ├── tools/              # AWS Strands Tools
│   │   │   ├── __init__.py
│   │   │   ├── destination_search.py
│   │   │   ├── places_lookup.py
│   │   │   ├── weather_check.py
│   │   │   └── budget_calculator.py
│   │   ├── models/             # Pydantic models
│   │   │   ├── __init__.py
│   │   │   ├── trip.py
│   │   │   ├── itinerary.py
│   │   │   ├── user.py
│   │   │   └── chat.py
│   │   ├── db/                 # Database
│   │   │   ├── __init__.py
│   │   │   ├── database.py     # SQLAlchemy setup
│   │   │   ├── models.py       # ORM models
│   │   │   └── repositories/   # Data access layer
│   │   │       ├── __init__.py
│   │   │       ├── trip_repo.py
│   │   │       └── user_repo.py
│   │   ├── services/           # Business logic
│   │   │   ├── __init__.py
│   │   │   ├── trip_service.py
│   │   │   ├── auth_service.py
│   │   │   └── agent_service.py  # AWS Strands agent orchestration
│   │   └── utils/
│   │       ├── __init__.py
│   │       └── helpers.py
│   ├── alembic/                # Database migrations
│   │   ├── versions/
│   │   └── alembic.ini
│   ├── tests/
│   │   ├── __init__.py
│   │   ├── test_api/
│   │   ├── test_agents/
│   │   └── test_services/
│   ├── requirements.txt
│   ├── pyproject.toml
│   └── Dockerfile
│
├── docker-compose.yml          # Local development setup
├── .env.example
├── .gitignore
└── README.md
```

---

## 11. Environment Variables

```bash
# .env.example

# ============================================
# FRONTEND (Next.js)
# ============================================

# App URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:8000
NODE_ENV=development

# CopilotKit
NEXT_PUBLIC_COPILOTKIT_RUNTIME_URL=http://localhost:8000/api/copilotkit

# Auth (if using NextAuth for frontend session)
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# ============================================
# BACKEND (Python/FastAPI)
# ============================================

# Server
BACKEND_HOST=0.0.0.0
BACKEND_PORT=8000
ENVIRONMENT=development
DEBUG=true

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/tripmate

# JWT Auth
JWT_SECRET_KEY=your-jwt-secret-key
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key

# AWS Strands Agents
STRANDS_MODEL_ID=anthropic.claude-3-sonnet-20240229-v1:0
STRANDS_MAX_TOKENS=4096
STRANDS_TEMPERATURE=0.7

# Amazon Bedrock
BEDROCK_MODEL_ID=anthropic.claude-3-sonnet-20240229-v1:0

# CopilotKit Backend
COPILOTKIT_PUBLIC_API_KEY=your-copilotkit-api-key

# External APIs
GOOGLE_PLACES_API_KEY=your-google-places-key
OPENWEATHERMAP_API_KEY=your-weather-key
UNSPLASH_ACCESS_KEY=your-unsplash-key

# CORS
CORS_ORIGINS=http://localhost:3000
```

---

## 12. Glossary

| Term | Definition |
|------|------------|
| Itinerary | Day-by-day plan of activities, meals, and logistics |
| Trip | A saved travel plan including destination, dates, itinerary, and budget |
| Destination | A travel location (city, region, or country) |
| Activity | A specific thing to do (attraction, tour, experience) |
| Session | A conversation thread with the AI assistant |

---

## 13. Open Questions

1. **Booking Integration**: Should MVP include actual booking or just recommendations with links?
   - *Current decision*: Links only for MVP to reduce complexity and liability

2. **Multi-destination Trips**: Support trips with multiple cities?
   - *Current decision*: Defer to Phase 2

3. **Currency Handling**: How to handle multi-currency budgets?
   - *Current decision*: Store in USD, convert for display

4. **Data Sources**: Primary source for destination/activity data?
   - *Current decision*: AI knowledge + Google Places API for verification

---

## Appendix A: Sample API Responses

### Chat Response with Recommendations
```json
{
  "id": "msg_abc123",
  "role": "assistant",
  "content": "Based on your preferences for a warm destination in March with a $2000 budget, here are my top recommendations:",
  "metadata": {
    "type": "recommendations",
    "data": {
      "recommendations": [
        {
          "id": "dest_1",
          "name": "Cancun",
          "country": "Mexico",
          "matchScore": 92,
          "matchReasons": ["Warm weather in March", "Within budget", "Beach destination"],
          "dailyBudget": { "budget": 80, "midRange": 150, "luxury": 300 },
          "highlights": ["Beaches", "Mayan ruins", "Cenotes", "Nightlife"]
        }
      ]
    }
  },
  "createdAt": "2024-01-15T10:30:00Z"
}
```

### Itinerary Response
```json
{
  "id": "itin_xyz789",
  "tripId": "trip_abc123",
  "destination": "Cancun, Mexico",
  "startDate": "2024-03-15",
  "endDate": "2024-03-22",
  "days": [
    {
      "dayNumber": 1,
      "date": "2024-03-15",
      "theme": "Arrival & Beach Day",
      "activities": [
        {
          "id": "act_1",
          "name": "Airport Transfer",
          "type": "transport",
          "timeSlot": "morning",
          "startTime": "10:00",
          "duration": 45,
          "cost": 35
        },
        {
          "id": "act_2",
          "name": "Playa Delfines Beach",
          "type": "activity",
          "timeSlot": "afternoon",
          "startTime": "14:00",
          "duration": 180,
          "cost": 0
        }
      ],
      "meals": [
        {
          "type": "dinner",
          "suggestion": "La Habichuela Sunset",
          "cuisine": "Mayan-Mexican",
          "priceRange": "$$"
        }
      ],
      "dailyCost": 155
    }
  ],
  "totalEstimatedCost": 1750
}
```

---

*End of PRD*
