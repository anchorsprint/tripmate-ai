# TripMate AI - Claude Memory

This file serves as persistent context for Claude when working on this project.

## Project Identity

**TripMate AI** is a full-stack travel planning application with AI chat. Users describe their dream trip in natural language, and the AI helps create detailed itineraries.

**Repository**: https://github.com/anchorsprint/tripmate-ai

## Architecture Overview

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Next.js 14    │────▶│   FastAPI       │────▶│   OpenAI API    │
│   Port 3001     │     │   Port 8000     │     │   GPT-4         │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                       │
        │                       ▼
        │               ┌─────────────────┐
        │               │   SQLite        │
        │               │   tripmate.db   │
        └───────────────┴─────────────────┘
```

## Working Directories

- **Backend**: `/mnt/d/dev/travel-app/backend`
- **Frontend**: `/mnt/d/dev/travel-app/frontend`
- **Tests**: `/mnt/d/dev/travel-app/frontend/tests`

## How to Start the Application

### Backend
```bash
cd /mnt/d/dev/travel-app/backend
source venv/bin/activate
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Frontend
```bash
cd /mnt/d/dev/travel-app/frontend
npm run dev -- -p 3001
```

### Run All Tests
```bash
cd /mnt/d/dev/travel-app/frontend
npx playwright test
```

## Key Technical Decisions

### Authentication
- **JWT tokens** with `python-jose`
- **SHA-256 password hashing** (switched from bcrypt due to byte length errors)
- Salt stored with hash as `salt:hash`

### CORS
- Currently `allow_origins=["*"]` for development
- `allow_credentials=False` (required when using wildcard origin)

### State Management
- **Zustand** for auth state (`authStore.ts`)
- **TanStack Query** for server data fetching
- Tokens stored in localStorage

### AI Integration
- OpenAI API via `/api/copilotkit` endpoint
- Custom implementation (CopilotKit SDK was removed due to errors)

## Critical Files

| What | Where |
|------|-------|
| FastAPI app | `backend/app/main.py` |
| Database models | `backend/app/db/models.py` |
| Auth endpoints | `backend/app/api/routes/auth.py` |
| Trip CRUD | `backend/app/api/routes/trips.py` |
| AI chat endpoint | `backend/app/api/routes/copilotkit.py` |
| OpenAI service | `backend/app/services/agent_service.py` |
| Chat UI | `frontend/src/components/chat/TravelChat.tsx` |
| Auth store | `frontend/src/stores/authStore.ts` |
| API client | `frontend/src/lib/api.ts` |

## Database Schema

```sql
-- Core tables
users (id, email, hashed_password, name, created_at)
trips (id, user_id, name, destination, start_date, end_date, num_travelers, budget, status)
itinerary_days (id, trip_id, day_number, date, activities)
chat_sessions (id, user_id, title, created_at)
chat_messages (id, session_id, role, content, created_at)
budget_estimates (id, trip_id, category, estimated_amount, actual_amount, notes)
```

## API Endpoints Summary

| Route | Auth | Purpose |
|-------|------|---------|
| `POST /api/auth/register` | No | Create user |
| `POST /api/auth/login` | No | Get JWT token |
| `GET /api/auth/me` | Yes | Get current user |
| `GET /api/trips` | Yes | List trips |
| `POST /api/trips` | Yes | Create trip |
| `GET /api/trips/{id}` | Yes | Get trip |
| `PUT /api/trips/{id}` | Yes | Update trip |
| `DELETE /api/trips/{id}` | Yes | Delete trip |
| `POST /api/chat` | Yes | Send message |
| `POST /api/copilotkit` | No | AI streaming chat |

## Test Coverage

All **31 Playwright tests** passing:

| Suite | Tests | Description |
|-------|-------|-------------|
| api.spec.ts | 12 | Backend API tests |
| auth.spec.ts | 6 | Login/register UI |
| chat.spec.ts | 4 | Chat interface |
| home.spec.ts | 3 | Landing page |
| trips.spec.ts | 6 | Trip management |

## Known Issues & Solutions

| Issue | Solution |
|-------|----------|
| bcrypt "password too long" | Use SHA-256 with salt instead |
| CORS 400 errors | Set `allow_origins=["*"]`, `allow_credentials=False` |
| CopilotKit initialization | Removed SDK, use direct API calls |
| Playwright strict mode | Use exact selectors: `{ exact: true }` |

## Future Development

See `prd-v2.md` for planned features:
1. Presales journey (anonymous trial)
2. Enhanced chat UI with streaming
3. Chat-to-trip conversion
4. Packing lists and todos
5. Map visualization (Leaflet.js)
6. Google OAuth
7. Rate limiting

## Git Configuration

- **Remote**: `origin` -> `https://github.com/anchorsprint/tripmate-ai.git`
- **Commit email**: `15000126+jazztong@users.noreply.github.com`

## When Making Changes

1. **Before modifying code**: Read the file first to understand current implementation
2. **After backend changes**: Test with `curl` or run Playwright tests
3. **After frontend changes**: Run `npx playwright test` to verify nothing broke
4. **Database changes**: Models auto-create tables on startup; restart backend
5. **New features**: Update this file and `prd-v2.md` if significant
