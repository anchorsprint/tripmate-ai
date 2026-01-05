from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.database import get_db
from app.db.models import User, Trip, Itinerary
from app.models.itinerary import ItineraryCreate, ItineraryResponse
from app.api.deps import get_current_user
from app.services.agent_service import generate_itinerary_for_trip

router = APIRouter()


@router.get("/{trip_id}/itinerary", response_model=ItineraryResponse)
async def get_itinerary(
    trip_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Verify trip ownership
    result = await db.execute(
        select(Trip).where(Trip.id == trip_id, Trip.user_id == current_user.id)
    )
    trip = result.scalar_one_or_none()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    # Get itinerary
    result = await db.execute(
        select(Itinerary).where(Itinerary.trip_id == trip_id)
    )
    itinerary = result.scalar_one_or_none()

    if not itinerary:
        raise HTTPException(status_code=404, detail="Itinerary not found")

    return itinerary


@router.post("/{trip_id}/itinerary", response_model=ItineraryResponse)
async def create_itinerary(
    trip_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Verify trip ownership
    result = await db.execute(
        select(Trip).where(Trip.id == trip_id, Trip.user_id == current_user.id)
    )
    trip = result.scalar_one_or_none()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    # Generate itinerary using AI
    itinerary_data = await generate_itinerary_for_trip(trip)

    # Check if itinerary exists
    result = await db.execute(
        select(Itinerary).where(Itinerary.trip_id == trip_id)
    )
    existing = result.scalar_one_or_none()

    if existing:
        existing.data = itinerary_data
        existing.version += 1
        itinerary = existing
    else:
        itinerary = Itinerary(
            trip_id=trip_id,
            data=itinerary_data
        )
        db.add(itinerary)

    await db.commit()
    await db.refresh(itinerary)
    return itinerary


@router.put("/{trip_id}/itinerary", response_model=ItineraryResponse)
async def update_itinerary(
    trip_id: str,
    itinerary_data: ItineraryCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Verify trip ownership
    result = await db.execute(
        select(Trip).where(Trip.id == trip_id, Trip.user_id == current_user.id)
    )
    trip = result.scalar_one_or_none()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    # Get itinerary
    result = await db.execute(
        select(Itinerary).where(Itinerary.trip_id == trip_id)
    )
    itinerary = result.scalar_one_or_none()

    if not itinerary:
        raise HTTPException(status_code=404, detail="Itinerary not found")

    itinerary.data = itinerary_data.data.model_dump()
    itinerary.version += 1
    await db.commit()
    await db.refresh(itinerary)
    return itinerary


@router.post("/{trip_id}/itinerary/regenerate", response_model=ItineraryResponse)
async def regenerate_itinerary(
    trip_id: str,
    preferences: dict = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Verify trip ownership
    result = await db.execute(
        select(Trip).where(Trip.id == trip_id, Trip.user_id == current_user.id)
    )
    trip = result.scalar_one_or_none()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    # Regenerate itinerary with new preferences
    itinerary_data = await generate_itinerary_for_trip(trip, preferences)

    # Update existing itinerary
    result = await db.execute(
        select(Itinerary).where(Itinerary.trip_id == trip_id)
    )
    itinerary = result.scalar_one_or_none()

    if itinerary:
        itinerary.data = itinerary_data
        itinerary.version += 1
    else:
        itinerary = Itinerary(
            trip_id=trip_id,
            data=itinerary_data
        )
        db.add(itinerary)

    await db.commit()
    await db.refresh(itinerary)
    return itinerary
