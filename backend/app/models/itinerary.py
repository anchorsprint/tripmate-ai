from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from enum import Enum


class ActivityType(str, Enum):
    ATTRACTION = "attraction"
    ACTIVITY = "activity"
    TRANSPORT = "transport"
    REST = "rest"


class TimeSlot(str, Enum):
    MORNING = "morning"
    AFTERNOON = "afternoon"
    EVENING = "evening"


class MealType(str, Enum):
    BREAKFAST = "breakfast"
    LUNCH = "lunch"
    DINNER = "dinner"


class PriceRange(str, Enum):
    BUDGET = "$"
    MID = "$$"
    EXPENSIVE = "$$$"


class Location(BaseModel):
    name: str
    address: Optional[str] = None
    coordinates: Optional[dict] = None


class Activity(BaseModel):
    id: str
    name: str
    type: ActivityType
    time_slot: TimeSlot
    start_time: Optional[str] = None
    duration: int  # minutes
    location: Location
    cost: float
    currency: str = "USD"
    booking_required: bool = False
    booking_url: Optional[str] = None
    notes: Optional[str] = None


class Meal(BaseModel):
    type: MealType
    suggestion: str
    cuisine: str
    price_range: PriceRange
    location: Optional[str] = None


class ItineraryDay(BaseModel):
    day_number: int
    date: str
    theme: Optional[str] = None
    activities: List[Activity]
    meals: List[Meal]
    accommodation: Optional[str] = None
    daily_cost: float


class ItineraryData(BaseModel):
    destination: str
    start_date: str
    end_date: str
    days: List[ItineraryDay]
    total_estimated_cost: float
    notes: List[str] = []


class ItineraryCreate(BaseModel):
    data: ItineraryData


class ItineraryResponse(BaseModel):
    id: str
    trip_id: str
    data: ItineraryData
    version: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
