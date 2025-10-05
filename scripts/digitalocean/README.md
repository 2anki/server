# DigitalOcean PostgreSQL Migration

Modern TypeScript-based database migration scripts for migrating from baremetal to DigitalOcean PostgreSQL.

## Structure

```
digitalocean/
├── Makefile              # Build and run commands
├── migrate.ts           # Main migration orchestrator
├── types.ts             # TypeScript type definitions
├── logger.ts            # Colorful console logging
├── config.ts            # Environment and connection configuration
├── connection-test.ts   # Database connectivity testing
├── dump.ts              # Database dump creation
├── restore.ts           # Database restoration
├── verify.ts            # Post-migration verification
├── cleanup.ts           # Temporary file cleanup
└── prompt.ts            # Interactive user confirmation
```

## Usage

### Quick Start
```bash
# Navigate to the digitalocean directory
cd scripts/digitalocean

# Run the complete migration
make migrate
```

### Environment Variables
Set these before running:
```bash
export DATABASE_URL="postgresql://user:pass@source-host:5432/dbname"
export DO_POSTGRES_USER="your_do_username"
export DO_POSTGRES_PASSWORD="your_do_password"
export DO_POSTGRES_HOST="your-cluster.db.ondigitalocean.com"
export DO_POSTGRES_PORT="25060"
export DO_POSTGRES_DATABASE="defaultdb"
export DO_POSTGRES_SSLMODE="require"
```

### Available Commands
- `make migrate` - Complete migration process
- `make test` - Test database connections only
- `make validate` - Validate environment variables
- `make clean` - Clean up temporary files
- `make help` - Show available commands

## Features

- ✅ **Modern TypeScript** with `--experimental-strip-types`
- ✅ **Modular Architecture** - Split into focused, reusable modules
- ✅ **Type Safety** - Full TypeScript type checking
- ✅ **Security Focused** - No credential logging, secure file permissions
- ✅ **Interactive** - Confirmation prompts before destructive operations
- ✅ **Comprehensive Verification** - Post-migration data validation
- ✅ **Clean Error Handling** - Sanitized error messages
- ✅ **Easy to Extend** - Add new features by creating new modules

## Security

- Database credentials are never logged
- Dump files created with restrictive permissions (600)
- Connection strings are sanitized in logs
- All sensitive data comes from environment variables
- Error messages don't expose connection details