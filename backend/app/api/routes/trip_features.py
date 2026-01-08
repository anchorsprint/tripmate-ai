"""API routes for trip packing lists and todos."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

from app.db.database import get_db
from app.db.models import Trip, PackingItem, TripTodo
from app.api.deps import get_current_user

router = APIRouter()


# Pydantic models for packing items
class PackingItemCreate(BaseModel):
    category: str
    item: str
    quantity: int = 1
    notes: Optional[str] = None


class PackingItemUpdate(BaseModel):
    category: Optional[str] = None
    item: Optional[str] = None
    packed: Optional[bool] = None
    quantity: Optional[int] = None
    notes: Optional[str] = None


class PackingItemResponse(BaseModel):
    id: str
    trip_id: str
    category: str
    item: str
    packed: bool
    quantity: int
    notes: Optional[str]

    class Config:
        from_attributes = True


# Pydantic models for todos
class TodoCreate(BaseModel):
    title: str
    description: Optional[str] = None
    due_date: Optional[str] = None
    priority: int = 0


class TodoUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    completed: Optional[bool] = None
    due_date: Optional[str] = None
    priority: Optional[int] = None


class TodoResponse(BaseModel):
    id: str
    trip_id: str
    title: str
    description: Optional[str]
    completed: bool
    due_date: Optional[str]
    completed_at: Optional[datetime]
    priority: int

    class Config:
        from_attributes = True


# Helper to verify trip ownership
async def get_trip_for_user(trip_id: str, user_id: str, db: AsyncSession) -> Trip:
    result = await db.execute(
        select(Trip).where(Trip.id == trip_id, Trip.user_id == user_id)
    )
    trip = result.scalar_one_or_none()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    return trip


# ============ PACKING ITEMS ENDPOINTS ============

@router.get("/{trip_id}/packing", response_model=List[PackingItemResponse])
async def get_packing_items(
    trip_id: str,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get all packing items for a trip."""
    await get_trip_for_user(trip_id, current_user.id, db)

    result = await db.execute(
        select(PackingItem)
        .where(PackingItem.trip_id == trip_id)
        .order_by(PackingItem.category, PackingItem.item)
    )
    return result.scalars().all()


@router.post("/{trip_id}/packing", response_model=PackingItemResponse)
async def create_packing_item(
    trip_id: str,
    item_data: PackingItemCreate,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Add a packing item to a trip."""
    await get_trip_for_user(trip_id, current_user.id, db)

    item = PackingItem(
        trip_id=trip_id,
        category=item_data.category,
        item=item_data.item,
        quantity=item_data.quantity,
        notes=item_data.notes,
    )
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return item


@router.put("/{trip_id}/packing/{item_id}", response_model=PackingItemResponse)
async def update_packing_item(
    trip_id: str,
    item_id: str,
    item_data: PackingItemUpdate,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update a packing item."""
    await get_trip_for_user(trip_id, current_user.id, db)

    result = await db.execute(
        select(PackingItem).where(
            PackingItem.id == item_id,
            PackingItem.trip_id == trip_id
        )
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Packing item not found")

    update_data = item_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(item, key, value)

    await db.commit()
    await db.refresh(item)
    return item


@router.delete("/{trip_id}/packing/{item_id}")
async def delete_packing_item(
    trip_id: str,
    item_id: str,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete a packing item."""
    await get_trip_for_user(trip_id, current_user.id, db)

    result = await db.execute(
        select(PackingItem).where(
            PackingItem.id == item_id,
            PackingItem.trip_id == trip_id
        )
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Packing item not found")

    await db.delete(item)
    await db.commit()
    return {"message": "Packing item deleted"}


@router.post("/{trip_id}/packing/generate", response_model=List[PackingItemResponse])
async def generate_packing_list(
    trip_id: str,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Generate AI-suggested packing items based on trip details."""
    trip = await get_trip_for_user(trip_id, current_user.id, db)

    # Default packing suggestions by category
    default_items = {
        "Documents": [
            "Passport/ID",
            "Travel insurance documents",
            "Hotel confirmations",
            "Flight tickets/boarding passes",
            "Emergency contacts list",
        ],
        "Electronics": [
            "Phone charger",
            "Power adapter",
            "Camera",
            "Headphones",
        ],
        "Toiletries": [
            "Toothbrush & toothpaste",
            "Deodorant",
            "Shampoo & conditioner",
            "Sunscreen",
            "Medications",
        ],
        "Clothing": [
            "Underwear",
            "Socks",
            "T-shirts",
            "Pants/shorts",
            "Comfortable walking shoes",
            "Pajamas",
        ],
        "Miscellaneous": [
            "Reusable water bottle",
            "Snacks",
            "Travel pillow",
            "Hand sanitizer",
        ],
    }

    created_items = []
    for category, items in default_items.items():
        for item_name in items:
            # Check if item already exists
            existing = await db.execute(
                select(PackingItem).where(
                    PackingItem.trip_id == trip_id,
                    PackingItem.category == category,
                    PackingItem.item == item_name
                )
            )
            if existing.scalar_one_or_none():
                continue

            item = PackingItem(
                trip_id=trip_id,
                category=category,
                item=item_name,
            )
            db.add(item)
            created_items.append(item)

    await db.commit()
    for item in created_items:
        await db.refresh(item)

    return created_items


# ============ TODOS ENDPOINTS ============

@router.get("/{trip_id}/todos", response_model=List[TodoResponse])
async def get_todos(
    trip_id: str,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get all todos for a trip."""
    await get_trip_for_user(trip_id, current_user.id, db)

    result = await db.execute(
        select(TripTodo)
        .where(TripTodo.trip_id == trip_id)
        .order_by(TripTodo.priority.desc(), TripTodo.due_date, TripTodo.created_at)
    )
    return result.scalars().all()


@router.post("/{trip_id}/todos", response_model=TodoResponse)
async def create_todo(
    trip_id: str,
    todo_data: TodoCreate,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Add a todo to a trip."""
    await get_trip_for_user(trip_id, current_user.id, db)

    todo = TripTodo(
        trip_id=trip_id,
        title=todo_data.title,
        description=todo_data.description,
        due_date=todo_data.due_date,
        priority=todo_data.priority,
    )
    db.add(todo)
    await db.commit()
    await db.refresh(todo)
    return todo


@router.put("/{trip_id}/todos/{todo_id}", response_model=TodoResponse)
async def update_todo(
    trip_id: str,
    todo_id: str,
    todo_data: TodoUpdate,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update a todo."""
    await get_trip_for_user(trip_id, current_user.id, db)

    result = await db.execute(
        select(TripTodo).where(
            TripTodo.id == todo_id,
            TripTodo.trip_id == trip_id
        )
    )
    todo = result.scalar_one_or_none()
    if not todo:
        raise HTTPException(status_code=404, detail="Todo not found")

    update_data = todo_data.model_dump(exclude_unset=True)

    # Handle completion timestamp
    if "completed" in update_data:
        if update_data["completed"] and not todo.completed:
            update_data["completed_at"] = datetime.utcnow()
        elif not update_data["completed"]:
            update_data["completed_at"] = None

    for key, value in update_data.items():
        setattr(todo, key, value)

    await db.commit()
    await db.refresh(todo)
    return todo


@router.delete("/{trip_id}/todos/{todo_id}")
async def delete_todo(
    trip_id: str,
    todo_id: str,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete a todo."""
    await get_trip_for_user(trip_id, current_user.id, db)

    result = await db.execute(
        select(TripTodo).where(
            TripTodo.id == todo_id,
            TripTodo.trip_id == trip_id
        )
    )
    todo = result.scalar_one_or_none()
    if not todo:
        raise HTTPException(status_code=404, detail="Todo not found")

    await db.delete(todo)
    await db.commit()
    return {"message": "Todo deleted"}


@router.post("/{trip_id}/todos/generate", response_model=List[TodoResponse])
async def generate_todos(
    trip_id: str,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Generate default pre-trip todos."""
    trip = await get_trip_for_user(trip_id, current_user.id, db)

    default_todos = [
        {"title": "Book flights", "priority": 2},
        {"title": "Reserve hotels/accommodation", "priority": 2},
        {"title": "Purchase travel insurance", "priority": 1},
        {"title": "Check passport validity (6+ months)", "priority": 2},
        {"title": "Apply for visa (if required)", "priority": 2},
        {"title": "Notify bank of travel dates", "priority": 1},
        {"title": "Download offline maps", "priority": 0},
        {"title": "Research local customs & etiquette", "priority": 0},
        {"title": "Exchange currency", "priority": 1},
        {"title": "Arrange airport transportation", "priority": 1},
    ]

    created_todos = []
    for todo_data in default_todos:
        # Check if todo already exists
        existing = await db.execute(
            select(TripTodo).where(
                TripTodo.trip_id == trip_id,
                TripTodo.title == todo_data["title"]
            )
        )
        if existing.scalar_one_or_none():
            continue

        todo = TripTodo(
            trip_id=trip_id,
            title=todo_data["title"],
            priority=todo_data["priority"],
        )
        db.add(todo)
        created_todos.append(todo)

    await db.commit()
    for todo in created_todos:
        await db.refresh(todo)

    return created_todos
