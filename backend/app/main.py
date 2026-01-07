from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.config import get_settings
from app.db.database import init_db
from app.api.routes import auth, trips, itinerary, chat, copilotkit, agui

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await init_db()
    yield
    # Shutdown
    pass


app = FastAPI(
    title=settings.app_name,
    description="AI-powered travel planning assistant with AG-UI protocol support",
    version="2.0.0",
    lifespan=lifespan
)

# CORS - Allow all origins in development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(trips.router, prefix="/api/trips", tags=["Trips"])
app.include_router(itinerary.router, prefix="/api/trips", tags=["Itinerary"])
app.include_router(chat.router, prefix="/api/chat", tags=["Chat"])
app.include_router(copilotkit.router, prefix="/api", tags=["CopilotKit"])
app.include_router(agui.router, prefix="/api", tags=["AG-UI"])


@app.get("/")
async def root():
    return {"message": "Welcome to TripMate AI API", "version": "1.0.0"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
