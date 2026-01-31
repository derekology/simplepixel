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
	@echo "Simple Pixel is running at http://localhost:3000"

down:
	docker compose down

logs:
	docker compose logs -f

restart:
	docker compose restart

clean:
	docker compose down -v
	docker rmi simple-pixel_simple-pixel 2>/dev/null || true

shell:
	docker compose exec simple-pixel sh

stats:
	docker stats simple-pixel

ps:
	docker compose ps

rebuild:
	docker compose down
	docker compose build --no-cache
	docker compose up -d

backup-db:
	@mkdir -p backups
	docker cp simple-pixel:/app/data/simple-pixel.db backups/simple-pixel-$(shell date +%Y%m%d-%H%M%S).db
	@echo "Database backed up to backups/"

restore-db:
	@if [ -z "$(FILE)" ]; then echo "Usage: make restore-db FILE=backup.db"; exit 1; fi
	docker cp $(FILE) simple-pixel:/app/data/simple-pixel.db
	docker compose restart
	@echo "Database restored from $(FILE)"
