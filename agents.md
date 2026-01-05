# TripMate AI - Agent Instructions

This document is optimized for LLM agents working on this codebase. It provides structured information for code navigation, modification patterns, and common tasks.

## Quick Reference

```yaml
project_type: full-stack web application
backend: Python FastAPI (port 8000)
frontend: Next.js TypeScript (port 3001)
database: SQLite with SQLAlchemy async
auth: JWT tokens, SHA-256 password hashing
ai: OpenAI API integration
tests: Playwright end-to-end (31 tests)
```

## Directory Structure

```
/backend
  /app
    /api/routes     # REST endpoints (auth.py, trips.py, chat.py, itinerary.py, copilotkit.py)
    /db             # database.py, models.py
    /services       # agent_service.py (OpenAI)
    config.py       # Settings class
    main.py         # FastAPI app, CORS, routers
  requirements.txt

/frontend
  /src
    /app            # Next.js App Router pages
      /auth         # /auth/login, /auth/register
      /app          # Protected routes: /app/chat, /app/trips, /app/settings
      page.tsx      # Landing page (/)
      layout.tsx    # Root layout
      providers.tsx # QueryClient setup
    /components     # UI components
      /ui           # Button, Input, Card, Modal
      /chat         # TravelChat.tsx
      /layout       # Sidebar.tsx
      /trips        # TripCard.tsx, CreateTripModal.tsx
    /stores         # Zustand stores (authStore.ts, tripStore.ts)
    /lib            # api.ts (axios instance)
  /tests            # Playwright test files
  playwright.config.ts
```

## Key Files to Know

| Purpose | File Path |
|---------|-----------|
| API entry point | `/backend/app/main.py` |
| Database models | `/backend/app/db/models.py` |
| Auth logic | `/backend/app/api/routes/auth.py` |
| Trip CRUD | `/backend/app/api/routes/trips.py` |
| AI chat | `/backend/app/api/routes/copilotkit.py` |
| OpenAI integration | `/backend/app/services/agent_service.py` |
| Frontend API client | `/frontend/src/lib/api.ts` |
| Auth state | `/frontend/src/stores/authStore.ts` |
| Chat component | `/frontend/src/components/chat/TravelChat.tsx` |
| Protected layout | `/frontend/src/app/app/layout.tsx` |

## Database Models

```python
# User
- id: int (PK)
- email: str (unique)
- hashed_password: str (SHA-256 with salt)
- name: str
- created_at: datetime

# Trip
- id: int (PK)
- user_id: int (FK -> User)
- name: str
- destination: str
- start_date: date
- end_date: date
- num_travelers: int
- budget: float
- status: str (planning/confirmed/completed)
- created_at: datetime

# ItineraryDay
- id: int (PK)
- trip_id: int (FK -> Trip)
- day_number: int
- date: date
- activities: JSON

# ChatSession, ChatMessage, BudgetEstimate (see models.py)
```

## API Patterns

### Authentication Required
All `/api/trips/*` and `/api/chat/*` endpoints require Bearer token:
```
Authorization: Bearer <jwt_token>
```

### Response Format
```json
{
  "id": 1,
  "name": "...",
  "created_at": "2024-01-01T00:00:00"
}
```

### Error Format
```json
{
  "detail": "Error message"
}
```

## Common Tasks

### Add New API Endpoint

1. Create route in `/backend/app/api/routes/<name>.py`
2. Add router to `/backend/app/main.py`:
   ```python
   app.include_router(new_router.router, prefix="/api/new", tags=["New"])
   ```
3. Add Pydantic schemas in route file or `/backend/app/schemas/`

### Add New Database Model

1. Define model in `/backend/app/db/models.py`
2. Import in `/backend/app/db/database.py` metadata
3. Restart backend (auto-creates tables)

### Add New Frontend Page

1. Create directory under `/frontend/src/app/`
2. Add `page.tsx` file
3. Use existing layouts from `/app/layout.tsx` or `/app/app/layout.tsx`

### Add New Component

1. Create in `/frontend/src/components/<category>/`
2. Export from component file
3. Use existing UI primitives from `/components/ui/`

### Add New Test

1. Create `*.spec.ts` in `/frontend/tests/`
2. Follow existing patterns (beforeEach for auth)
3. Run with `npx playwright test tests/<name>.spec.ts`

## Environment Setup

### Backend
```bash
cd backend
source venv/bin/activate  # Linux/Mac
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Frontend
```bash
cd frontend
npm run dev -- -p 3001
```

### Run Tests
```bash
cd frontend
npx playwright test
```

## Important Implementation Details

### Password Hashing
Uses SHA-256 with random salt (NOT bcrypt) due to byte length issues:
```python
# auth.py
def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    hash_obj = hashlib.sha256((salt + password).encode())
    return f"{salt}:{hash_obj.hexdigest()}"
```

### CORS Configuration
Development mode allows all origins:
```python
# main.py
allow_origins=["*"]
allow_credentials=False
```

### Frontend API Base URL
Configured in `/frontend/src/lib/api.ts`:
```typescript
baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
```

### Protected Routes
`/frontend/src/app/app/layout.tsx` checks auth and redirects to login.

## Test Selectors

Playwright tests use these patterns:
- `page.getByRole('heading', { name: '...' })`
- `page.getByLabel('...')`
- `page.getByRole('button', { name: '...' })`
- `page.getByRole('link', { name: '...', exact: true })`
- `page.getByPlaceholder('...')`

## Current Limitations

1. No file uploads
2. No real-time updates (polling only)
3. SQLite (single file, not for production scale)
4. No email verification
5. CopilotKit SDK removed (use `/api/copilotkit` directly)

## Planned Features (prd-v2.md)

1. Presales journey (try without login)
2. Enhanced chat with streaming
3. Chat-to-trip integration (convert chat to trip)
4. Packing lists and todo items
5. Map visualization with Leaflet/OpenStreetMap
6. Google OAuth
7. Rate limiting and security hardening
