#!/usr/bin/env node

// Load environment variables from project root .env file
import { config } from 'dotenv';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

// Load .env from project root
config({ path: path.join(rootDir, '.env') });

/**
 * Database Migration Script: Baremetal to DigitalOcean PostgreSQL
 *
 * This script migrates data from the current baremetal PostgreSQL server
 * to a managed DigitalOcean PostgreSQL database.
 *
 * Uses existing environment variables from project .env file:
 * - DATABASE_URL (source database - current baremetal server)
 * - DO_POSTGRES_USER (DigitalOcean username)
 * - DO_POSTGRES_PASSWORD (DigitalOcean password)
 * - DO_POSTGRES_HOST (DigitalOcean host)
 * - DO_POSTGRES_PORT (DigitalOcean port, default: 25060)
 * - DO_POSTGRES_DATABASE (DigitalOcean database, default: defaultdb)
 * - DO_POSTGRES_SSLMODE (SSL mode, default: require)
 */
import { validateEnvironment } from './config';
import { testConnections } from './connection-test';
import { promptForConfirmation } from './prompt';
import { createDatabaseDump } from './dump';
import { restoreDatabase } from './restore';
import { verifyMigration } from './verify';
import { cleanup } from './cleanup';
import { info, error, success } from './logger';

// Handle graceful shutdown
process.on('SIGINT', () => {
  info('\nMigration interrupted by user');
  process.exit(0);
});

// Main migration logic with top-level await
try {
  info('🚀 Starting Database Migration to DigitalOcean PostgreSQL');
  console.log();

  // Validate environment
  validateEnvironment();

    // Test connections
    await testConnections();

    // Show summary and ask for confirmation
    const confirmed = await promptForConfirmation();
    if (!confirmed) {
      info('Migration cancelled by user');
      process.exit(0);
    }

    console.log();
    info('Starting migration process...');

    // Create dump
    const dumpFile = await createDatabaseDump();

    // Restore dump
    await restoreDatabase(dumpFile);

    // Verify migration
    await verifyMigration();

    // Cleanup
    cleanup(dumpFile);

    console.log();
    success('🎉 Migration completed successfully!');
    console.log();
    info('Next steps:');
    info(
      '1. Update your application to use the new DATABASE_URL pointing to DigitalOcean'
    );
    info('2. Test your application thoroughly');
    info('3. Consider keeping the old database as backup for a while');
    console.log();
} catch (err) {
  error(`Migration failed: ${(err as Error).message}`);
  process.exit(1);
}
