# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Emergency Event Tracking (EET) is a dual-stack application for tracking and reporting emergency displacement events. It consists of:

1. **React Frontend** (TypeScript + Vite): A form-based web application for submitting emergency event reports including population movements
2. **FastAPI Backend** (Python): REST API for storing and retrieving emergency event data

The application tracks emergency events (displacement, return, relocation) with geographic movement data, priority needs, and narrative summaries.

## Repository Structure

```
EET/
├── frontend/           # React + Vite frontend application
│   ├── components/     # React components
│   ├── App.tsx         # Main application component
│   ├── types.ts        # TypeScript type definitions
│   ├── constants.ts    # Application constants
│   ├── index.tsx       # Application entry point
│   ├── index.html      # HTML template
│   ├── package.json    # Node dependencies
│   ├── vite.config.ts  # Vite configuration
│   └── tsconfig.json   # TypeScript configuration
├── backend/            # FastAPI backend application
│   ├── main.py         # FastAPI application
│   ├── pixi.toml       # Pixi project configuration
│   └── pixi.lock       # Pixi lock file
└── CLAUDE.md           # This file
```

## Development Commands

### Initial Setup

1. **Frontend Setup:**
```bash
cd frontend

# Copy environment template and configure
cp .env.local.example .env.local
# Edit .env.local and set API_URL (defaults to http://localhost:8000)

# Install dependencies
npm install
```

2. **Backend Setup:**
```bash
cd backend

# Install dependencies via pixi
pixi install
```

### Running the Application

**Start Backend (Terminal 1):**
```bash
cd backend
pixi run uvicorn main:app --reload
# Server will run on http://localhost:8000
```

**Start Frontend (Terminal 2):**
```bash
cd frontend
npm run dev
# App will run on http://localhost:5173 (or next available port)
```

### Other Commands

**Frontend:**
```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

**Backend:**
```bash
# Run with specific host/port
pixi run uvicorn main:app --host 0.0.0.0 --port 8000
```

## Architecture

### Frontend Structure (frontend/)

- **App.tsx**: Main application component containing form logic, validation, submission, and export (JSON/CSV)
- **types.ts**: TypeScript interfaces for `EventData`, `Movement`, `Coordinates`
- **constants.ts**: Form options (countries, event types, triggers) and initial state
- **components/**:
  - `Header.tsx`: Application header
  - `Input.tsx`: Reusable form input component
  - `Select.tsx`: Reusable dropdown component
  - `MovementPairCard.tsx`: Movement entry component with location selectors
  - `MapModal.tsx`: Interactive Leaflet map for selecting coordinates

### Backend Structure (backend/)

- **main.py**: FastAPI application with three endpoints:
  - `POST /submit-event`: Create new emergency event
  - `GET /events`: List all events (with optional filters: country, start_date, end_date)
  - `GET /events/{event_id}`: Retrieve specific event by ID
- **In-memory storage**: Uses dictionary for event storage (no database)

### Data Flow

1. User fills out form in React app with event details and movements
2. Each movement requires selecting origin/destination coordinates via interactive map
3. Form validation ensures all required fields are complete and dates are valid
4. On submit, data is POSTed to FastAPI backend (URL configured via `API_URL` env variable)
5. Backend validates the data with Pydantic models and creates unique ID for event
6. Backend stores event in memory and returns the created event
7. Users can also export data locally as JSON or CSV without submitting

### Key Technical Details

- **Map Integration**: Uses Leaflet.js (loaded via CDN in frontend/index.html) with OpenStreetMap tiles
- **Geocoding**: frontend/components/MapModal.tsx uses Nominatim API to center map on selected country
- **H3 Geospatial**: Frontend includes h3-js library (imported but usage not yet implemented in current code)
- **Gemini API**: Vite config loads `GEMINI_API_KEY` from `frontend/.env.local` (feature not yet integrated)
- **API Configuration**: Frontend uses `API_URL` environment variable (defaults to http://localhost:8000)
- **CORS**: Backend configured with CORS middleware to allow frontend requests (currently allows all origins)
- **Path Alias**: Both TypeScript and Vite use `@/*` alias pointing to frontend root
- **Strict TypeScript**: Enabled with noUnusedLocals, noUnusedParameters, strict mode

### State Management

Frontend uses React hooks (useState, useCallback, useRef) with controlled components. No external state management library. Key state:
- `formData`: Main event data including movements array
- `errors`: Validation error messages keyed by field name
- `isMapOpen`: Controls map modal visibility
- `mapSelectionCallbackRef`: Stores callback for map coordinate selection

### Validation Rules

- Country, email, event dates, event type, trigger, narrative summary, and all 3 priority needs are required
- Event start/end dates cannot be in the future
- Event end date cannot be before start date
- Each movement requires origin location, destination location, and individuals count > 0
- Email must match basic email regex pattern

## Common Workflows

### Adding New Form Fields

1. Update `EventData` interface in frontend/types.ts
2. Add field to `INITIAL_EVENT_DATA` in frontend/constants.ts
3. Add input/select component in frontend/App.tsx within appropriate Section
4. Add validation logic in `validateForm()` function in frontend/App.tsx
5. Update `EmergencyEvent` and `EmergencyEventCreate` models in backend/main.py

### Testing API Integration

1. Ensure both frontend and backend are running (see "Running the Application" above)
2. Frontend is configured via `frontend/.env.local` with `API_URL` environment variable
3. For local development, `API_URL` should be `http://localhost:8000` (this is the default)
4. For production, update `API_URL` to your deployed backend URL
5. The backend CORS configuration currently allows all origins (`allow_origins=["*"]`). For production, restrict this to your frontend domain in `backend/main.py`

### Deployment

The repository includes Azure Static Web Apps workflow files in `.github/workflows/` for automated deployment.
