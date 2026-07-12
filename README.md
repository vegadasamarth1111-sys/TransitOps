# TransitOps 🚚

TransitOps is a comprehensive Fleet Management System designed and built for the Odoo Hackathon 2026. It streamlines the management of vehicles, drivers, trips, maintenance, and operational expenses in a single unified platform.

## 🛠 Tech Stack

- **Backend:** Django, Django REST Framework (DRF), MySQL, JWT Authentication
- **Frontend:** React (Vite), Axios, Recharts, React Router

## ✨ Key Features

- **Vehicle Management:** Track vehicle status (Available, On Trip, In Shop, Retired), load capacity, odometer readings, and operational costs.
- **Driver Management:** Monitor driver availability, safety scores, and license expiry dates.
- **Trip Dispatching:** Robust dispatch system that prevents double-booking, verifies load capacities, and updates statuses dynamically.
- **Maintenance Logging:** Automated vehicle status updates when a vehicle enters or leaves the shop.
- **Fuel & Expense Tracking:** Log fuel consumption and other expenses to compute ROI and operational costs.
- **Dashboard & Reporting:** Visual KPIs and charts using Recharts, with CSV export capabilities.

## 🚀 Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- MySQL Server

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv .venv
   # On Windows use: .venv\Scripts\activate
   # On macOS/Linux use: source .venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure your MySQL database settings in `backend/transitops/settings.py` (ensure you have a `.env` file if required).
5. Run migrations:
   ```bash
   python manage.py migrate
   ```
6. Create a superuser (optional):
   ```bash
   python manage.py createsuperuser
   ```
7. Start the development server:
   ```bash
   python manage.py runserver
   ```

### Frontend Setup

1. Navigate to the project root (where `package.json` is located):
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```

## 🛡️ Business Rules Enforced

TransitOps enforces strict business logic on the backend to ensure data integrity:
- **Capacity Validation:** Trips cannot be dispatched if cargo weight exceeds vehicle capacity.
- **Driver Validation:** Suspended drivers or those with expired licenses cannot be assigned to trips.
- **Status Integrity:** Dispatching a trip automatically updates the status of both the vehicle and the driver to "On Trip". Completing or cancelling the trip restores their availability.
- **Maintenance Integration:** Creating an active maintenance record automatically removes the vehicle from the available pool.

## 📄 License

This project was developed for the Odoo Hackathon 2026.
