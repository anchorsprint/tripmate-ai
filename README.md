# TripMate AI

An AI-powered travel planning assistant that helps you create personalized trip itineraries through natural conversation.

## Features

- **AI Chat Assistant**: Natural language interface to plan your trips
- **Trip Management**: Create, view, and manage multiple trips
- **Smart Itineraries**: AI-generated day-by-day travel plans
- **Budget Tracking**: Set budgets and get cost-aware recommendations
- **User Authentication**: Secure registration and login

## Tech Stack

### Backend
- **Python 3.11+** with FastAPI
- **SQLite** with SQLAlchemy 2.0 (async)
- **JWT** authentication
- **OpenAI API** for AI features

### Frontend
- **Next.js 14** with TypeScript
- **Tailwind CSS** for styling
- **Zustand** for state management
- **TanStack Query** for data fetching
- **Playwright** for end-to-end testing

## Getting Started

### Prerequisites

- Python 3.11 or higher
- Node.js 18 or higher
- OpenAI API key

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Linux/Mac:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create environment file
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY

# Start the server
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
# Edit .env.local and configure API URL

# Start development server
npm run dev -- -p 3001
```

### Access the Application

- Frontend: http://localhost:3001
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## Project Structure

```
tripmate-ai/
├── backend/
│   ├── app/
│   │   ├── api/routes/      # API endpoints
│   │   ├── db/              # Database models and setup
│   │   ├── services/        # Business logic
│   │   ├── config.py        # Configuration
│   │   └── main.py          # FastAPI application
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── app/             # Next.js pages
│   │   ├── components/      # React components
│   │   └── stores/          # Zustand stores
│   ├── tests/               # Playwright tests
│   └── package.json
└── README.md
```

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/logout` | Logout |

### Trips
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/trips` | List user's trips |
| POST | `/api/trips` | Create trip |
| GET | `/api/trips/{id}` | Get trip details |
| PUT | `/api/trips/{id}` | Update trip |
| DELETE | `/api/trips/{id}` | Delete trip |

### Chat
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chat` | Send message, get AI response |
| GET | `/api/chat/sessions` | List chat sessions |
| GET | `/api/chat/sessions/{id}` | Get session with messages |

## Running Tests

```bash
cd frontend

# Run all tests
npx playwright test

# Run tests with UI
npx playwright test --ui

# Run specific test file
npx playwright test tests/auth.spec.ts
```

## Environment Variables

### Backend (.env)
```
OPENAI_API_KEY=your-openai-api-key
JWT_SECRET_KEY=your-secret-key
DATABASE_URL=sqlite+aiosqlite:///./tripmate.db
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Development

### Code Style
- Backend: Black formatter, isort for imports
- Frontend: ESLint, Prettier

### Database
The application uses SQLite for simplicity. The database file is created automatically on first run.

## Roadmap

See [prd-v2.md](./prd-v2.md) for planned features including:
- Presales journey (try without login)
- Enhanced chat UI with streaming
- Chat-to-trip integration
- Packing lists and todo items
- Map visualization
- Google OAuth

## License

MIT

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request
