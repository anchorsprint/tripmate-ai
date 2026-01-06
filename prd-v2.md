# TripMate AI - Product Requirements Document v2.0

## Document Info
- **Version**: 2.0
- **Status**: Draft
- **Last Updated**: January 2026
- **Previous Version**: [prd.md](./prd.md)

---

## Executive Summary

This PRD outlines the feature updates for TripMate AI v2.0, focusing on improving user acquisition through a freemium presales journey, enhancing the AI chat experience with dynamic visual components, better trip management integration, and strengthening security with OAuth authentication.

---

## Feature 1: Presales Journey (Try Before You Sign Up)

### Problem Statement
Currently, users must register before experiencing the AI trip planning capabilities. This creates friction and reduces conversion rates.

### Solution
Allow anonymous users to experience the trip planning AI with limited usage, requiring sign-up only when they want to save their work.

### Requirements

#### 1.1 Anonymous Chat Experience
- [ ] Allow users to access `/app/chat` without authentication
- [ ] Implement session-based tracking for anonymous users (using browser localStorage/sessionStorage)
- [ ] Limit anonymous users to **5 AI queries per session**
- [ ] Display remaining query count in the chat interface
- [ ] Show friendly prompt after 3 queries: "Sign up to save your trip and get unlimited planning!"

#### 1.2 Soft Gate Triggers
Require login when user attempts to:
- [ ] Save a trip or itinerary
- [ ] Access trip management (`/app/trips`)
- [ ] Export itinerary (PDF/share link)
- [ ] Continue after query limit reached
- [ ] Access settings or profile

#### 1.3 Session Preservation
- [ ] Store anonymous chat history in localStorage
- [ ] Transfer anonymous session data to user account upon registration
- [ ] Preserve itinerary context so user doesn't lose their planning work

#### 1.4 UI/UX Requirements
```
┌─────────────────────────────────────────────────────┐
│  🎯 Try TripMate AI Free!                           │
│  ────────────────────────────────────────────────── │
│  ○○○○● (2 of 5 free queries remaining)              │
│                                                     │
│  [Sign up to save & get unlimited access]           │
└─────────────────────────────────────────────────────┘
```

---

## Feature 2: Enhanced Chat Experience with Dynamic UI

### Problem Statement
Current chat outputs raw text and JSON, which is not user-friendly for non-technical users.

### Solution
Leverage CopilotKit's dynamic UI components to render rich, interactive content within the chat.

### Requirements

#### 2.1 Rich Content Cards
Replace text/JSON output with visual cards:

**Destination Card**
```
┌─────────────────────────────────────────┐
│ 🗼 Tokyo, Japan                         │
│ ┌─────────────────────────────────────┐ │
│ │ [Attraction Photo from Unsplash]    │ │
│ └─────────────────────────────────────┘ │
│ Best time: Mar-May, Sep-Nov             │
│ Avg. daily cost: $150-200               │
│ ⭐ 4.8 (12,543 reviews)                 │
│                                         │
│ [Learn More]  [Add to Trip]             │
└─────────────────────────────────────────┘
```

**Itinerary Day Card**
```
┌─────────────────────────────────────────┐
│ 📅 Day 1 - April 1, 2024                │
│ ─────────────────────────────────────── │
│ 🌅 Morning                              │
│    ✈️ Arrive at Narita Airport          │
│    🚃 Train to Shinjuku (90 min)        │
│    🏨 Check into Hotel Gracery          │
│                                         │
│ 🌞 Afternoon                            │
│    🏛️ Senso-ji Temple                   │
│    📍 Asakusa District                  │
│    ⏱️ 2-3 hours                         │
│                                         │
│ 🌙 Evening                              │
│    🍜 Dinner at Ichiran Ramen           │
│    💰 ~$15 per person                   │
│                                         │
│ [View on Map]  [Edit Day]               │
└─────────────────────────────────────────┘
```

**Budget Breakdown Card**
```
┌─────────────────────────────────────────┐
│ 💰 Budget Estimate - Tokyo 5 Days       │
│ ─────────────────────────────────────── │
│                                         │
│ 🏨 Accommodation    ████████░░  $750    │
│ 🍽️ Food & Dining    █████░░░░░  $500    │
│ 🎫 Activities       █████░░░░░  $500    │
│ 🚃 Transportation   ██░░░░░░░░  $200    │
│ 🛍️ Miscellaneous    █░░░░░░░░░  $50     │
│ ─────────────────────────────────────── │
│ 📊 Total Estimate:           $2,000     │
│                                         │
│ [Adjust Budget]  [Save to Trip]         │
└─────────────────────────────────────────┘
```

#### 2.2 Interactive Elements in Chat
- [ ] Inline action buttons: "Save to Trip", "View on Map", "Share"
- [ ] Expandable/collapsible sections for detailed information
- [ ] Image carousels for attractions and hotels
- [ ] Quick reply suggestions (chips): "Tell me more", "Show cheaper options", "Add to my trip"

#### 2.3 CopilotKit Integration
- [ ] Implement `useCopilotAction` for trip-related actions
- [ ] Use `CopilotTextarea` for enhanced input with suggestions
- [ ] Render custom React components via `useCopilotChatSuggestions`
- [ ] Implement streaming responses with typing indicators

#### 2.4 Anti-Patterns to Avoid
- ❌ Raw JSON output in chat
- ❌ Technical error messages
- ❌ Unformatted lists
- ❌ URLs without preview cards
- ❌ Large blocks of unstructured text

---

## Feature 3: Chat-to-Trip Integration

### Problem Statement
Users plan trips in chat but must manually recreate them in trip management.

### Solution
Enable seamless saving of trip plans directly from chat conversations.

### Requirements

#### 3.1 Save Trip from Chat
- [ ] "Save as Trip" button appears when itinerary is generated
- [ ] Auto-extract trip metadata: destination, dates, travelers, budget
- [ ] Option to name the trip before saving
- [ ] Success toast with link to view saved trip

#### 3.2 Continue Planning Saved Trip
- [ ] "Continue in Chat" button on trip detail page
- [ ] Load trip context into new chat session
- [ ] AI remembers previous planning decisions

#### 3.3 Sync Updates
- [ ] Changes in chat can update existing trip
- [ ] Prompt: "Update existing trip or save as new?"
- [ ] Version history for trip changes

---

## Feature 4: Enhanced Trip Planning Details

### Problem Statement
Current trip records lack actionable details like packing lists and preparation tasks.

### Solution
Add comprehensive trip preparation features including checklists and task management.

### Requirements

#### 4.1 Packing List
- [ ] AI-generated packing suggestions based on:
  - Destination climate/weather
  - Trip duration
  - Planned activities
  - Season/time of year
- [ ] Categorized items: Clothing, Toiletries, Electronics, Documents, etc.
- [ ] Checkbox interface to track packed items
- [ ] Custom item addition

**UI Example:**
```
┌─────────────────────────────────────────┐
│ 🧳 Packing List - Tokyo Spring Trip     │
│ ─────────────────────────────────────── │
│ 👔 Clothing (8 items)                   │
│   ☑️ Light jacket (spring weather)      │
│   ☑️ Comfortable walking shoes          │
│   ☐ Rain jacket/umbrella               │
│   ☐ 5x T-shirts                        │
│   ☐ 3x Pants/shorts                    │
│   [Show all...]                         │
│                                         │
│ 📄 Documents (4 items)                  │
│   ☐ Passport (valid 6+ months)         │
│   ☐ Travel insurance docs              │
│   ☐ Hotel confirmations                │
│   ☐ JR Pass voucher                    │
│                                         │
│ [+ Add Custom Item]                     │
└─────────────────────────────────────────┘
```

#### 4.2 Trip Preparation Todos
- [ ] Pre-trip task checklist:
  - Book flights
  - Reserve hotels
  - Apply for visa (if needed)
  - Purchase travel insurance
  - Notify bank of travel
  - Download offline maps
- [ ] Due date assignments
- [ ] Task completion tracking
- [ ] Reminder notifications (optional)

**UI Example:**
```
┌─────────────────────────────────────────┐
│ ✅ Trip Preparation                     │
│ ─────────────────────────────────────── │
│ 📋 Before You Go (3/7 complete)         │
│                                         │
│ ☑️ Book flights                         │
│    Completed Mar 1                      │
│                                         │
│ ☑️ Reserve hotels                       │
│    Completed Mar 5                      │
│                                         │
│ ☑️ Purchase travel insurance            │
│    Completed Mar 10                     │
│                                         │
│ ☐ Apply for visa                        │
│    Due: Mar 15 ⚠️ 5 days left           │
│                                         │
│ ☐ Exchange currency                     │
│    Due: Mar 25                          │
│                                         │
│ [+ Add Task]                            │
└─────────────────────────────────────────┘
```

#### 4.3 Trip Notes
- [ ] Free-form notes section per trip
- [ ] Notes per day/activity
- [ ] Rich text support (basic formatting)

---

## Feature 5: Visual Trip Display & Sharing

### Problem Statement
Users cannot visualize their trip route or easily share plans with travel companions.

### Solution
Integrate interactive maps, attraction photos, and collaborative sharing features.

### Requirements

#### 5.1 Interactive Map Integration
- [ ] Use **Leaflet.js** with **OpenStreetMap** (free, open-source)
- [ ] Display trip route with markers for each location
- [ ] Day-by-day route visualization
- [ ] Walking/transit directions between attractions
- [ ] Cluster markers for dense areas

**Map Features:**
```
┌─────────────────────────────────────────┐
│ 🗺️ Trip Map - Tokyo 5 Days              │
│ ┌─────────────────────────────────────┐ │
│ │                                     │ │
│ │    [Interactive OpenStreetMap]      │ │
│ │                                     │ │
│ │  📍1 ──── 📍2 ──── 📍3              │ │
│ │           │                         │ │
│ │          📍4                        │ │
│ │                                     │ │
│ └─────────────────────────────────────┘ │
│ 📅 Day: [1] [2] [3] [4] [5] [All]       │
│                                         │
│ Legend:                                 │
│ 🔴 Hotels  🔵 Attractions  🟢 Food      │
└─────────────────────────────────────────┘
```

#### 5.2 Attraction Photos & Info
- [ ] Integrate **Unsplash API** for destination/attraction photos
- [ ] Fallback to **Wikimedia Commons** for landmarks
- [ ] Display key info: opening hours, admission fees, tips
- [ ] Link to official websites/booking

#### 5.3 Attraction Planning
- [ ] Add attractions to specific days
- [ ] Drag-and-drop reordering
- [ ] Time slot assignment
- [ ] Automatic travel time calculation between attractions
- [ ] Conflict detection (overlapping times)

#### 5.4 Trip Sharing & Collaboration
- [ ] Generate shareable link (public or password-protected)
- [ ] Invite trip mates via email
- [ ] Role-based access:
  - **Owner**: Full edit access
  - **Editor**: Can modify itinerary
  - **Viewer**: Read-only access
- [ ] Real-time sync for collaborators
- [ ] Activity feed: "John added Senso-ji Temple to Day 1"

**Sharing UI:**
```
┌─────────────────────────────────────────┐
│ 👥 Share Trip - Tokyo Adventure         │
│ ─────────────────────────────────────── │
│                                         │
│ 🔗 Share Link                           │
│ ┌─────────────────────────────────────┐ │
│ │ https://tripmate.ai/s/abc123        │ │
│ └─────────────────────────────────────┘ │
│ [Copy Link]  [QR Code]                  │
│                                         │
│ 👤 Trip Mates                           │
│ ┌─────────────────────────────────────┐ │
│ │ 👤 Demo User (Owner)                │ │
│ │ 👤 jane@email.com (Editor) ✉️ Sent  │ │
│ │ 👤 bob@email.com (Viewer) ✅ Joined │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ [+ Invite Trip Mate]                    │
└─────────────────────────────────────────┘
```

---

## Feature 6: Security Improvements

### Problem Statement
API endpoints may be accessible without proper authentication, creating security vulnerabilities.

### Solution
Implement comprehensive API security with proper authentication guards.

### Requirements

#### 6.1 API Authentication Enforcement
- [ ] Audit all API endpoints for authentication requirements
- [ ] Protected endpoints (require valid JWT):
  - `POST /api/trips/*`
  - `GET /api/trips/*`
  - `PUT /api/trips/*`
  - `DELETE /api/trips/*`
  - `POST /api/chat` (for logged-in users)
  - `GET /api/chat/sessions/*`
  - `GET /api/auth/me`
  - `POST /api/auth/logout`
- [ ] Public endpoints (no auth required):
  - `GET /health`
  - `GET /`
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `POST /api/chat/anonymous` (new endpoint for presales)

#### 6.2 Token Security
- [ ] Implement token refresh mechanism
- [ ] Short-lived access tokens (15-30 minutes)
- [ ] Secure HTTP-only cookies option
- [ ] Token blacklisting on logout
- [ ] Rate limiting per token

#### 6.3 Input Validation
- [ ] Validate all request bodies with Pydantic
- [ ] Sanitize user inputs to prevent XSS
- [ ] Parameterized queries (already using SQLAlchemy ORM)
- [ ] File upload validation (if applicable)

#### 6.4 Security Headers
- [ ] Add security middleware:
  ```python
  # CORS (restrict in production)
  # X-Content-Type-Options: nosniff
  # X-Frame-Options: DENY
  # Content-Security-Policy
  # Strict-Transport-Security (HTTPS)
  ```

#### 6.5 Error Handling
- [ ] Generic error messages for auth failures
- [ ] No stack traces in production
- [ ] Proper HTTP status codes (401, 403, etc.)

---

## Feature 7: Google OAuth Login

### Problem Statement
Users must create new credentials, adding friction to signup. Gmail login provides faster onboarding.

### Solution
Implement Google OAuth 2.0 for seamless authentication.

### Requirements

#### 7.1 Google OAuth Integration
- [ ] Register app in Google Cloud Console
- [ ] Implement OAuth 2.0 flow:
  1. User clicks "Sign in with Google"
  2. Redirect to Google consent screen
  3. Google redirects back with auth code
  4. Exchange code for tokens
  5. Fetch user profile (email, name, avatar)
  6. Create/link user account
  7. Issue JWT token

#### 7.2 Backend Implementation
```python
# New endpoints
POST /api/auth/google          # Initiate OAuth flow
GET  /api/auth/google/callback # Handle OAuth callback
```

- [ ] Use `authlib` or `python-social-auth` library
- [ ] Store OAuth provider info in User model:
  - `oauth_provider`: "google"
  - `oauth_id`: Google user ID
  - `avatar_url`: Google profile picture

#### 7.3 Frontend Implementation
```typescript
// Google Sign-In button component
<GoogleSignInButton
  onSuccess={handleGoogleLogin}
  onError={handleError}
/>
```

- [ ] Use `@react-oauth/google` package
- [ ] Styled "Sign in with Google" button following Google's brand guidelines
- [ ] Handle loading and error states

#### 7.4 Account Linking
- [ ] If email already exists with password:
  - Prompt to link accounts
  - "This email is registered. Sign in with password to link Google account."
- [ ] If email exists with Google:
  - Auto-login
- [ ] If new email:
  - Create new account

#### 7.5 UI Integration
```
┌─────────────────────────────────────────┐
│        Sign in to TripMate AI           │
│ ─────────────────────────────────────── │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ 🔵 G  Sign in with Google           │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ─────────── or ───────────              │
│                                         │
│ Email:    [_________________________]   │
│ Password: [_________________________]   │
│                                         │
│ [Sign In]                               │
│                                         │
│ Don't have an account? Sign up          │
└─────────────────────────────────────────┘
```

---

## Feature 8: Frontend Upgrade to Next.js 15 with CopilotKit & AG-UI

### Problem Statement
The current frontend uses Next.js 14 with a custom AI chat implementation. This lacks the rich agentic UI capabilities and standardized agent communication that modern AI applications require.

### Solution
Upgrade to Next.js 15 with React 19, integrate CopilotKit for agentic UI components, and implement the AG-UI protocol for standardized agent-frontend communication.

### Requirements

#### 8.1 Next.js 15 Upgrade
- [ ] Upgrade Next.js from 14.1.0 to 15.x
- [ ] Upgrade React from 18.x to 19.x
- [ ] Update async request APIs (`cookies()`, `headers()`, etc.)
- [ ] Migrate from `useFormState` to `useActionState` if applicable
- [ ] Update caching strategies (uncached by default in Next.js 15)
- [ ] Ensure ESLint 9 compatibility
- [ ] Update TypeScript types for React 19

#### 8.2 CopilotKit Integration
- [ ] Install CopilotKit packages (`@copilotkit/react-core`, `@copilotkit/react-ui`)
- [ ] Wrap application with `<CopilotKit>` provider
- [ ] Replace custom chat UI with `<CopilotChat>` or `<CopilotSidebar>`
- [ ] Implement `useCopilotAction` for trip-related actions
- [ ] Add `useCopilotChatSuggestions` for quick replies
- [ ] Configure streaming responses with typing indicators

#### 8.3 AG-UI Protocol Backend Implementation
- [ ] Install AG-UI Python SDK (`ag-ui-protocol`)
- [ ] Create AG-UI compatible endpoint in FastAPI
- [ ] Implement AG-UI event types:
  - `RUN_STARTED` / `RUN_FINISHED` (lifecycle)
  - `TEXT_MESSAGE_START` / `TEXT_MESSAGE_CONTENT` / `TEXT_MESSAGE_END` (streaming)
  - `TOOL_CALL_START` / `TOOL_CALL_ARGS` / `TOOL_CALL_END` (tool execution)
  - `STATE_SNAPSHOT` / `STATE_DELTA` (state sync)
- [ ] Stream responses via Server-Sent Events (SSE)
- [ ] Integrate with existing OpenAI agent service

#### 8.4 Frontend-Backend Connection via AG-UI
- [ ] Configure CopilotKit runtime to connect to AG-UI endpoint
- [ ] Implement `useAgent` hook for direct agent interaction
- [ ] Set up bidirectional state synchronization
- [ ] Handle real-time streaming in chat UI
- [ ] Implement human-in-the-loop patterns for trip confirmation

#### 8.5 Agentic UI Components
- [ ] Generative UI for dynamic trip cards
- [ ] Interactive action buttons in chat responses
- [ ] Real-time context enrichment (user preferences, trip history)
- [ ] Frontend tool integration (save trip, view map, etc.)

**Architecture:**
```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js 15)                     │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                  CopilotKit Provider                      │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │    │
│  │  │ CopilotChat │  │  useAgent   │  │ useCopilotAction│  │    │
│  │  └─────────────┘  └─────────────┘  └─────────────────┘  │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ AG-UI Protocol (SSE)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Backend (FastAPI)                            │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              AG-UI Endpoint (/api/agent)                  │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │    │
│  │  │ Event Stream│  │ State Sync  │  │  Tool Executor  │  │    │
│  │  └─────────────┘  └─────────────┘  └─────────────────┘  │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              Agent Service (OpenAI GPT-4)                 │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Technical Implementation Notes

### New Dependencies

**Backend:**
```
# requirements.txt additions
authlib>=1.3.0          # OAuth library
httpx>=0.27.0           # Async HTTP client for OAuth
itsdangerous>=2.1.0     # Secure token signing
ag-ui-protocol>=0.1.0   # AG-UI protocol SDK
```

**Frontend:**
```json
// package.json updates
{
  "next": "^15.1.0",
  "react": "^19.0.0",
  "react-dom": "^19.0.0",
  "@copilotkit/react-core": "^1.50.0",
  "@copilotkit/react-ui": "^1.50.0",
  "@react-oauth/google": "^0.12.0",
  "react-leaflet": "^4.2.0",
  "leaflet": "^1.9.0"
}
```

### Database Schema Updates

```sql
-- User table additions
ALTER TABLE users ADD COLUMN oauth_provider VARCHAR(50);
ALTER TABLE users ADD COLUMN oauth_id VARCHAR(255);
ALTER TABLE users ADD COLUMN avatar_url VARCHAR(500);

-- New tables
CREATE TABLE trip_collaborators (
  id VARCHAR PRIMARY KEY,
  trip_id VARCHAR REFERENCES trips(id),
  user_id VARCHAR REFERENCES users(id),
  role VARCHAR(20), -- 'owner', 'editor', 'viewer'
  invited_at TIMESTAMP,
  joined_at TIMESTAMP
);

CREATE TABLE trip_todos (
  id VARCHAR PRIMARY KEY,
  trip_id VARCHAR REFERENCES trips(id),
  title VARCHAR(255),
  completed BOOLEAN DEFAULT FALSE,
  due_date DATE,
  created_at TIMESTAMP
);

CREATE TABLE trip_packing_items (
  id VARCHAR PRIMARY KEY,
  trip_id VARCHAR REFERENCES trips(id),
  category VARCHAR(50),
  item VARCHAR(255),
  packed BOOLEAN DEFAULT FALSE
);

CREATE TABLE trip_attractions (
  id VARCHAR PRIMARY KEY,
  trip_id VARCHAR REFERENCES trips(id),
  day_number INTEGER,
  name VARCHAR(255),
  location VARCHAR(255),
  lat FLOAT,
  lng FLOAT,
  start_time TIME,
  end_time TIME,
  notes TEXT,
  photo_url VARCHAR(500)
);

CREATE TABLE anonymous_sessions (
  id VARCHAR PRIMARY KEY,
  session_token VARCHAR(255) UNIQUE,
  query_count INTEGER DEFAULT 0,
  chat_history JSON,
  created_at TIMESTAMP,
  expires_at TIMESTAMP
);
```

### Environment Variables

```env
# .env additions
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3001/api/auth/google/callback
UNSPLASH_ACCESS_KEY=your-unsplash-key
ANONYMOUS_QUERY_LIMIT=5
```

---

## Success Metrics

| Feature | Metric | Target |
|---------|--------|--------|
| Presales Journey | Anonymous to registered conversion | >15% |
| Enhanced Chat | User satisfaction rating | >4.5/5 |
| Chat-to-Trip | Trips saved from chat | >60% |
| Trip Details | Feature adoption (packing/todos) | >40% |
| Visual Display | Map interaction rate | >70% |
| Security | Security audit pass | 100% |
| Google OAuth | OAuth signup rate | >50% |

---

## Implementation Priority

### Phase 0 (Foundation - Do First)
1. **Frontend Upgrade to Next.js 15 with CopilotKit & AG-UI (Feature 8)**
   - This is the foundation for all other features
   - Enables rich agentic UI capabilities
   - Standardizes agent-frontend communication

### Phase 1 (High Priority)
2. Security Improvements (Feature 6)
3. Google OAuth Login (Feature 7)
4. Presales Journey (Feature 1)

### Phase 2 (Medium Priority)
5. Enhanced Chat UI (Feature 2) - Now powered by CopilotKit
6. Chat-to-Trip Integration (Feature 3)

### Phase 3 (Lower Priority)
7. Enhanced Trip Details (Feature 4)
8. Visual Display & Sharing (Feature 5)

---

## Appendix

### A. API Endpoint Summary (v2)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/health` | No | Health check |
| POST | `/api/auth/register` | No | Register user |
| POST | `/api/auth/login` | No | Login |
| POST | `/api/auth/google` | No | Google OAuth |
| GET | `/api/auth/google/callback` | No | OAuth callback |
| GET | `/api/auth/me` | Yes | Get current user |
| POST | `/api/auth/logout` | Yes | Logout |
| POST | `/api/agent` | Optional | AG-UI agent endpoint (SSE stream) |
| POST | `/api/chat/anonymous` | No | Anonymous chat (limited) |
| POST | `/api/chat` | Yes | Authenticated chat |
| GET | `/api/trips` | Yes | List trips |
| POST | `/api/trips` | Yes | Create trip |
| GET | `/api/trips/:id` | Yes | Get trip |
| PUT | `/api/trips/:id` | Yes | Update trip |
| DELETE | `/api/trips/:id` | Yes | Delete trip |
| POST | `/api/trips/:id/share` | Yes | Share trip |
| GET | `/api/trips/shared/:token` | No | View shared trip |

### B. Component Library

**CopilotKit Components (from library):**
- `<CopilotKit>` - Provider component wrapping the app
- `<CopilotChat>` - Full-featured chat interface
- `<CopilotSidebar>` - Sidebar chat layout
- `<CopilotPopup>` - Popup chat widget

**Custom UI Components to build:**
- `<DestinationCard />` - Rendered via generative UI in chat
- `<ItineraryDayCard />` - Day-by-day itinerary display
- `<BudgetBreakdownCard />` - Budget visualization
- `<TripMap />` - Leaflet.js map integration
- `<PackingList />` - Checklist for packing items
- `<TodoChecklist />` - Pre-trip task management
- `<ShareModal />` - Trip sharing interface
- `<GoogleSignInButton />` - OAuth login button
- `<QueryLimitBanner />` - Anonymous user limit display

### C. AG-UI Event Types Reference

| Event Type | Category | Description |
|------------|----------|-------------|
| `RUN_STARTED` | Lifecycle | Agent run has begun |
| `RUN_FINISHED` | Lifecycle | Agent run completed |
| `RUN_ERROR` | Lifecycle | Agent run failed |
| `TEXT_MESSAGE_START` | Text | Start of text message |
| `TEXT_MESSAGE_CONTENT` | Text | Streaming text chunk |
| `TEXT_MESSAGE_END` | Text | End of text message |
| `TOOL_CALL_START` | Tool | Tool execution started |
| `TOOL_CALL_ARGS` | Tool | Tool arguments |
| `TOOL_CALL_END` | Tool | Tool execution finished |
| `STATE_SNAPSHOT` | State | Full state update |
| `STATE_DELTA` | State | Incremental state change |
| `CUSTOM` | Special | Custom event for UI actions |
