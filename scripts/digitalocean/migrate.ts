#!/usr/bin/env node

/**
 * Database Migration Script: Baremetal to DigitalOcean PostgreSQL
 *
 * This script migrates data from the current baremetal PostgreSQL server
 * to a managed DigitalOcean PostgreSQL database.
 *
 * Required environment variables:
 * - DATABASE_URL (source database - current baremetal server)
 * - DO_POSTGRES_USER (DigitalOcean username)
 * - DO_POSTGRES_PASSWORD (DigitalOcean password)
 * - DO_POSTGRES_HOST (DigitalOcean host)
 * - DO_POSTGRES_PORT (DigitalOcean port, default: 25060)
 * - DO_POSTGRES_DATABASE (DigitalOcean database, default: defaultdb)
 * - DO_POSTGRES_SSLMODE (SSL mode, default: require)
 */

import { fileURLToPath } from 'url';
import { validateEnvironment } from './config';
import { testConnections } from './connection-test';
import { promptForConfirmation } from './prompt';
import { createDatabaseDump } from './dump';
import { restoreDatabase } from './restore';
import { verifyMigration } from './verify';
import { cleanup } from './cleanup';
import { info, error, success } from './logger';

async function main(): Promise<void> {
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
    await cleanup(dumpFile);

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
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  info('\nMigration interrupted by user');
  process.exit(0);
});

// Run the migration
if (fileURLToPath(import.meta.url) === process.argv[1]) {
  main();
}

export { main };
