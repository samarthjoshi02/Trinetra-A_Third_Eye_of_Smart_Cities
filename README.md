# TRINETRA – The Third Eye of Smart Cities

> **Predict. Protect. Prosper.**

TRINETRA is a production-quality, futuristic, AI-powered Smart City Command & Control Operating System. The platform's visual identity blends the look of a **NASA Mission Control Center** with elements of **Indian Futuristic Design** to create a premium, high-impact civic dashboard for urban managers and citizens.

---

## 🌟 Visual Theme & Design Philosophy
*   **Deep Universe Color Scheme**: Black and deep navy backgrounds representing cyber space networks.
*   **Electric Neon HUD Elements**: Electric blue and cyan highlights for standard controls, glowing neon red alerts for emergency SOS signals, and neon green for resolved telemetry cases.
*   **Glassmorphism Console Panels**: Semi-transparent card overlays (`glass-card`) with high blurring filters and light-reflecting borders.
*   **Radar HUD GIS Mapping**: Leaflet maps styled with CartoDB Dark Matter tiles, utilizing pulsing, glow-shadowed radar markers instead of traditional pins.
*   **Responsive Telemetry Grid**: Designed to scale flawlessly from dual-monitor command desks to citizen mobile layouts.

---

## 🚀 Key Features

### 1. Unified Operational GIS Map
*   Pulsing red beacon markers representing active SOS crisis calls.
*   Orange blips mapping civic complaints (Pothole, garbage, leakages, etc.).
*   Detailed popup nodes permitting immediate click-through review.

### 2. Emergency SOS Deployment
*   Big glowing red distress trigger. Clicking activates a high-priority SOS alarm.
*   Locks GPS coordinates and broadcasts a crisis card to the administrator's queue.
*   Spawns an ascending ticking dispatch response timer to monitor dispatch latency.

### 3. AI Civic Issue Scanner
*   Drag-and-drop citizen complaint form.
*   Uploading photos triggers an animated laser scanner overlay (`scanner-bar`), simulating computer vision inference.
*   Automatically classifies issue type, calculates inference confidence (e.g. 96%), and routes priority levels.

### 4. Predictive Traffic Forecaster
*   Simulates grid conditions using drop-down parameters: Area, Hour, and Weather.
*   Calculates accident probability grades and suggests alternate routes to bypass congestions.

### 5. Recharts Command Analytics
*   Displays neat, responsive chart models including bar charts mapping category alerts, active SOS distributions, and roadway risk levels.

### 6. TRINETRA AI Chatbot Terminal
*   Floating natural language terminal linked directly to backend database collections.
*   Quick query suggestion buttons let directors ask:
    *   `Show unresolved complaints` -> lists pending complaints.
    *   `Show emergency hotspots` -> maps active crisis markers.
    *   `Display high congestion zones` -> reads forecasted road jams.
    *   `Show today's analytics` -> compiles general city health parameters.

---

## 🛠️ Tech Stack
*   **Frontend**: React.js, TypeScript, Tailwind CSS, Vite, Leaflet.js, Recharts, Lucide Icons.
*   **Backend**: FastAPI (Python), Uvicorn.
*   **Database**: Dual-engine storage wrapper (supports asynchronous MongoDB Motor driver, falling back automatically to an embedded, thread-safe JSON file database `db_storage.json` if no `MONGO_URI` is configured).

---

## 📦 Project Structure
```
d:/Trinetra/
├── backend/
│   ├── app/
│   │   ├── config.py              # Settings manager
│   │   ├── database.py            # Unified DB client (MongoDB + JSON fallback)
│   │   ├── models.py              # Pydantic validation schemas
│   │   ├── seed.py                # Smart City DB Seeder
│   │   ├── main.py                # FastAPI entry point & AI Chat Logic
│   │   ├── routers/
│   │   │   ├── auth.py            # JWT and bcrypt operations
│   │   │   ├── issues.py          # Civic issue routes
│   │   │   ├── emergencies.py     # SOS emergency routes
│   │   │   └── traffic.py         # Traffic updates
│   │   └── services/
│   │       ├── ai_service.py      # AI Scanner inference simulator
│   │       └── traffic_predictor.py
│   ├── requirements.txt
│   ├── .env.example
│   ├── .env
│   └── run.py                     # Backend server launcher
├── frontend/
│   ├── src/
│   │   ├── context/
│   │   │   └── AppContext.tsx     # Global React Context state provider
│   │   ├── components/
│   │   │   └── LiveCityMap.tsx    # Leaflet Dark Matter map wrapper
│   │   ├── pages/
│   │   │   ├── LandingPage.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   ├── CitizenPortal.tsx
│   │   │   └── AdminCommandCenter.tsx
│   │   ├── App.tsx                # Page Router definition
│   │   ├── index.css              # Custom neon styles
│   │   └── main.tsx
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── index.html
│   └── package.json
└── README.md
```

---

## 🏃 Run Instructions

### 1. Spin Up the FastAPI Command Engine
Ensure you have Python 3.8+ installed. Navigate to the backend directory and perform these steps:

```bash
cd backend

# Create virtual environment
python -m venv venv
# Activate virtual environment (Windows)
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the command engine
python run.py
```
The backend server will launch on **http://localhost:8000** and automatically seed the database with **45+ initial records** (20 civic issues, 10 emergencies, 15 traffic logs, system alerts, and default credentials) if it's the first boot.

### 2. Spin Up the React Front-End
Navigate to the frontend directory:

```bash
cd frontend

# Install Node packages
npm install

# Start the Vite developer hot-reload server
npm run dev
```
Open **http://localhost:5173** (or the port specified by Vite) in your web browser.

---

## 🔑 Demonstration Credentials
Log into the portal using these preset secure credentials:

*   **Municipal Director Dashboard**:
    *   **Email**: `admin@trinetra.gov.in`
    *   **Password**: `admin123`
    *   **Role Selection**: `ADMIN`
*   **Civic Citizen Dashboard**:
    *   **Email**: `citizen@trinetra.gov.in`
    *   **Password**: `citizen123`
    *   **Role Selection**: `CITIZEN`
