# Makefile for Simple Pixel Docker operations

.PHONY: help build up down logs restart clean shell

help:
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

build:
	docker compose build

up:
	docker compose up -d
	@echo "Simple Pixel is running (check .env for PORT)"

down:
	docker compose down

logs:
	docker compose logs -f

restart:
	docker compose restart

clean:
	docker compose down -v
	docker rmi simplepixel_simplepixel 2>/dev/null || true

shell:
	docker compose exec simplepixel sh

stats:
	docker stats simplepixel

ps:
	docker compose ps

rebuild:
	docker compose down
	docker compose build --no-cache
	docker compose up -d

backup-db:
	@mkdir -p backups
	docker cp simplepixel:/app/data/simplepixel.db backups/simplepixel-$(shell date +%Y%m%d-%H%M%S).db
	@echo "Database backed up to backups/"

restore-db:
	@if [ -z "$(FILE)" ]; then echo "Usage: make restore-db FILE=backup.db"; exit 1; fi
	docker cp $(FILE) simplepixel:/app/data/simplepixel.db
	docker compose restart
	@echo "Database restored from $(FILE)"
