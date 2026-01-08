from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
import hashlib
import secrets
import httpx
from jose import jwt
from datetime import datetime, timedelta
from typing import Optional

from app.db.database import get_db
from app.db.models import User
from app.models.user import UserCreate, UserLogin, UserResponse, Token
from app.config import get_settings
from app.api.deps import get_current_user

router = APIRouter()
settings = get_settings()


# Google OAuth models
class GoogleAuthRequest(BaseModel):
    """Request model for Google OAuth authentication."""
    credential: str  # Google ID token from frontend


class GoogleUserInfo(BaseModel):
    """Google user info from ID token verification."""
    sub: str  # Google user ID
    email: str
    email_verified: bool = False
    name: Optional[str] = None
    picture: Optional[str] = None


def hash_password(password: str) -> str:
    """Hash a password using SHA-256 with salt."""
    salt = secrets.token_hex(16)
    hash_obj = hashlib.sha256((salt + password).encode())
    return f"{salt}:{hash_obj.hexdigest()}"


def verify_password(password: str, hashed: str) -> bool:
    """Verify a password against a hashed value."""
    try:
        salt, hash_value = hashed.split(":")
        hash_obj = hashlib.sha256((salt + password).encode())
        return hash_obj.hexdigest() == hash_value
    except ValueError:
        return False


def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=settings.access_token_expire_minutes)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)


@router.post("/register", response_model=Token)
async def register(user_data: UserCreate, db: AsyncSession = Depends(get_db)):
    # Check if user exists
    result = await db.execute(select(User).where(User.email == user_data.email))
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Create user
    hashed_password = hash_password(user_data.password)
    user = User(
        email=user_data.email,
        name=user_data.name,
        password_hash=hashed_password
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    # Create token
    access_token = create_access_token({"sub": user.id})
    return Token(access_token=access_token)


@router.post("/login", response_model=Token)
async def login(user_data: UserLogin, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == user_data.email))
    user = result.scalar_one_or_none()

    if not user or not verify_password(user_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )

    access_token = create_access_token({"sub": user.id})
    return Token(access_token=access_token)


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.post("/logout")
async def logout():
    # For JWT, logout is handled client-side by removing the token
    return {"message": "Logged out successfully"}


async def verify_google_token(credential: str) -> GoogleUserInfo:
    """Verify Google ID token and return user info."""
    google_client_id = getattr(settings, 'google_client_id', None)

    if not google_client_id:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Google OAuth is not configured"
        )

    # Verify the token with Google's tokeninfo endpoint
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"https://oauth2.googleapis.com/tokeninfo?id_token={credential}"
        )

        if response.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid Google token"
            )

        token_info = response.json()

        # Verify the audience (client ID) matches
        if token_info.get("aud") != google_client_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token was not issued for this application"
            )

        return GoogleUserInfo(
            sub=token_info["sub"],
            email=token_info["email"],
            email_verified=token_info.get("email_verified", "false") == "true",
            name=token_info.get("name"),
            picture=token_info.get("picture"),
        )


@router.post("/google", response_model=Token)
async def google_auth(auth_request: GoogleAuthRequest, db: AsyncSession = Depends(get_db)):
    """
    Authenticate with Google OAuth.

    This endpoint accepts a Google ID token from the frontend (obtained via Google Sign-In),
    verifies it with Google, and either creates a new user or logs in an existing user.
    """
    # Verify the Google token
    google_user = await verify_google_token(auth_request.credential)

    if not google_user.email_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google email not verified"
        )

    # Check if user exists with this Google OAuth ID
    result = await db.execute(
        select(User).where(
            (User.oauth_provider == "google") & (User.oauth_id == google_user.sub)
        )
    )
    user = result.scalar_one_or_none()

    if user:
        # Existing Google OAuth user - update info and login
        user.name = google_user.name or user.name
        user.avatar_url = google_user.picture or user.avatar_url
        await db.commit()
        access_token = create_access_token({"sub": user.id})
        return Token(access_token=access_token)

    # Check if user exists with this email (registered with password)
    result = await db.execute(select(User).where(User.email == google_user.email))
    existing_user = result.scalar_one_or_none()

    if existing_user:
        # Link Google account to existing user
        existing_user.oauth_provider = "google"
        existing_user.oauth_id = google_user.sub
        existing_user.avatar_url = google_user.picture or existing_user.avatar_url
        if not existing_user.name:
            existing_user.name = google_user.name
        await db.commit()
        access_token = create_access_token({"sub": existing_user.id})
        return Token(access_token=access_token)

    # Create new user with Google OAuth
    new_user = User(
        email=google_user.email,
        name=google_user.name,
        avatar_url=google_user.picture,
        oauth_provider="google",
        oauth_id=google_user.sub,
        password_hash=None,  # No password for OAuth users
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    access_token = create_access_token({"sub": new_user.id})
    return Token(access_token=access_token)
