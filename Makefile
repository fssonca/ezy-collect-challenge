COMPOSE := docker compose

.PHONY: test backend-run down rebuild openapi openapi-check

test:
	$(COMPOSE) --profile tools run --rm server-tools ./mvnw test

openapi:
	$(COMPOSE) up --build -d mysql server
	$(COMPOSE) --profile tools run --rm --no-deps openapi-export sh /workspace/scripts/export-openapi.sh /workspace/openapi.yaml

openapi-check:
	docker run --rm -v "$(CURDIR):/workspace" alpine:3.20 sh /workspace/scripts/check-openapi.sh /workspace/openapi.yaml

backend-run:
	$(COMPOSE) up --build mysql server

down:
	$(COMPOSE) down -v

rebuild:
	$(COMPOSE) build --no-cache
