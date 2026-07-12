from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="Dispatcher")  # Fleet Manager / Dispatcher / Safety Officer / Financial Analyst
    initials = Column(String, default="")
    created_at = Column(DateTime, default=datetime.utcnow)


class Vehicle(Base):
    __tablename__ = "vehicles"
    id = Column(Integer, primary_key=True, index=True)
    registration_number = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    type = Column(String, default="Van")  # Truck, Van, Mini, Bike
    max_load_capacity = Column(Float, default=0)
    odometer = Column(Float, default=0)
    acquisition_cost = Column(Float, default=0)
    status = Column(String, default="Available")  # Available / On Trip / In Shop / Retired
    region = Column(String, default="Gujarat")
    created_at = Column(DateTime, default=datetime.utcnow)


class Driver(Base):
    __tablename__ = "drivers"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    license_number = Column(String, unique=True, nullable=False)
    license_category = Column(String, default="LMV")
    license_expiry_date = Column(String, nullable=False)
    contact_number = Column(String, default="")
    safety_score = Column(Integer, default=100)
    trip_completion = Column(Integer, default=100)
    status = Column(String, default="Available")  # Available / On Trip / Off Duty / Suspended
    created_at = Column(DateTime, default=datetime.utcnow)


class Trip(Base):
    __tablename__ = "trips"
    id = Column(Integer, primary_key=True, index=True)
    trip_id = Column(String, unique=True, index=True)  # TR001, TR002, etc.
    source = Column(String, nullable=False)
    destination = Column(String, nullable=False)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=True)
    driver_id = Column(Integer, ForeignKey("drivers.id"), nullable=True)
    cargo_weight = Column(Float, default=0)
    planned_distance = Column(Float, default=0)
    final_odometer = Column(Float, nullable=True)
    fuel_consumed = Column(Float, nullable=True)
    status = Column(String, default="Draft")  # Draft / Dispatched / Completed / Cancelled
    eta = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    dispatched_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)

    vehicle = relationship("Vehicle", foreign_keys=[vehicle_id])
    driver = relationship("Driver", foreign_keys=[driver_id])


class MaintenanceLog(Base):
    __tablename__ = "maintenance_logs"
    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=False)
    description = Column(String, nullable=False)
    cost = Column(Float, default=0)
    date = Column(String, nullable=False)
    status = Column(String, default="Active")  # Active / Closed

    vehicle = relationship("Vehicle", foreign_keys=[vehicle_id])


class FuelLog(Base):
    __tablename__ = "fuel_logs"
    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=False)
    liters = Column(Float, default=0)
    cost = Column(Float, default=0)
    date = Column(String, nullable=False)

    vehicle = relationship("Vehicle", foreign_keys=[vehicle_id])


class Expense(Base):
    __tablename__ = "expenses"
    id = Column(Integer, primary_key=True, index=True)
    trip_id = Column(String, nullable=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=False)
    toll = Column(Float, default=0)
    other = Column(Float, default=0)
    date = Column(String, nullable=False)

    vehicle = relationship("Vehicle", foreign_keys=[vehicle_id])


class Settings(Base):
    __tablename__ = "settings"
    id = Column(Integer, primary_key=True, index=True)
    depot_name = Column(String, default="Gandhinagar Depot GJ4")
    currency = Column(String, default="INR (₹)")
    distance_unit = Column(String, default="Kilometers")
