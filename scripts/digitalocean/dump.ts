import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { info, error, success, warning } from './logger';
import { getSourceConnectionParams } from './config';

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
 * Get the absolute path to pg_dump command with security validation
 */
function getPgDumpPath(): string {
  const pgDumpPath = findExecutable('pg_dump');
  if (!pgDumpPath) {
    throw new Error('pg_dump command not found in PATH. Please install PostgreSQL client.');
  }
  
  // Validate that pg_dump is in a trusted directory
  const trustedPaths = [
    '/usr/bin/',
    '/usr/local/bin/',
    '/opt/homebrew/bin/',
    '/Applications/Postgres.app/Contents/Versions/',
  ];
  
  const isInTrustedPath = trustedPaths.some(trustedPath => 
    pgDumpPath.startsWith(trustedPath)
  );
  
  if (!isInTrustedPath) {
    throw new Error(`pg_dump found in untrusted location: ${pgDumpPath}. Expected in: ${trustedPaths.join(', ')}`);
  }
  
  return pgDumpPath;
}

export function createDatabaseDump(): Promise<string> {
  info('Creating database dump from source...');

  const sourceParams = getSourceConnectionParams();
  const dumpFile = path.join(
    __dirname,
    '../../tmp',
    `migration_dump_${Date.now()}.sql`
  );

  // Ensure tmp directory exists
  const tmpDir = path.dirname(dumpFile);
  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, { recursive: true });
  }

  try {
    // Get secure path to pg_dump
    const pgDumpPath = getPgDumpPath();
    
    // Use pg_dump to create a clean dump (schema + data)
    const dumpArgs = [
      '--host',
      sourceParams.host,
      '--port',
      sourceParams.port.toString(),
      '--username',
      sourceParams.user,
      '--dbname',
      sourceParams.database,
      '--verbose',
      '--clean',
      '--no-acl',
      '--no-owner',
      '--file',
      dumpFile,
    ];

    info('Running pg_dump with sanitized parameters...');

    const dumpProcess = spawn(pgDumpPath, dumpArgs, {
      env: {
        ...process.env,
        PGPASSWORD: sourceParams.password,
        PATH: '', // Clear PATH to prevent command hijacking
      },
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    return new Promise((resolve, reject) => {
      dumpProcess.stderr.on('data', (data) => {
        // pg_dump writes progress to stderr, so we log it
        process.stdout.write(data);
      });

      dumpProcess.on('close', (code) => {
        if (code === 0) {
          // Set restrictive permissions on dump file
          try {
            fs.chmodSync(dumpFile, 0o600);
          } catch {
            warning('Could not set restrictive permissions on dump file');
          }
          success(`Database dump created: ${path.basename(dumpFile)}`);
          resolve(dumpFile);
        } else {
          error(`pg_dump failed with exit code ${code}`);
          // Don't log stderr as it might contain sensitive info
          reject(new Error(`Dump failed with code ${code}`));
        }
      });

      dumpProcess.on('error', (err) => {
        error('Failed to start pg_dump process');
        reject(err);
      });
    });
  } catch (err) {
    error('Error creating database dump');
    throw err;
  }
}
