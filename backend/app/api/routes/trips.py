from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
import uuid

from app.db.database import get_db
from app.db.models import User, Trip
from app.models.trip import TripCreate, TripUpdate, TripResponse
from app.api.deps import get_current_user

router = APIRouter()


@router.get("", response_model=List[TripResponse])
async def list_trips(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Trip)
        .where(Trip.user_id == current_user.id)
        .order_by(Trip.updated_at.desc())
    )
    return result.scalars().all()


@router.post("", response_model=TripResponse)
async def create_trip(
    trip_data: TripCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    trip = Trip(
        user_id=current_user.id,
        **trip_data.model_dump()
    )
    db.add(trip)
    await db.commit()
    await db.refresh(trip)
    return trip


@router.get("/{trip_id}", response_model=TripResponse)
async def get_trip(
    trip_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Trip).where(Trip.id == trip_id, Trip.user_id == current_user.id)
    )
    trip = result.scalar_one_or_none()

    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    return trip


@router.put("/{trip_id}", response_model=TripResponse)
async def update_trip(
    trip_id: str,
    trip_data: TripUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Trip).where(Trip.id == trip_id, Trip.user_id == current_user.id)
    )
    trip = result.scalar_one_or_none()

    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    update_data = trip_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(trip, key, value)

    await db.commit()
    await db.refresh(trip)
    return trip


@router.delete("/{trip_id}")
async def delete_trip(
    trip_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Trip).where(Trip.id == trip_id, Trip.user_id == current_user.id)
    )
    trip = result.scalar_one_or_none()

    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    await db.delete(trip)
    await db.commit()
    return {"message": "Trip deleted successfully"}


@router.post("/{trip_id}/duplicate", response_model=TripResponse)
async def duplicate_trip(
    trip_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Trip).where(Trip.id == trip_id, Trip.user_id == current_user.id)
    )
    original = result.scalar_one_or_none()

    if not original:
        raise HTTPException(status_code=404, detail="Trip not found")

    new_trip = Trip(
        user_id=current_user.id,
        name=f"{original.name} (Copy)",
        destination=original.destination,
        start_date=original.start_date,
        end_date=original.end_date,
        travelers=original.travelers,
        budget=original.budget,
        currency=original.currency,
        notes=original.notes
    )
    db.add(new_trip)
    await db.commit()
    await db.refresh(new_trip)
    return new_trip


@router.post("/{trip_id}/share")
async def share_trip(
    trip_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Trip).where(Trip.id == trip_id, Trip.user_id == current_user.id)
    )
    trip = result.scalar_one_or_none()

    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    if not trip.share_id:
        trip.share_id = str(uuid.uuid4())[:8]
        await db.commit()

    return {"share_id": trip.share_id}


@router.get("/shared/{share_id}", response_model=TripResponse)
async def get_shared_trip(share_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Trip).where(Trip.share_id == share_id))
    trip = result.scalar_one_or_none()

    if not trip:
        raise HTTPException(status_code=404, detail="Shared trip not found")

    return trip
