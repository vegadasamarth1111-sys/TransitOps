"""
TransitOps — FastAPI Backend
All endpoints for auth, vehicles, drivers, trips, maintenance, fuel, expenses, dashboard, settings.
Business rules enforced in service functions.
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import datetime, date
from typing import List, Optional
from pydantic import BaseModel
import csv
import io
from fastapi.responses import StreamingResponse

from database import engine, get_db, Base
from models import User, Vehicle, Driver, Trip, MaintenanceLog, FuelLog, Expense, Settings
from schemas import (
    UserCreate, UserLogin, UserResponse, TokenResponse,
    VehicleCreate, VehicleUpdate, VehicleResponse,
    DriverCreate, DriverUpdate, DriverResponse,
    TripCreate, TripComplete, TripResponse,
    MaintenanceCreate, MaintenanceResponse,
    FuelLogCreate, FuelLogResponse,
    ExpenseCreate, ExpenseResponse,
    SettingsUpdate, SettingsResponse,
)
from auth import hash_password, verify_password, create_access_token, get_current_user

# Create tables
Base.metadata.create_all(bind=engine)


@asynccontextmanager
async def lifespan(app: FastAPI):
    seed_database()
    yield


app = FastAPI(title="TransitOps API", version="1.0.0", lifespan=lifespan)

# CORS — allow frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
#  SEED DATA — runs on startup
# ============================================================
def seed_database():
    db = next(get_db())
    # Only seed if no users exist
    if db.query(User).count() > 0:
        return

    # Seed users
    users = [
        User(name="Raven K.", email="raven.k@transitops.in", hashed_password=hash_password("admin123"), role="Dispatcher", initials="RK"),
        User(name="Arjun S.", email="arjun@transitops.in", hashed_password=hash_password("admin123"), role="Fleet Manager", initials="AS"),
        User(name="Meera P.", email="meera@transitops.in", hashed_password=hash_password("admin123"), role="Safety Officer", initials="MP"),
        User(name="Kavya R.", email="kavya@transitops.in", hashed_password=hash_password("admin123"), role="Financial Analyst", initials="KR"),
    ]
    db.add_all(users)
    db.flush()

    # Seed vehicles
    vehicles = [
        Vehicle(registration_number="GJ01AB4521", name="VAN-05", type="Van", max_load_capacity=500, odometer=74000, acquisition_cost=620000, status="Available", region="Gujarat"),
        Vehicle(registration_number="GJ01AB9981", name="TRUCK-11", type="Truck", max_load_capacity=5000, odometer=182000, acquisition_cost=2450000, status="On Trip", region="Gujarat"),
        Vehicle(registration_number="GJ01AB1120", name="MINI-03", type="Mini", max_load_capacity=1000, odometer=66000, acquisition_cost=410000, status="In Shop", region="Gujarat"),
        Vehicle(registration_number="GJ01AB0081", name="VAN-04", type="Van", max_load_capacity=750, odometer=241900, acquisition_cost=590000, status="Retired", region="Gujarat"),
        Vehicle(registration_number="MH02CD3345", name="TRUCK-07", type="Truck", max_load_capacity=8000, odometer=310000, acquisition_cost=3200000, status="Available", region="Maharashtra"),
        Vehicle(registration_number="RJ14EF7890", name="VAN-09", type="Van", max_load_capacity=600, odometer=98000, acquisition_cost=680000, status="Available", region="Rajasthan"),
        Vehicle(registration_number="GJ05GH1234", name="BIKE-01", type="Bike", max_load_capacity=50, odometer=23000, acquisition_cost=95000, status="Available", region="Gujarat"),
        Vehicle(registration_number="MH04IJ5678", name="TRUCK-14", type="Truck", max_load_capacity=10000, odometer=450000, acquisition_cost=4100000, status="On Trip", region="Maharashtra"),
    ]
    db.add_all(vehicles)
    db.flush()

    # Seed drivers
    drivers = [
        Driver(name="Alex", license_number="DL-88213", license_category="LMV", license_expiry_date="2028-12-15", contact_number="98765xxxxx", safety_score=96, trip_completion=96, status="Available"),
        Driver(name="John", license_number="DL-44120", license_category="HMV", license_expiry_date="2025-03-10", contact_number="98220xxxxx", safety_score=81, trip_completion=81, status="Suspended"),
        Driver(name="Priya", license_number="DL-77031", license_category="LMV", license_expiry_date="2027-08-20", contact_number="99110xxxxx", safety_score=99, trip_completion=99, status="On Trip"),
        Driver(name="Suresh", license_number="DL-90045", license_category="HMV", license_expiry_date="2027-01-05", contact_number="97440xxxxx", safety_score=88, trip_completion=88, status="Available"),
        Driver(name="Deepak", license_number="DL-55201", license_category="HMV", license_expiry_date="2028-06-30", contact_number="93320xxxxx", safety_score=92, trip_completion=92, status="Off Duty"),
        Driver(name="Ramesh", license_number="DL-33089", license_category="LMV", license_expiry_date="2026-11-20", contact_number="98810xxxxx", safety_score=85, trip_completion=85, status="Available"),
    ]
    db.add_all(drivers)
    db.flush()

    # Seed trips
    trips = [
        Trip(trip_id="TR001", source="Gandhinagar Depot", destination="Ahmedabad Hub", vehicle_id=1, driver_id=1, cargo_weight=450, planned_distance=35, status="Dispatched", eta="45 min", dispatched_at=datetime(2026, 7, 5, 8, 15)),
        Trip(trip_id="TR002", source="Surat Warehouse", destination="Vadodara Depot", vehicle_id=2, driver_id=3, cargo_weight=3200, planned_distance=160, final_odometer=182160, fuel_consumed=28, status="Completed", dispatched_at=datetime(2026, 7, 4, 6, 30), completed_at=datetime(2026, 7, 4, 10, 0)),
        Trip(trip_id="TR003", source="Rajkot Hub", destination="Jamnagar Port", vehicle_id=5, driver_id=4, cargo_weight=4500, planned_distance=95, status="Dispatched", eta="1h 10m", dispatched_at=datetime(2026, 7, 5, 9, 20)),
        Trip(trip_id="TR004", source="Vatva Industrial Area", destination="Sanand Warehouse", cargo_weight=800, planned_distance=25, status="Draft"),
        Trip(trip_id="TR005", source="Ahmedabad Central", destination="Gandhinagar Tech Park", vehicle_id=8, driver_id=6, cargo_weight=200, planned_distance=28, status="Dispatched", eta="30 min", dispatched_at=datetime(2026, 7, 5, 7, 45)),
        Trip(trip_id="TR006", source="Mansa", destination="Kalol Depot", cargo_weight=300, planned_distance=40, status="Cancelled"),
    ]
    db.add_all(trips)
    db.flush()

    # Seed maintenance
    maint = [
        MaintenanceLog(vehicle_id=1, description="Oil Change", cost=2500, date="2026-07-07", status="Active"),
        MaintenanceLog(vehicle_id=2, description="Engine Repair", cost=18000, date="2026-07-03", status="Closed"),
        MaintenanceLog(vehicle_id=3, description="Tyre Replace", cost=6200, date="2026-07-06", status="Active"),
    ]
    db.add_all(maint)

    # Seed fuel logs
    fuel = [
        FuelLog(vehicle_id=1, liters=42, cost=3150, date="2026-07-05"),
        FuelLog(vehicle_id=2, liters=110, cost=8400, date="2026-07-06"),
        FuelLog(vehicle_id=3, liters=28, cost=2050, date="2026-07-06"),
        FuelLog(vehicle_id=5, liters=95, cost=7125, date="2026-07-05"),
    ]
    db.add_all(fuel)

    # Seed expenses
    expenses = [
        Expense(trip_id="TR001", vehicle_id=1, toll=120, other=0, date="2026-07-05"),
        Expense(trip_id="TR002", vehicle_id=2, toll=340, other=150, date="2026-07-04"),
        Expense(trip_id="TR003", vehicle_id=5, toll=180, other=75, date="2026-07-05"),
    ]
    db.add_all(expenses)

    # Seed settings
    db.add(Settings(depot_name="Gandhinagar Depot GJ4", currency="INR (₹)", distance_unit="Kilometers"))

    db.commit()
    print("Database seeded successfully!")


# ============================================================
#  AUTH ROUTES
# ============================================================
@app.post("/api/auth/signup", response_model=TokenResponse)
def signup(data: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered.")
    initials = "".join([w[0].upper() for w in data.name.split()[:2]]) if data.name else "U"
    user = User(
        name=data.name,
        email=data.email,
        hashed_password=hash_password(data.password),
        role=data.role,
        initials=initials,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    token = create_access_token({"sub": user.id})
    return TokenResponse(access_token=token, user=UserResponse.model_validate(user))


@app.post("/api/auth/login", response_model=TokenResponse)
def login(data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials.")
    token = create_access_token({"sub": user.id})
    return TokenResponse(access_token=token, user=UserResponse.model_validate(user))


@app.get("/api/auth/me", response_model=UserResponse)
def get_me(user: User = Depends(get_current_user)):
    return UserResponse.model_validate(user)


# ============================================================
#  VEHICLE ROUTES
# ============================================================
@app.get("/api/vehicles", response_model=List[VehicleResponse])
def list_vehicles(status: Optional[str] = None, type: Optional[str] = None, region: Optional[str] = None, db: Session = Depends(get_db)):
    q = db.query(Vehicle)
    if status:
        q = q.filter(Vehicle.status == status)
    if type:
        q = q.filter(Vehicle.type == type)
    if region:
        q = q.filter(Vehicle.region == region)
    return [VehicleResponse.model_validate(v) for v in q.all()]


@app.get("/api/vehicles/available", response_model=List[VehicleResponse])
def available_vehicles(db: Session = Depends(get_db)):
    return [VehicleResponse.model_validate(v) for v in db.query(Vehicle).filter(Vehicle.status == "Available").all()]


@app.post("/api/vehicles", response_model=VehicleResponse)
def create_vehicle(data: VehicleCreate, db: Session = Depends(get_db)):
    if db.query(Vehicle).filter(Vehicle.registration_number == data.registration_number).first():
        raise HTTPException(status_code=400, detail="Registration number must be unique.")
    vehicle = Vehicle(**data.model_dump())
    db.add(vehicle)
    db.commit()
    db.refresh(vehicle)
    return VehicleResponse.model_validate(vehicle)


@app.patch("/api/vehicles/{vehicle_id}", response_model=VehicleResponse)
def update_vehicle(vehicle_id: int, data: VehicleUpdate, db: Session = Depends(get_db)):
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found.")
    updates = data.model_dump(exclude_unset=True)
    if "registration_number" in updates:
        dup = db.query(Vehicle).filter(Vehicle.registration_number == updates["registration_number"], Vehicle.id != vehicle_id).first()
        if dup:
            raise HTTPException(status_code=400, detail="Registration number must be unique.")
    for k, v in updates.items():
        setattr(vehicle, k, v)
    db.commit()
    db.refresh(vehicle)
    return VehicleResponse.model_validate(vehicle)


@app.get("/api/vehicles/{vehicle_id}/summary")
def vehicle_summary(vehicle_id: int, db: Session = Depends(get_db)):
    fuel_cost = sum(f.cost for f in db.query(FuelLog).filter(FuelLog.vehicle_id == vehicle_id).all())
    maint_cost = sum(m.cost for m in db.query(MaintenanceLog).filter(MaintenanceLog.vehicle_id == vehicle_id).all())
    exp_cost = sum((e.toll or 0) + (e.other or 0) for e in db.query(Expense).filter(Expense.vehicle_id == vehicle_id).all())
    return {"fuel_cost": fuel_cost, "maint_cost": maint_cost, "expense_cost": exp_cost, "total_cost": fuel_cost + maint_cost + exp_cost}


# ============================================================
#  DRIVER ROUTES
# ============================================================
@app.get("/api/drivers", response_model=List[DriverResponse])
def list_drivers(db: Session = Depends(get_db)):
    return [DriverResponse.model_validate(d) for d in db.query(Driver).all()]


@app.get("/api/drivers/available", response_model=List[DriverResponse])
def available_drivers(db: Session = Depends(get_db)):
    today = date.today().isoformat()
    drivers = db.query(Driver).filter(Driver.status == "Available", Driver.license_expiry_date >= today).all()
    return [DriverResponse.model_validate(d) for d in drivers]


@app.post("/api/drivers", response_model=DriverResponse)
def create_driver(data: DriverCreate, db: Session = Depends(get_db)):
    if db.query(Driver).filter(Driver.license_number == data.license_number).first():
        raise HTTPException(status_code=400, detail="License number must be unique.")
    driver = Driver(**data.model_dump())
    db.add(driver)
    db.commit()
    db.refresh(driver)
    return DriverResponse.model_validate(driver)


@app.patch("/api/drivers/{driver_id}", response_model=DriverResponse)
def update_driver(driver_id: int, data: DriverUpdate, db: Session = Depends(get_db)):
    driver = db.query(Driver).filter(Driver.id == driver_id).first()
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found.")
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(driver, k, v)
    db.commit()
    db.refresh(driver)
    return DriverResponse.model_validate(driver)


# ============================================================
#  TRIP ROUTES (with business rules)
# ============================================================
trip_counter = [7]  # mutable counter

@app.get("/api/trips", response_model=List[TripResponse])
def list_trips(db: Session = Depends(get_db)):
    trips = db.query(Trip).all()
    result = []
    for t in trips:
        tr = TripResponse.model_validate(t)
        tr.vehicle_name = t.vehicle.name if t.vehicle else None
        tr.driver_name = t.driver.name if t.driver else None
        result.append(tr)
    return result


@app.post("/api/trips", response_model=TripResponse)
def create_trip(data: TripCreate, db: Session = Depends(get_db)):
    max_trip = db.query(Trip).order_by(Trip.id.desc()).first()
    current_count = 0
    if max_trip and max_trip.trip_id and max_trip.trip_id.startswith("TR"):
        try:
            current_count = int(max_trip.trip_id[2:])
        except ValueError:
            pass
    tid = f"TR{str(current_count + 1).zfill(3)}"
    trip = Trip(
        trip_id=tid,
        source=data.source,
        destination=data.destination,
        vehicle_id=data.vehicle_id,
        driver_id=data.driver_id,
        cargo_weight=data.cargo_weight,
        planned_distance=data.planned_distance,
        status="Draft",
    )
    db.add(trip)
    db.commit()
    db.refresh(trip)
    tr = TripResponse.model_validate(trip)
    tr.vehicle_name = trip.vehicle.name if trip.vehicle else None
    tr.driver_name = trip.driver.name if trip.driver else None
    return tr


class DispatchPayload(BaseModel):
    vehicle_id: Optional[int] = None
    driver_id: Optional[int] = None

@app.post("/api/trips/{trip_id}/dispatch", response_model=TripResponse)
def dispatch_trip(trip_id: str, payload: Optional[DispatchPayload] = None, db: Session = Depends(get_db)):
    trip = db.query(Trip).filter(Trip.trip_id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found.")
    if trip.status != "Draft":
        raise HTTPException(status_code=400, detail="Only Draft trips can be dispatched.")
    
    if payload:
        if payload.vehicle_id: trip.vehicle_id = payload.vehicle_id
        if payload.driver_id: trip.driver_id = payload.driver_id

    if not trip.vehicle_id or not trip.driver_id:
        raise HTTPException(status_code=400, detail="Vehicle and Driver must be assigned.")

    vehicle = db.query(Vehicle).filter(Vehicle.id == trip.vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=400, detail="Vehicle not found.")
    if vehicle.status != "Available":
        raise HTTPException(status_code=400, detail=f"Vehicle {vehicle.name} is not available (status: {vehicle.status}).")

    driver = db.query(Driver).filter(Driver.id == trip.driver_id).first()
    if not driver:
        raise HTTPException(status_code=400, detail="Driver not found.")
    if driver.status == "Suspended":
        raise HTTPException(status_code=400, detail=f"Driver {driver.name} is suspended.")
    if driver.status != "Available":
        raise HTTPException(status_code=400, detail=f"Driver {driver.name} is not available (status: {driver.status}).")
    if driver.license_expiry_date < date.today().isoformat():
        raise HTTPException(status_code=400, detail=f"Driver {driver.name}'s license has expired ({driver.license_expiry_date}).")

    if trip.cargo_weight > vehicle.max_load_capacity:
        exceeded = trip.cargo_weight - vehicle.max_load_capacity
        raise HTTPException(status_code=400, detail=f"Cargo weight ({trip.cargo_weight} kg) exceeds vehicle capacity ({vehicle.max_load_capacity} kg). Exceeded by {exceeded} kg.")

    # All checks passed
    trip.status = "Dispatched"
    trip.dispatched_at = datetime.utcnow()
    trip.eta = f"{round(trip.planned_distance / 0.8)} min"
    vehicle.status = "On Trip"
    driver.status = "On Trip"
    db.commit()
    db.refresh(trip)
    tr = TripResponse.model_validate(trip)
    tr.vehicle_name = vehicle.name
    tr.driver_name = driver.name
    return tr


@app.post("/api/trips/{trip_id}/complete", response_model=TripResponse)
def complete_trip(trip_id: str, data: TripComplete, db: Session = Depends(get_db)):
    trip = db.query(Trip).filter(Trip.trip_id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found.")
    if trip.status != "Dispatched":
        raise HTTPException(status_code=400, detail="Only Dispatched trips can be completed.")

    trip.status = "Completed"
    trip.completed_at = datetime.utcnow()
    trip.final_odometer = data.final_odometer
    trip.fuel_consumed = data.fuel_consumed
    trip.eta = None

    if trip.vehicle_id:
        vehicle = db.query(Vehicle).filter(Vehicle.id == trip.vehicle_id).first()
        if vehicle:
            vehicle.status = "Available"
            vehicle.odometer = data.final_odometer
    if trip.driver_id:
        driver = db.query(Driver).filter(Driver.id == trip.driver_id).first()
        if driver:
            driver.status = "Available"

    db.commit()
    db.refresh(trip)
    tr = TripResponse.model_validate(trip)
    tr.vehicle_name = trip.vehicle.name if trip.vehicle else None
    tr.driver_name = trip.driver.name if trip.driver else None
    return tr


@app.post("/api/trips/{trip_id}/cancel", response_model=TripResponse)
def cancel_trip(trip_id: str, db: Session = Depends(get_db)):
    trip = db.query(Trip).filter(Trip.trip_id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found.")
    if trip.status != "Dispatched":
        raise HTTPException(status_code=400, detail="Only Dispatched trips can be cancelled.")

    trip.status = "Cancelled"
    trip.eta = None
    if trip.vehicle_id:
        vehicle = db.query(Vehicle).filter(Vehicle.id == trip.vehicle_id).first()
        if vehicle:
            vehicle.status = "Available"
    if trip.driver_id:
        driver = db.query(Driver).filter(Driver.id == trip.driver_id).first()
        if driver:
            driver.status = "Available"

    db.commit()
    db.refresh(trip)
    tr = TripResponse.model_validate(trip)
    tr.vehicle_name = trip.vehicle.name if trip.vehicle else None
    tr.driver_name = trip.driver.name if trip.driver else None
    return tr


# ============================================================
#  MAINTENANCE ROUTES
# ============================================================
@app.get("/api/maintenance", response_model=List[MaintenanceResponse])
def list_maintenance(db: Session = Depends(get_db)):
    logs = db.query(MaintenanceLog).all()
    result = []
    for m in logs:
        mr = MaintenanceResponse.model_validate(m)
        mr.vehicle_name = m.vehicle.name if m.vehicle else None
        result.append(mr)
    return result


@app.post("/api/maintenance", response_model=MaintenanceResponse)
def create_maintenance(data: MaintenanceCreate, db: Session = Depends(get_db)):
    vehicle = db.query(Vehicle).filter(Vehicle.id == data.vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found.")
    log = MaintenanceLog(**data.model_dump(), status="Active")
    db.add(log)
    vehicle.status = "In Shop"
    db.commit()
    db.refresh(log)
    mr = MaintenanceResponse.model_validate(log)
    mr.vehicle_name = vehicle.name
    return mr


@app.post("/api/maintenance/{log_id}/close", response_model=MaintenanceResponse)
def close_maintenance(log_id: int, db: Session = Depends(get_db)):
    log = db.query(MaintenanceLog).filter(MaintenanceLog.id == log_id).first()
    if not log:
        raise HTTPException(status_code=404, detail="Maintenance log not found.")
    if log.status != "Active":
        raise HTTPException(status_code=400, detail="Only Active logs can be closed.")
    log.status = "Closed"
    vehicle = db.query(Vehicle).filter(Vehicle.id == log.vehicle_id).first()
    if vehicle and vehicle.status != "Retired":
        vehicle.status = "Available"
    db.commit()
    db.refresh(log)
    mr = MaintenanceResponse.model_validate(log)
    mr.vehicle_name = vehicle.name if vehicle else None
    return mr


# ============================================================
#  FUEL LOG ROUTES
# ============================================================
@app.get("/api/fuel-logs", response_model=List[FuelLogResponse])
def list_fuel_logs(db: Session = Depends(get_db)):
    logs = db.query(FuelLog).all()
    result = []
    for f in logs:
        fr = FuelLogResponse.model_validate(f)
        fr.vehicle_name = f.vehicle.name if f.vehicle else None
        result.append(fr)
    return result


@app.post("/api/fuel-logs", response_model=FuelLogResponse)
def create_fuel_log(data: FuelLogCreate, db: Session = Depends(get_db)):
    vehicle = db.query(Vehicle).filter(Vehicle.id == data.vehicle_id).first()
    log = FuelLog(**data.model_dump())
    db.add(log)
    db.commit()
    db.refresh(log)
    fr = FuelLogResponse.model_validate(log)
    fr.vehicle_name = vehicle.name if vehicle else None
    return fr


# ============================================================
#  EXPENSE ROUTES
# ============================================================
@app.get("/api/expenses", response_model=List[ExpenseResponse])
def list_expenses(db: Session = Depends(get_db)):
    exps = db.query(Expense).all()
    result = []
    for e in exps:
        er = ExpenseResponse.model_validate(e)
        er.vehicle_name = e.vehicle.name if e.vehicle else None
        result.append(er)
    return result


@app.post("/api/expenses", response_model=ExpenseResponse)
def create_expense(data: ExpenseCreate, db: Session = Depends(get_db)):
    vehicle = db.query(Vehicle).filter(Vehicle.id == data.vehicle_id).first()
    exp = Expense(**data.model_dump())
    db.add(exp)
    db.commit()
    db.refresh(exp)
    er = ExpenseResponse.model_validate(exp)
    er.vehicle_name = vehicle.name if vehicle else None
    return er


# ============================================================
#  DASHBOARD
# ============================================================
@app.get("/api/dashboard")
def get_dashboard(db: Session = Depends(get_db)):
    vehicles = db.query(Vehicle).all()
    drivers = db.query(Driver).all()
    trips = db.query(Trip).all()

    non_retired = [v for v in vehicles if v.status != "Retired"]
    on_trip = [v for v in vehicles if v.status == "On Trip"]

    return {
        "active_vehicles": len(non_retired),
        "available_vehicles": len([v for v in vehicles if v.status == "Available"]),
        "in_maintenance": len([v for v in vehicles if v.status == "In Shop"]),
        "active_trips": len([t for t in trips if t.status == "Dispatched"]),
        "pending_trips": len([t for t in trips if t.status == "Draft"]),
        "drivers_on_duty": len([d for d in drivers if d.status == "On Trip"]),
        "fleet_utilization": round((len(on_trip) / max(len(non_retired), 1)) * 100),
    }


# ============================================================
#  ANALYTICS
# ============================================================
@app.get("/api/analytics")
def get_analytics(db: Session = Depends(get_db)):
    fuel_logs = db.query(FuelLog).all()
    maint_logs = db.query(MaintenanceLog).all()
    vehicles = db.query(Vehicle).all()
    trips = db.query(Trip).all()

    total_fuel_cost = sum(f.cost for f in fuel_logs)
    total_maint_cost = sum(m.cost for m in maint_logs)
    op_cost = total_fuel_cost + total_maint_cost

    completed = [t for t in trips if t.status == "Completed"]
    total_dist = sum(t.planned_distance or 0 for t in completed)
    total_fuel = sum(t.fuel_consumed or 0 for t in completed)
    efficiency = round(total_dist / max(total_fuel, 1), 1)

    non_retired = [v for v in vehicles if v.status != "Retired"]
    on_trip = [v for v in vehicles if v.status == "On Trip"]
    utilization = round((len(on_trip) / max(len(non_retired), 1)) * 100)

    total_acq = sum(v.acquisition_cost for v in vehicles)
    roi = round(((total_acq * 0.3 - op_cost) / max(total_acq, 1)) * 100, 1) if total_acq > 0 else 0

    return {
        "fuel_efficiency": f"{efficiency} km/l",
        "fleet_utilization": f"{utilization}%",
        "operational_cost": f"{op_cost:,.0f}",
        "vehicle_roi": f"{roi}%",
    }


# ============================================================
#  SETTINGS
# ============================================================
@app.get("/api/settings", response_model=SettingsResponse)
def get_settings(db: Session = Depends(get_db)):
    s = db.query(Settings).first()
    if not s:
        s = Settings()
        db.add(s)
        db.commit()
        db.refresh(s)
    return SettingsResponse.model_validate(s)


@app.patch("/api/settings", response_model=SettingsResponse)
def update_settings(data: SettingsUpdate, db: Session = Depends(get_db)):
    s = db.query(Settings).first()
    if not s:
        s = Settings()
        db.add(s)
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(s, k, v)
    db.commit()
    db.refresh(s)
    return SettingsResponse.model_validate(s)


# ============================================================
#  CSV EXPORT
# ============================================================
@app.get("/api/reports/export")
def export_csv(format: str = "csv", type: str = "vehicles", db: Session = Depends(get_db)):
    output = io.StringIO()
    writer = csv.writer(output)

    if type == "vehicles":
        writer.writerow(["Reg No", "Name", "Type", "Capacity", "Odometer", "Acq Cost", "Status", "Region"])
        for v in db.query(Vehicle).all():
            writer.writerow([v.registration_number, v.name, v.type, v.max_load_capacity, v.odometer, v.acquisition_cost, v.status, v.region])
    elif type == "trips":
        writer.writerow(["Trip ID", "Source", "Destination", "Cargo Weight", "Distance", "Status"])
        for t in db.query(Trip).all():
            writer.writerow([t.trip_id, t.source, t.destination, t.cargo_weight, t.planned_distance, t.status])
    elif type == "drivers":
        writer.writerow(["Name", "License No", "Category", "Expiry", "Safety Score", "Status"])
        for d in db.query(Driver).all():
            writer.writerow([d.name, d.license_number, d.license_category, d.license_expiry_date, d.safety_score, d.status])

    output.seek(0)
    return StreamingResponse(
        output,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={type}_export.csv"},
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
