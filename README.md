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

### OpenAPI / Swagger

When the backend is running:

- Swagger UI: `http://localhost:8080/swagger-ui.html`
- OpenAPI JSON: `http://localhost:8080/v3/api-docs`
- OpenAPI YAML: `http://localhost:8080/v3/api-docs.yaml`

Generate/update the repository root OpenAPI file (`openapi.yaml`) using Docker-only tooling:

```bash
make openapi
```

Optional check (non-empty + contains `/payments` and `Idempotency-Key`):

```bash
make openapi-check
```

### Payments API (current phase)

Endpoint:

- `POST /payments`

Required header:

- `Idempotency-Key` (required, non-empty, non-blank)

Request JSON fields:

- `firstName`, `lastName`, `expiry`, `cvv`, `cardNumber`

Current response contract:

- Success: `201 Created` with `{ "id": "<uuid>", "status": "CREATED", "createdAt": "<ISO-8601>" }`
- Idempotent replay (same `Idempotency-Key` + same payload): `200 OK` with the same body as the original create
- Idempotency mismatch (same `Idempotency-Key` + different payload): `409 Conflict` with `code=IDEMPOTENCY_KEY_REUSED`
- Validation errors: `400` with `code=VALIDATION_ERROR` and `fieldErrors[]`
- Missing/blank idempotency key: `400` with `code=MISSING_IDEMPOTENCY_KEY`

Security notes:

- API responses do **not** return `cardNumber`, `cvv`, or `expiry`
- `cardNumber` is encrypted at rest (AES-GCM); plaintext card number is not stored
- `cvv` is never persisted
- Idempotency records store only a request hash and safe response JSON (`id`, `status`, `createdAt`)

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
