# DigiEqub

DigiEqub is a digital Equb (ROSCA) platform with a React frontend and FastAPI backend. This repository already contains broad feature coverage for authentication, groups, transactions, notifications, admin workflows, and credit scoring, and is being aligned toward a more production-ready architecture.

## Stack

- Frontend: React 18, Vite, React Router, TanStack Query, MUI, Framer Motion
- Backend: FastAPI, Pydantic settings, service-layer architecture, JWT auth
- Data and infra target: MongoDB, Redis, Celery, Web3 integrations

## Current Structure

```text
digitequb/
├── frontend/        # React app, pages, hooks, contexts, services
├── backend/         # FastAPI app, api routers, services, models, tests
└── docker-compose.yml
```

## Frontend Highlights

- Auth, dashboard, groups, transactions, profile, notifications, settings, admin pages
- Protected routing and page-level suspense loading
- Contexts for auth, theme, UI, notifications, and websocket support
- React Query and service modules for API integration

## Backend Highlights

- Versioned API under `/api/v1`
- Platform metadata and health endpoints:
  - `/`
  - `/api/v1/health`
  - `/api/v1/platform`
- Route groups for auth, users, groups, transactions, notifications, and admin
- Configurable CORS, trusted hosts, and startup bootstrapping

## Local Development

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## Docker

You can run the app stack with:

```bash
docker compose up --build
```

This starts:

- Frontend on `http://localhost:5173`
- Backend on `http://localhost:8000`
- Redis on `localhost:6379`

## API Docs

When the backend is running:

- Swagger UI: `http://localhost:8000/api/docs`
- ReDoc: `http://localhost:8000/api/redoc`
- OpenAPI JSON: `http://localhost:8000/api/v1/openapi.json`

## Delivery Status

The repository is not yet a fully completed production deployment of every item in the large DigiEqub specification, but it now has:

- A stronger frontend route shell
- A real unauthorized page
- Platform metadata and health endpoints in FastAPI
- Docker scaffolding for frontend/backend startup
- Updated root documentation

## Recommended Next Iterations

1. Normalize backend persistence fully around MongoDB models and Motor.
2. Connect remaining frontend screens from mock/demo data to live backend endpoints.
3. Add CI, environment validation, and end-to-end tests.
4. Finish deployment hardening for Redis/Celery, file storage, and blockchain services.
