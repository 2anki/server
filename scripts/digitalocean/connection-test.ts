import { spawn } from 'node:child_process';
import { info, error, success } from './logger';
import { getTargetConnectionParams, buildConnectionString } from './config';
import { getSecurePostgresPath } from './utils';

/**
 * Safely execute psql command with connection string
 */
function testDatabaseConnection(connectionString: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const psqlPath = getSecurePostgresPath('psql');
    const psqlProcess = spawn(psqlPath, [connectionString, '-c', 'SELECT 1;', '-t'], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env, PATH: '' }, // Clear PATH to prevent command hijacking
    });

    psqlProcess.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`psql connection test failed with exit code ${code}`));
      }
    });

    psqlProcess.on('error', (err) => {
      reject(err instanceof Error ? err : new Error(String(err)));
    });
  });
}

export async function testConnections(): Promise<void> {
  info('Testing database connections...');

  // Test source connection
  try {
    const sourceUrl = process.env.DATABASE_URL;
    if (!sourceUrl) {
      throw new Error('DATABASE_URL is not set');
    }
    await testDatabaseConnection(sourceUrl);
    success('Source database connection: ✓');
  } catch {
    error('Failed to connect to source database');
    error('Please check your DATABASE_URL and network connectivity');
    process.exit(1);
  }

  // Test target connection
  try {
    const targetParams = getTargetConnectionParams();
    const targetConnectionString = buildConnectionString(targetParams);
    await testDatabaseConnection(targetConnectionString);
    success('Target database connection: ✓');
  } catch {
    error('Failed to connect to target database');
    error('Please check your DigitalOcean database credentials');
    process.exit(1);
  }
}
