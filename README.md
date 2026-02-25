# ezyCollect Monorepo

Docker-first production-ready monorepo with:

- `server/` Spring Boot 3 (Java 17, Maven Wrapper, Flyway, MySQL)
- `client/` Vite + React + TypeScript + Tailwind
- Root `docker-compose.yml` for app runtime and backend tooling/tests

## 1. Docker-first workflow (recommended)

Local Java and Maven are **not required** for normal development workflows.

### Start the full stack

```bash
docker compose up --build
```

Services:

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8080`
- MySQL: `localhost:3306`

### Run backend tests (including Testcontainers integration tests)

```bash
make test
```

This runs:

```bash
docker compose --profile tools run --rm server-tools ./mvnw test
```

The `server-tools` container includes Maven + JDK 17 and connects to the `docker-daemon` sidecar for Testcontainers. No host Java or Maven is required.

### Payments API (current phase)

Endpoint:

- `POST /payments`

Required header:

- `Idempotency-Key` (required, non-empty, non-blank)

Request JSON fields:

- `firstName`, `lastName`, `expiry`, `cvv`, `cardNumber`

Current response contract:

- Success: `201 Created` with `{ "id": "<uuid>", "status": "CREATED", "createdAt": "<ISO-8601>" }`
- Validation errors: `400` with `code=VALIDATION_ERROR` and `fieldErrors[]`
- Missing/blank idempotency key: `400` with `code=MISSING_IDEMPOTENCY_KEY`

Security note (current phase):

- API responses do **not** return `cardNumber`, `cvv`, or `expiry`
- Backend currently persists only non-sensitive payment fields plus optional `cardLast4`
- Encryption-at-rest and idempotency persistence are intentionally deferred to a later phase

### Other Docker commands

```bash
make backend-run
make rebuild
make down
```

### Restart only one app (server or client)

Restart without rebuilding:

```bash
docker compose restart server
docker compose restart client
```

Rebuild + restart only one service after code changes:

```bash
docker compose up --build -d server
docker compose up --build -d client
```

Notes:

- `server` depends on `mysql` (Compose keeps `mysql` running and healthy)
- `client` serves built static files via Nginx, so use `--build` after frontend code changes

## 2. Optional host debugging workflow

Use this only if you want IDE-based debugging outside Docker.

- `./mvnw` on the host is optional and **requires Java 17** installed locally.
- When running the backend on the host, set `DB_HOST=localhost` (not `mysql`), because `mysql` is only resolvable inside Docker Compose networking.

Example:

```bash
cd server
DB_HOST=localhost SPRING_PROFILES_ACTIVE=local ./mvnw spring-boot:run
```

## Environment setup

1. Copy `.env.example` to `.env`
2. Update secrets (`DB_PASSWORD`, `MYSQL_ROOT_PASSWORD`, `PAYMENTS_ENCRYPTION_KEY_B64`)

Important defaults for Docker:

- `DB_HOST=mysql` (container-to-container)
- Do not use `localhost` inside containers

## Notes

- Backend DB configuration is environment-driven (no hardcoded credentials)
- Flyway migrations run on backend startup
- Frontend API base URL is configured via `VITE_API_BASE_URL` build arg (default `http://localhost:8080`)
- `make test` remains the required verification path for backend changes (Docker-first Maven/Testcontainers workflow)
