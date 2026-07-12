# TransitOps Project Setup Guide

This guide provides step-by-step instructions on how to set up and run the TransitOps application locally on your machine.

## Prerequisites
Before you begin, ensure you have the following installed on your system:
- **Python 3.8+** (for the backend)
- **Node.js 18+** & **npm** (for the frontend)

---

## 1. Backend Setup (FastAPI)

The backend is built with Python and FastAPI. It uses SQLite for the database.

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **(Optional but recommended) Create and activate a virtual environment:**
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```

3. **Install the dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Seed the database with demo data (Optional):**
   This script populates the database with demo users, vehicles, drivers, trips, and logs.
   ```bash
   python seed.py
   ```

5. **Start the backend server:**
   ```bash
   python main.py
   ```
   *The backend API will now be running at: `http://localhost:8000`*
   *You can view the interactive API documentation at: `http://localhost:8000/docs`*

---

## 2. Frontend Setup (React + Vite)

The frontend is built with React and Vite.

1. **Open a new terminal window** and navigate to the project root directory.

2. **Install the dependencies:**
   ```bash
   npm install
   ```

3. **Start the frontend development server:**
   ```bash
   npm run dev
   ```
   *The frontend application will typically run at: `http://localhost:5173` (check the terminal output for the exact local URL).*

---

## 3. Accessing the Application

1. Open your web browser and go to `http://localhost:5173` (or the URL provided by Vite).
2. You will be greeted by the Login screen.
3. If you ran the `seed.py` script, you can log in with the following demo credentials:
   - **Email:** `laksh12@gmail.com`
   - **Password:** `password123`

You're all set! Enjoy exploring the TransitOps dashboard.
