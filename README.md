# Emergency Event Tracking (EET)

A dual-stack application for tracking and reporting emergency displacement events.

## Prerequisites

Before you begin, ensure you have the following installed on your system:

### For Frontend
- **Node.js** (v18 or higher) - [Download Node.js](https://nodejs.org/)
  - Verify installation: `node --version`
  - npm comes bundled with Node.js

### For Backend
- **Pixi** - Python package manager - [Install Pixi](https://pixi.sh/)
  - Install on macOS/Linux: `curl -fsSL https://pixi.sh/install.sh | bash`
  - Install on Windows: `iwr -useb https://pixi.sh/install.ps1 | iex`
  - Verify installation: `pixi --version`
  - Note: Pixi will automatically manage Python 3.13+ for you

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd EET
```

### 2. Install Frontend

```bash
# Navigate to frontend directory
cd frontend

# Copy environment template
cp .env.local.example .env.local

# Install dependencies
npm install

# Return to root directory
cd ..
```

**Frontend Configuration:** Edit `frontend/.env.local` if you need to change the API URL (defaults to `http://localhost:8000`)

### 3. Install Backend

```bash
# Navigate to backend directory
cd backend

# Install Python dependencies via Pixi
# This will automatically set up Python 3.13+ and all required packages
pixi install

# Return to root directory
cd ..
```

**Backend Configuration:** No configuration required for local development. The backend will run on `http://localhost:8000` by default.

## Running the Application

You need to run both the backend and frontend servers simultaneously. Use two terminal windows/tabs:

### Terminal 1: Start the Backend

```bash
cd backend
pixi run uvicorn main:app --reload
```

You should see output like:
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

### Terminal 2: Start the Frontend

```bash
cd frontend
npm run dev
```

You should see output like:
```
  VITE v6.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### Access the Application

Open your browser and navigate to `http://localhost:5173`

The frontend will communicate with the backend API at `http://localhost:8000`

## Environment Configuration

### Frontend (`frontend/.env.local`)

```env
API_URL=http://localhost:8000  # Backend API URL
GEMINI_API_KEY=your_key_here   # Optional: for future AI features
```

### Backend

No environment variables required for basic operation. See `backend/.env.example` for future configuration options.

## Additional Commands

### Frontend

```bash
cd frontend

# Build for production
npm run build

# Preview production build
npm run preview

# Run linting (if configured)
npm run lint
```

### Backend

```bash
cd backend

# Run with custom host/port
pixi run uvicorn main:app --host 0.0.0.0 --port 8000

# Run without auto-reload (for production)
pixi run uvicorn main:app

# Access Python shell in pixi environment
pixi shell
```

## Troubleshooting

### Frontend Issues

**Port 5173 already in use:**
```bash
# Vite will automatically use the next available port (5174, 5175, etc.)
# Or specify a custom port:
npm run dev -- --port 3000
```

**Cannot connect to backend:**
- Ensure the backend is running on `http://localhost:8000`
- Check that `frontend/.env.local` has the correct `API_URL`
- Check browser console for CORS errors

### Backend Issues

**Pixi command not found:**
- Make sure you've installed Pixi and restarted your terminal
- Add Pixi to your PATH: `export PATH="$HOME/.pixi/bin:$PATH"`

**Port 8000 already in use:**
```bash
# Run on a different port
pixi run uvicorn main:app --port 8001

# Update frontend/.env.local to match:
# API_URL=http://localhost:8001
```

**Module not found errors:**
```bash
# Reinstall dependencies
cd backend
pixi install --force
```

## Project Structure

- `frontend/` - React + TypeScript + Vite application
- `backend/` - FastAPI Python application
- See [CLAUDE.md](CLAUDE.md) for detailed architecture documentation

## Deployment

This repository includes Azure Static Web Apps workflow files in `.github/workflows/` for automated deployment.

## Contributing

For detailed development guidelines and architecture information, see [CLAUDE.md](CLAUDE.md).
