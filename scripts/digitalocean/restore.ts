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

export function restoreDatabase(dumpFile: string): Promise<void> {
  info('Restoring database dump to target...');

  const targetParams = getTargetConnectionParams();
  const targetConnectionString = buildConnectionString(targetParams);

  try {
    // Get secure path to psql
    const psqlPath = getPsqlPath();
    
    // Use psql to restore the dump
    const restoreArgs = [
      targetConnectionString,
      '--file',
      dumpFile,
      '--verbose',
    ];

    info('Running psql restore with sanitized connection string...');

    const restoreProcess = spawn(psqlPath, restoreArgs, {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env, PATH: '' }, // Clear PATH to prevent command hijacking
    });

    return new Promise((resolve, reject) => {
      restoreProcess.stdout.on('data', (data) => {
        process.stdout.write(data);
      });

      restoreProcess.stderr.on('data', (data) => {
        process.stderr.write(data);
      });

      restoreProcess.on('close', (code) => {
        if (code === 0) {
          success('Database restore completed successfully');
          resolve();
        } else {
          error(`psql restore failed with exit code ${code}`);
          reject(new Error(`Restore failed with code ${code}`));
        }
      });

      restoreProcess.on('error', (err) => {
        error('Failed to start psql process');
        reject(err);
      });
    });
  } catch (err) {
    error('Error restoring database dump');
    throw err;
  }
}
