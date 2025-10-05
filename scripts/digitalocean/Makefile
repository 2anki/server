# DigitalOcean Database Migration Makefile

# Load nvm and use LTS Node.js
SHELL := /bin/bash
NODE_CMD := export NVM_DIR="$$HOME/.nvm" && [ -s "$$NVM_DIR/nvm.sh" ] && \. "$$NVM_DIR/nvm.sh" && nvm use --lts > /dev/null && node --experimental-strip-types

# Default target
.PHONY: help
help:
	@echo "Available commands:"
	@echo "  make migrate    - Run the database migration to DigitalOcean"
	@echo "  make test       - Test database connections only"
	@echo "  make validate   - Validate environment variables"
	@echo "  make clean      - Clean up temporary files"

# Run the complete migration
.PHONY: migrate
migrate:
	@echo "🚀 Starting DigitalOcean PostgreSQL Migration..."
	@$(NODE_CMD) migrate.ts

# Test connections only
.PHONY: test
test:
	@echo "🔍 Testing database connections..."
	@$(NODE_CMD) -e "import('./config.ts').then(m => m.validateEnvironment()); import('./connection-test.ts').then(m => m.testConnections());"

# Clean temporary files
.PHONY: clean
clean:
	@echo "🧹 Cleaning up temporary files..."
	@rm -rf ../../tmp/migration_dump_*.sql
	@echo "✅ Cleanup complete"

# Validate environment variables
.PHONY: validate
validate:
	@echo "✅ Validating environment variables..."
	@$(NODE_CMD) -e "import('./config.ts').then(m => m.validateEnvironment());"