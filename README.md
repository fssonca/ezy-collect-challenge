# ezyCollect Monorepo

Docker-first monorepo:

- `server/`: Spring Boot 3 (Java 17, Flyway, MySQL, Testcontainers, OpenAPI)
- `client/`: Vite + React + TypeScript + Tailwind (served via Nginx in Docker)
- Root `docker-compose.yml`: runtime + tooling containers (no host Java/Maven required)

## 1. Quickstart (Setup + Run)

### Prereqs

- Docker + Docker Compose

### Configure environment

```bash
cp .env.example .env
```

Update secrets in `.env` (at minimum):

- `DB_PASSWORD`
- `MYSQL_ROOT_PASSWORD`
- `PAYMENTS_ENCRYPTION_KEY_B64`

### Run the app

```bash
docker compose up --build
```

Open:

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8080`
- Swagger UI: `http://localhost:8080/swagger-ui.html`

### Stop the app

```bash
make down
```

### Rebuild

```bash
make rebuild
```

Restart only one service:

```bash
docker compose restart server
docker compose restart client
```

Rebuild and restart only one service:

```bash
docker compose up --build -d server
docker compose up --build -d client
```

### Optional: Host debugging

Use this only for IDE debugging outside Docker.

- Host `./mvnw` requires Java 17 installed locally.
- When running backend on host: set `DB_HOST=localhost` (not `mysql`).

```bash
cd server
DB_HOST=localhost SPRING_PROFILES_ACTIVE=local ./mvnw spring-boot:run
```

## 2. App Overview

### Payments API

- Endpoint: `POST /payments`
- Required header: `Idempotency-Key` (required, non-empty, non-blank)
- Request fields:
  - `invoiceIds` (required, non-empty array)
  - `firstName`, `lastName`, `expiry`, `cvv`, `cardNumber`
- Responses:
  - `201 Created` first create: `{ id, status, createdAt }`
  - `200 OK` replay (same key + same payload): same body as original
  - `409 Conflict` mismatch (same key + different payload): `code=IDEMPOTENCY_KEY_REUSED`
  - `400 Bad Request` validation: `code=VALIDATION_ERROR` with `fieldErrors[]`
  - `400 Bad Request` missing/blank key: `code=MISSING_IDEMPOTENCY_KEY`

Security / data handling:

- API never returns `cardNumber`, `cvv`, or `expiry`
- `cardNumber` is encrypted at rest (AES-GCM); plaintext card number is not stored
- `cvv` is never persisted
- Idempotency records store request hash + safe response JSON only (`id`, `status`, `createdAt`)
- CORS is enabled for local frontend origins by default (`http://localhost:5173`, `http://127.0.0.1:5173`)

### Frontend UX

- Invoices dashboard with sortable table and multi-select
- Payment modal:
  - validation + accessible modal behavior (focus trap, initial focus, Escape)
  - submits to backend and handles `201/200/400/409`
  - retry for network failures without losing form values
- Receipt modal after success
- Paid invoices removed and totals recomputed

### Verification and tooling (Docker-first)

Backend tests (unit + integration via Testcontainers, Docker-only Maven):

```bash
make test
```

OpenAPI export to repository root (`openapi.yaml`), Docker-only:

```bash
make openapi
make openapi-check
```

## 3. AI-assisted Development Method

This project used a **spec-driven, incremental development** methodology with AI assistance: each prompt acted like a mini engineering spec with explicit scope, constraints, and acceptance criteria before implementation.

### How the workflow was applied

- **Start with non-negotiable constraints first** (Docker-first, no host Java/Maven, Testcontainers in Docker, single-command run). This forced the core architecture early (`server-tools` + Docker-in-Docker sidecar) and prevented later rework.
- **Implement in small, testable milestones** using scoped prompts, e.g. monorepo setup → payments API contract/validation → encryption-at-rest → idempotency → OpenAPI export → comprehensive backend tests → frontend flows/modals.
- **Define behavior through contracts and acceptance criteria** (response shapes, error codes, `201` vs `200` replay, `409` mismatch, no plaintext card storage). This made outputs measurable and reduced ambiguity.
- **Verification-driven iteration** after each AI-generated change: run the relevant commands (especially `docker compose up --build`, `make test`, `make openapi`), review the code, and adjust details to match the spec and production expectations.

In practice, AI was used as an implementation accelerator, while human review and Docker-based verification remained the source of truth for correctness.
