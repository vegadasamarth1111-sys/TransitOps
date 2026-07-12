import random
from datetime import datetime, timedelta
import bcrypt
from database import SessionLocal, engine
from models import Base, User, Vehicle, Driver, Trip, MaintenanceLog, FuelLog, Expense
import auth

Base.metadata.create_all(bind=engine)

def clear_db(db):
    db.query(Expense).delete()
    db.query(FuelLog).delete()
    db.query(MaintenanceLog).delete()
    db.query(Trip).delete()
    db.query(Driver).delete()
    db.query(Vehicle).delete()
    # Don't delete all users, just keep the schema clean for demo.
    # Actually, we can delete the non-laksh users or just leave them.
    db.commit()

def generate_random_date(start_days_ago, end_days_ago):
    start_date = datetime.now() - timedelta(days=start_days_ago)
    end_date = datetime.now() - timedelta(days=end_days_ago)
    time_between_dates = end_date - start_date
    days_between_dates = time_between_dates.days
    random_number_of_days = random.randrange(days_between_dates or 1)
    return start_date + timedelta(days=random_number_of_days)

def seed():
    db = SessionLocal()
    
    # 1. User
    laksh = db.query(User).filter(User.email == "laksh12@gmail.com").first()
    if not laksh:
        laksh = User(
            name="Laksh",
            email="laksh12@gmail.com",
            hashed_password=auth.hash_password("password123"),
            role="Dispatcher",
            initials="L"
        )
        db.add(laksh)
        db.commit()
    
    clear_db(db)

    # 2. Vehicles
    vehicles = []
    types = ["Truck", "Van", "Mini", "Bike"]
    statuses = ["Available", "On Trip", "In Shop", "Retired"]
    regions = ["Gujarat", "Maharashtra", "Rajasthan", "Delhi", "Karnataka"]
    for i in range(1, 16):
        v = Vehicle(
            registration_number=f"MH {random.randint(10, 99)} AB {random.randint(1000, 9999)}",
            name=f"Fleet-{random.choice(types)}-0{i}",
            type=random.choice(types),
            max_load_capacity=random.choice([500, 1000, 5000, 10000]),
            odometer=random.randint(10000, 150000),
            acquisition_cost=random.randint(500000, 2500000),
            status=random.choices(statuses, weights=[60, 20, 10, 10])[0],
            region=random.choice(regions)
        )
        db.add(v)
        vehicles.append(v)
    db.commit()

    # 3. Drivers
    drivers = []
    names = ["Rahul Sharma", "Amit Patel", "Suresh Kumar", "Vikram Singh", "Pooja Verma", "Ramesh Yadav", "Sunil Joshi", "Ajay Dev", "Karan Gupta", "Deepak Rao", "Sanjay Dutt", "Vijay Kumar", "Ravi Teja", "Anil Kapoor", "Nitin Das"]
    for i in range(15):
        d = Driver(
            name=names[i],
            license_number=f"DL-{random.randint(10000, 99999)}",
            license_category=random.choice(["LMV", "HMV"]),
            license_expiry_date=(datetime.now() + timedelta(days=random.randint(30, 1500))).strftime("%Y-%m-%d"),
            contact_number=f"98{random.randint(10000000, 99999999)}",
            safety_score=random.randint(70, 100),
            trip_completion=random.randint(85, 100),
            status=random.choices(["Available", "On Trip", "Off Duty", "Suspended"], weights=[50, 30, 15, 5])[0]
        )
        db.add(d)
        drivers.append(d)
    db.commit()

    # 4. Trips
    trip_statuses = ["Draft", "Dispatched", "Completed", "Cancelled"]
    cities = ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Ahmedabad", "Chennai", "Kolkata", "Surat", "Pune", "Jaipur"]
    for i in range(1, 51):
        status = random.choices(trip_statuses, weights=[10, 20, 60, 10])[0]
        t = Trip(
            trip_id=f"TR{str(i).zfill(3)}",
            source=random.choice(cities),
            destination=random.choice(cities),
            vehicle_id=random.choice(vehicles).id if status != "Draft" else None,
            driver_id=random.choice(drivers).id if status != "Draft" else None,
            cargo_weight=random.randint(100, 5000),
            planned_distance=random.randint(50, 1500),
            status=status,
            created_at=generate_random_date(180, 0),
        )
        if status == "Completed":
            t.final_odometer = t.planned_distance + random.randint(-10, 50)
            t.fuel_consumed = t.planned_distance / random.uniform(4, 15)
        db.add(t)
    db.commit()

    # 5. Fuel & Maintenance & Expenses
    for _ in range(50):
        v = random.choice(vehicles)
        date = generate_random_date(180, 0).strftime("%Y-%m-%d")
        
        # Fuel
        f = FuelLog(
            vehicle_id=v.id,
            liters=random.uniform(20, 150),
            cost=random.uniform(2000, 15000),
            date=date
        )
        db.add(f)
        
        # Maintenance
        if random.random() < 0.3:
            m = MaintenanceLog(
                vehicle_id=v.id,
                description=random.choice(["Oil Change", "Brake Pad Replacement", "Tire Rotation", "Engine Tune-up", "AC Repair"]),
                cost=random.uniform(1000, 25000),
                date=date,
                status=random.choice(["Active", "Closed"])
            )
            db.add(m)
            
        # Expenses
        if random.random() < 0.5:
            e = Expense(
                vehicle_id=v.id,
                toll=random.uniform(100, 2000),
                other=random.uniform(0, 1000),
                date=date
            )
            db.add(e)
            
    db.commit()
    db.close()
    print("Database seeded successfully with Demo data!")

if __name__ == "__main__":
    seed()
