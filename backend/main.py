from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import date
from uuid import uuid4

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://eet-add.dtm.report",  # Production frontend
        "http://localhost:5173",        # Local development
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---- Models ----

class Location(BaseModel):
    lat: float
    lon: float

class Movement(BaseModel):
    id: str
    from_: Location = Field(..., alias="from")
    to: Location
    individuals: int

    class Config:
        populate_by_name = True
        extra = "forbid"  # Optional: helps catch unexpected fields

class EmergencyEvent(BaseModel):
    id: str  # Unique ID for each event
    country: str
    email: EmailStr
    eventStart: date
    eventEnd: date
    eventType: str
    trigger: str
    priorityNeed1: Optional[str]
    priorityNeed2: Optional[str]
    priorityNeed3: Optional[str]
    narrativeSummary: Optional[str]
    movements: List[Movement]

class EmergencyEventCreate(BaseModel):
    country: str
    email: EmailStr
    eventStart: date
    eventEnd: date
    eventType: str
    trigger: str
    priorityNeed1: Optional[str]
    priorityNeed2: Optional[str]
    priorityNeed3: Optional[str]
    narrativeSummary: Optional[str]
    movements: List[Movement]

    class Config:
        populate_by_name = True

# ---- In-Memory Storage ----
events_db: dict[str, EmergencyEvent] = {}

# ---- POST: Submit new event ----
@app.post("/submit-event", response_model=EmergencyEvent)
def submit_event(event_data: EmergencyEventCreate):
    event_id = str(uuid4())
    event = EmergencyEvent(id=event_id, **event_data.dict())
    events_db[event_id] = event
    return event

# ---- GET: List all events ----
@app.get("/events", response_model=List[EmergencyEvent])
def list_events(
    country: Optional[str] = Query(None, description="Filter events by country"),
    start_date: Optional[date] = Query(None, alias="eventStart", description="Filter events starting from this date"),
    end_date: Optional[date] = Query(None, alias="eventEnd", description="Filter events ending before this date")
):
    results = list(events_db.values())
    if country:
        results = [e for e in results if e.country.lower() == country.lower()]
    if start_date:
        results = [e for e in results if e.eventStart >= start_date]
    if end_date:
        results = [e for e in results if e.eventEnd <= end_date]
    return results

# ---- GET: Retrieve specific event by ID ----
@app.get("/events/{event_id}", response_model=EmergencyEvent)
def get_event(event_id: str):
    event = events_db.get(event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event