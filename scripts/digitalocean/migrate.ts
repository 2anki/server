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

import 'dotenv/config';
import { log, error } from './logger.ts';
import { validateEnvironment } from './config.ts';
import { testConnections } from './connection-test.ts';
import { promptConfirmation } from './prompt.ts';
import { createDatabaseDump } from './dump.ts';
import { restoreDatabaseDump } from './restore.ts';
import { verifyMigration } from './verify.ts';
import { cleanupDumpFile } from './cleanup.ts';

async function main(): Promise<void> {
  try {
    log('🚀 Starting Database Migration to DigitalOcean PostgreSQL', 'bright');
    console.log();

    // Validate environment
    validateEnvironment();

    // Test connections
    testConnections();

    // Show summary and ask for confirmation
    const confirmed = await promptConfirmation();
    if (!confirmed) {
      log('Migration cancelled by user', 'yellow');
      process.exit(0);
    }

    console.log();
    log('Starting migration process...', 'bright');

    // Create dump
    const dumpFile = await createDatabaseDump();

    // Restore dump
    await restoreDatabaseDump(dumpFile);

    // Verify migration
    verifyMigration();

    // Cleanup
    cleanupDumpFile(dumpFile);

    console.log();
    log('🎉 Migration completed successfully!', 'green');
    console.log();
    log('Next steps:', 'bright');
    log(
      '1. Update your application to use the new DATABASE_URL pointing to DigitalOcean',
      'cyan'
    );
    log('2. Test your application thoroughly', 'cyan');
    log('3. Consider keeping the old database as backup for a while', 'cyan');
    console.log();
  } catch (err) {
    error(`Migration failed: ${(err as Error).message}`);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  log('\nMigration interrupted by user', 'yellow');
  process.exit(0);
});

// Run the migration
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { main };
