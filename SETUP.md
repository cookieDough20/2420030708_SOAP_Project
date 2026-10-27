# Setup & Run Guide

This walks through running the entire platform locally from a clean machine,
in the order things actually need to start. If you just cloned this repo,
start here.

## 1. Prerequisites

| Tool | Version | Check with |
|---|---|---|
| JDK | **25** (the poms pin `java.version=25`) | `java -version` |
| Node.js | 20+ | `node -v` |
| Python | 3.10 – 3.12 recommended (see note below) | `python --version` |
| Docker Desktop (optional but recommended) | any recent | `docker --version` |
| PostgreSQL 14+ (only if *not* using Docker) | — | `psql --version` |

You do **not** need Maven installed separately — every backend service ships
its own Maven wrapper (`mvnw` / `mvnw.cmd`).

> **Python version note:** `fastapi-ai-service/requirements.txt` uses
> minimum-version pins (`numpy>=1.26.4`, etc.) so pip can resolve wheels for
> whatever Python you have. Python 3.13/3.14 work fine now. If you're on an
> unusually new Python and a package tries to compile from source instead of
> using a prebuilt wheel, install won't finish — switch to Python 3.11 or
> 3.12 and it will use a full-wheel install path (a few seconds instead of
> minutes).

## 2. Get the database running

The 9 backend services expect **7 separate PostgreSQL databases** on the same
Postgres instance: `food_auth`, `food_donor`, `food_ngo`, `food_logistics`,
`food_notification`, `food_impact`, `food_ai`. Missing even one of these is
the single most common reason a service "randomly" fails to start.

### Option A — Docker (recommended, creates all 7 DBs automatically)

```bash
docker compose up -d
```

This starts Postgres on `localhost:5432` with user `postgres` / password
`root` (matching the defaults every service already expects) and creates all
7 databases the first time the container's data volume is initialized. Check
it's healthy with:

```bash
docker compose ps
```

### Option B — A PostgreSQL install you already have

Connect with `psql -U postgres` (or any client) and run:

```sql
CREATE DATABASE food_auth;
CREATE DATABASE food_donor;
CREATE DATABASE food_ngo;
CREATE DATABASE food_logistics;
CREATE DATABASE food_notification;
CREATE DATABASE food_impact;
CREATE DATABASE food_ai;
```

If your Postgres user/password isn't `postgres`/`root`, set `DB_USERNAME` and
`DB_PASSWORD` environment variables before starting each backend service —
every `application.properties` reads `${DB_USERNAME:postgres}` /
`${DB_PASSWORD:root}`, so this overrides the default without editing any
file.

## 3. Start the backend services — **order matters**

Each service is its own Maven project under `backend/`. Open a terminal per
service (or use a process manager) and run:

```bash
./mvnw spring-boot:run        # macOS / Linux / Git Bash
```
```powershell
.\mvnw.cmd spring-boot:run     # Windows PowerShell / cmd
```

Start them in this order:

1. **`eureka-server`** first, always. Everything else registers with it.
   Wait until you see `Started EurekaServerApplication` (a couple of
   seconds), then confirm the dashboard loads at
   `http://localhost:8761`.
2. **`api-gateway`** next.
3. The remaining 6 business services, in any order:
   `auth-service`, `donor-service`, `ngo-service`, `logistics-service`,
   `notification-service`, `impact-service`.
4. **`ai-orchestrator`** last (it calls the FastAPI service, which should be
   up by the time you use the app — see step 4).

You don't have to wait for one to fully finish before starting the next
(except eureka-server) — Eureka clients retry registration — but starting
eureka first avoids a burst of noisy connection-refused warnings in every
other service's logs.

**Sanity check:** after a minute or two, `http://localhost:8761` should list
all 8 registered applications (API-GATEWAY, AUTH-SERVICE, DONOR-SERVICE,
NGO-SERVICE, LOGISTICS-SERVICE, NOTIFICATION-SERVICE, IMPACT-SERVICE,
AI-ORCHESTRATOR).

## 4. Start the AI service

```bash
cd fastapi-ai-service
python -m venv venv

# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

**Do not reuse a `venv/` folder copied from someone else's machine** — it
hard-codes absolute paths to their Python install and will not run on yours.
Always create your own with the commands above (this repo's `.gitignore`
already excludes `venv/` so this isn't an issue once you clone fresh).

There's no separate training step needed: on first startup, if
`model/trained_model.pkl` is missing or can't be loaded (e.g. because it was
trained with a different scikit-learn version), the service automatically
trains a fresh baseline model on synthetic data and saves it. You'll see this
in the logs:

```
No pre-trained model found. Training baseline model...
Model saved to model/trained_model.pkl
```

Confirm it's up: `http://localhost:8000/health` should return
`{"status":"healthy", ...}`, and `http://localhost:8000/docs` gives you an
interactive Swagger UI to try `/predict` directly.

## 5. Start the frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. It talks to the API Gateway at
`http://localhost:8080` by default (`frontend/.env` /
`VITE_API_BASE_URL`; see `frontend/.env.example`).

## 6. Try it out

1. Register an account (pick a role: Donor, NGO, Logistics, or Volunteer) via
   the frontend's sign-up page.
2. Log in.
3. As a Donor, create a donation. This triggers the AI orchestrator, which
   scores the donation's urgency, recommends an NGO, and automatically
   creates a delivery — you should see it appear under Logistics.

## Troubleshooting

**A service crashes immediately on startup with a Postgres connection
error.** You skipped or missed a database in step 2 — double check all 7
exist (`\l` in `psql`, or check `docker compose logs postgres`).

**`eureka-server`'s dashboard is empty / services aren't registering.**
Make sure `eureka-server` was started *before* the other services, and give
it 30–60 seconds — Eureka clients register on a heartbeat, not instantly.

**Donations never get an NGO/AI recommendation.** Make sure
`fastapi-ai-service` (port 8000) and `ai-orchestrator` (port 8087) are both
running — the orchestrator calls FastAPI synchronously and silently logs
(rather than surfaces) failures in the downstream NGO-allocation/delivery
steps, so a missing service there fails quietly. Check the ai-orchestrator
console log for `Failed to orchestrate downstream actions`.

**`pip install -r requirements.txt` hangs or fails while building numpy from
source.** You're likely on a very new Python version without a prebuilt
wheel yet. Install Python 3.11 or 3.12 alongside your current version and
create the venv with that instead (`py -3.12 -m venv venv` on Windows).

**Frontend shows "Unable to connect to the server."** The API Gateway
(`:8080`) isn't running, or CORS/base URL is misconfigured — check
`frontend/.env`.

**Port already in use.** Something else on your machine is using one of the
ports in the [README's port table](README.md#services--ports). Stop it, or
override `server.port` for that service (env var `SERVER_PORT=...` also
works out of the box via Spring Boot).

**JDK version mismatch / build fails with "release version 25 not
supported".** Install JDK 25 (e.g. [Eclipse Temurin
25](https://adoptium.net/)) — the backend poms currently target Java 25
specifically.
