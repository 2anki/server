import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { info, error, success } from './logger';
import { getTargetConnectionParams, buildConnectionString } from './config';

/**
 * Find executable in PATH without using external dependencies
 */
function findExecutable(command: string): string | null {
  const envPath = process.env.PATH || '';
  const pathDirs = envPath.split(path.delimiter);
  
  for (const dir of pathDirs) {
    const fullPath = path.join(dir, command);
    try {
      if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
        // Check if file is executable (on Unix systems)
        if (process.platform !== 'win32') {
          const stats = fs.statSync(fullPath);
          if (stats.mode & parseInt('111', 8)) {
            return fullPath;
          }
        } else {
          return fullPath;
        }
      }
    } catch {
      // Continue to next directory if stat fails
    }
  }
  return null;
}

/**
 * Get the absolute path to psql command with security validation
 */
function getPsqlPath(): string {
  const psqlPath = findExecutable('psql');
  if (!psqlPath) {
    throw new Error('psql command not found in PATH. Please install PostgreSQL client.');
  }
  
  // Validate that psql is in a trusted directory
  const trustedPaths = [
    '/usr/bin/',
    '/usr/local/bin/',
    '/opt/homebrew/bin/',
    '/Applications/Postgres.app/Contents/Versions/',
  ];
  
  const isInTrustedPath = trustedPaths.some(trustedPath => 
    psqlPath.startsWith(trustedPath)
  );
  
  if (!isInTrustedPath) {
    throw new Error(`psql found in untrusted location: ${psqlPath}. Expected in: ${trustedPaths.join(', ')}`);
  }
  
  return psqlPath;
}

/**
 * Safely execute psql command with connection string
 */
function testDatabaseConnection(connectionString: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const psqlPath = getPsqlPath();
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
      reject(err);
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
