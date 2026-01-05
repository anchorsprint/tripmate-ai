from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from enum import Enum


class TripStatus(str, Enum):
    DRAFT = "draft"
    PLANNED = "planned"
    BOOKED = "booked"
    COMPLETED = "completed"


class TripBase(BaseModel):
    name: str
    destination: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    travelers: int = 1
    budget: Optional[float] = None
    currency: str = "USD"
    notes: Optional[str] = None


class TripCreate(TripBase):
    pass


class TripUpdate(BaseModel):
    name: Optional[str] = None
    status: Optional[TripStatus] = None
    destination: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    travelers: Optional[int] = None
    budget: Optional[float] = None
    currency: Optional[str] = None
    notes: Optional[str] = None


class TripResponse(TripBase):
    id: str
    user_id: str
    status: TripStatus
    share_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class DestinationRecommendation(BaseModel):
    id: str
    name: str
    country: str
    match_score: int
    match_reasons: List[str]
    best_time_to_visit: str
    daily_budget: dict
    highlights: List[str]
    pros: List[str]
    cons: List[str]
    image_url: Optional[str] = None
