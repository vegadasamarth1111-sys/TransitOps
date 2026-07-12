from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


# ---- Auth ----
class UserCreate(BaseModel):
    name: str
    email: str
    password: str
    role: str = "Dispatcher"

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str
    initials: str
    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# ---- Vehicle ----
class VehicleCreate(BaseModel):
    registration_number: str
    name: str
    type: str = "Van"
    max_load_capacity: float = 0
    odometer: float = 0
    acquisition_cost: float = 0
    status: str = "Available"
    region: str = "Gujarat"

class VehicleUpdate(BaseModel):
    registration_number: Optional[str] = None
    name: Optional[str] = None
    type: Optional[str] = None
    max_load_capacity: Optional[float] = None
    odometer: Optional[float] = None
    acquisition_cost: Optional[float] = None
    status: Optional[str] = None
    region: Optional[str] = None

class VehicleResponse(BaseModel):
    id: int
    registration_number: str
    name: str
    type: str
    max_load_capacity: float
    odometer: float
    acquisition_cost: float
    status: str
    region: str
    class Config:
        from_attributes = True


# ---- Driver ----
class DriverCreate(BaseModel):
    name: str
    license_number: str
    license_category: str = "LMV"
    license_expiry_date: str
    contact_number: str = ""
    safety_score: int = 100
    trip_completion: int = 100
    status: str = "Available"

class DriverUpdate(BaseModel):
    name: Optional[str] = None
    license_number: Optional[str] = None
    license_category: Optional[str] = None
    license_expiry_date: Optional[str] = None
    contact_number: Optional[str] = None
    safety_score: Optional[int] = None
    trip_completion: Optional[int] = None
    status: Optional[str] = None

class DriverResponse(BaseModel):
    id: int
    name: str
    license_number: str
    license_category: str
    license_expiry_date: str
    contact_number: str
    safety_score: int
    trip_completion: int
    status: str
    class Config:
        from_attributes = True


# ---- Trip ----
class TripCreate(BaseModel):
    source: str
    destination: str
    vehicle_id: Optional[int] = None
    driver_id: Optional[int] = None
    cargo_weight: float = 0
    planned_distance: float = 0

class TripComplete(BaseModel):
    final_odometer: float
    fuel_consumed: float

class TripResponse(BaseModel):
    id: int
    trip_id: str
    source: str
    destination: str
    vehicle_id: Optional[int]
    driver_id: Optional[int]
    cargo_weight: float
    planned_distance: float
    final_odometer: Optional[float]
    fuel_consumed: Optional[float]
    status: str
    eta: Optional[str]
    created_at: Optional[datetime]
    dispatched_at: Optional[datetime]
    completed_at: Optional[datetime]
    vehicle_name: Optional[str] = None
    driver_name: Optional[str] = None
    class Config:
        from_attributes = True


# ---- Maintenance ----
class MaintenanceCreate(BaseModel):
    vehicle_id: int
    description: str
    cost: float = 0
    date: str

class MaintenanceResponse(BaseModel):
    id: int
    vehicle_id: int
    vehicle_name: Optional[str] = None
    description: str
    cost: float
    date: str
    status: str
    class Config:
        from_attributes = True


# ---- Fuel Log ----
class FuelLogCreate(BaseModel):
    vehicle_id: int
    liters: float
    cost: float
    date: str

class FuelLogResponse(BaseModel):
    id: int
    vehicle_id: int
    vehicle_name: Optional[str] = None
    liters: float
    cost: float
    date: str
    class Config:
        from_attributes = True


# ---- Expense ----
class ExpenseCreate(BaseModel):
    trip_id: Optional[str] = None
    vehicle_id: int
    toll: float = 0
    other: float = 0
    date: str

class ExpenseResponse(BaseModel):
    id: int
    trip_id: Optional[str]
    vehicle_id: int
    vehicle_name: Optional[str] = None
    toll: float
    other: float
    date: str
    class Config:
        from_attributes = True


# ---- Settings ----
class SettingsUpdate(BaseModel):
    depot_name: Optional[str] = None
    currency: Optional[str] = None
    distance_unit: Optional[str] = None

class SettingsResponse(BaseModel):
    depot_name: str
    currency: str
    distance_unit: str
    class Config:
        from_attributes = True
