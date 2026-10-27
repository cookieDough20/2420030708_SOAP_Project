# Smart Food Donation & Redistribution Platform

A full-stack microservices platform that connects food donors (restaurants, events,
individuals) with NGOs and volunteers, using an AI prediction engine to score
donation urgency and recommend the best-fit NGO for redistribution.

- **Frontend**: React 19 + Vite SPA
- **Backend**: 8 Spring Boot 4 microservices behind an API Gateway, registered with Eureka
- **AI Engine**: A standalone FastAPI + scikit-learn prediction service

For a deep dive into the architecture, component responsibilities, and data flow, see
[PROJECT_DOCUMENTATION.md](PROJECT_DOCUMENTATION.md).

## Quick start

**New to this repo? Start with [SETUP.md](SETUP.md)** — it's a complete, step-by-step
guide to getting every piece running locally, including database setup and a
troubleshooting section for the most common failure points.

The short version:

```bash
# 1. Start Postgres (creates all 7 service databases automatically)
docker compose up -d

# 2. Backend — from backend/eureka-server, then backend/api-gateway, then the
#    rest, each in its own terminal:
./mvnw spring-boot:run          # macOS/Linux
mvnw.cmd spring-boot:run        # Windows

# 3. AI service
cd fastapi-ai-service
python -m venv venv && venv\Scripts\activate   # Windows
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# 4. Frontend
cd frontend
npm install
npm run dev
```

Then open the frontend at `http://localhost:5173`.

## Services & ports

| Service              | Port | Notes                                  |
|-----------------------|------|-----------------------------------------|
| eureka-server          | 8761 | Service registry — start this first     |
| api-gateway             | 8080 | Single entry point for the frontend     |
| auth-service            | 8081 | Login/register, JWT issuing             |
| donor-service           | 8082 | Donations + donor profiles              |
| ngo-service             | 8083 | NGO profiles                            |
| logistics-service       | 8084 | Deliveries + logistics partners         |
| notification-service    | 8085 | Notifications                           |
| impact-service          | 8086 | Impact metrics                          |
| ai-orchestrator         | 8087 | Bridges Spring Boot ↔ FastAPI           |
| fastapi-ai-service      | 8000 | ML predictions, image analysis          |
| frontend (vite dev)     | 5173 | React SPA                               |
| PostgreSQL              | 5432 | 7 databases, one per service            |

## Repository layout

```
backend/                 9 Spring Boot microservices (Maven, Java)
fastapi-ai-service/       Python FastAPI ML service
frontend/                 React + Vite SPA
infra/postgres-init/      DB init scripts used by docker-compose.yml
docker-compose.yml        Local Postgres with all 7 databases pre-created
SETUP.md                  Full step-by-step run guide + troubleshooting
PROJECT_DOCUMENTATION.md  Architecture & data-flow reference
```

## Known limitations

- **Auth is not enforced downstream of the gateway.** `auth-service` issues JWTs and
  the frontend attaches them to every request, but no service (including the
  gateway) currently validates the token — every backend endpoint is reachable
  without a token if called directly. This doesn't block normal use through the
  UI, but don't treat this as a secured deployment as-is.
- CORS is wide open (`*`) at the gateway for local development convenience.

## Team Members

- Anahita Bhalme
- Hitheshini Kola
- Mihika Chowdary
