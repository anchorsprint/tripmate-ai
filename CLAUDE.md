# TripMate AI - Project Memory

## Overview
TripMate AI is a full-stack AI-powered travel planning application.

## Tech Stack

### Backend (Python/FastAPI)
- **Location**: `/mnt/d/dev/travel-app/backend`
- **Port**: 8000
- **Framework**: FastAPI with async support
- **Database**: SQLite with SQLAlchemy 2.0 (aiosqlite)
- **Auth**: JWT tokens (python-jose), SHA-256 password hashing
- **AI**: OpenAI API integration

### Frontend (Next.js)
- **Location**: `/mnt/d/dev/travel-app/frontend`
- **Port**: 3001
- **Framework**: Next.js 14.1.0 with TypeScript
- **State**: Zustand for auth, TanStack Query for data fetching
- **Styling**: Tailwind CSS
- **Testing**: Playwright (31 tests, all passing)

## Key Files

### Backend
- `app/main.py` - FastAPI app entry point, CORS config
- `app/config.py` - Settings (JWT, DB, OpenAI keys)
- `app/db/models.py` - SQLAlchemy models (User, Trip, Itinerary, ChatSession, ChatMessage, BudgetEstimate)
- `app/api/routes/auth.py` - Registration, login, logout
- `app/api/routes/trips.py` - Trip CRUD
- `app/api/routes/chat.py` - Chat sessions and messages
- `app/api/routes/copilotkit.py` - AI chat endpoint
- `app/services/agent_service.py` - OpenAI integration

### Frontend
- `src/app/page.tsx` - Landing page
- `src/app/auth/` - Login and register pages
- `src/app/app/` - Protected routes (chat, trips, settings)
- `src/stores/authStore.ts` - Auth state management
- `src/stores/tripStore.ts` - Trip state management
- `src/components/` - UI components (Button, Input, Card, Modal, etc.)
- `tests/` - Playwright tests

## Running the Application

### Start Backend
```bash
cd /mnt/d/dev/travel-app/backend
source venv/bin/activate
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Start Frontend
```bash
cd /mnt/d/dev/travel-app/frontend
npm run dev -- -p 3001
```

### Run Tests
```bash
cd /mnt/d/dev/travel-app/frontend
npx playwright test
```

## API Endpoints

### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Trips
- `GET /api/trips` - List user's trips
- `POST /api/trips` - Create trip
- `GET /api/trips/{id}` - Get trip details
- `PUT /api/trips/{id}` - Update trip
- `DELETE /api/trips/{id}` - Delete trip

### Chat
- `POST /api/chat` - Send message, get AI response
- `GET /api/chat/sessions` - List chat sessions
- `GET /api/chat/sessions/{id}` - Get session with messages

### AI
- `POST /api/copilotkit` - Streaming AI chat endpoint

## Configuration

### Environment Variables
- `OPENAI_API_KEY` - Required for AI features (in `.env.local`)
- `JWT_SECRET_KEY` - JWT signing key
- `DATABASE_URL` - SQLite connection string

### CORS
Currently configured to allow all origins (`*`) for development.
For production, update `app/main.py` to restrict origins.

## Known Issues Fixed
1. Password hashing - Changed from bcrypt to SHA-256 due to byte length errors
2. CORS - Fixed to allow localhost:3001
3. CopilotKit SDK removed - Was causing initialization errors, using custom chat implementation instead

## Test Results
All 31 Playwright tests passing:
- API tests (12): Health, auth, trips CRUD
- Auth UI tests (6): Forms, validation, login/register flow
- Chat tests (4): Interface, messaging, navigation
- Home tests (3): Landing page, navigation
- Trips tests (6): Empty state, create modal, trip creation
