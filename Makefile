COMPOSE := docker compose

.PHONY: test backend-run down rebuild

test:
	$(COMPOSE) --profile tools run --rm server-tools ./mvnw test

backend-run:
	$(COMPOSE) up --build mysql server

down:
	$(COMPOSE) down -v

rebuild:
	$(COMPOSE) build --no-cache

