import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { info, error, success, warning } from './logger.ts';
import { getSourceConnectionParams } from './config.ts';

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
    // Use pg_dump to create a clean dump (schema + data)
    const dumpCmd = [
      'pg_dump',
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

    const dumpProcess = spawn(dumpCmd[0], dumpCmd.slice(1), {
      env: {
        ...process.env,
        PGPASSWORD: sourceParams.password,
      },
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    return new Promise((resolve, reject) => {
      let stderr = '';

      dumpProcess.stderr.on('data', (data) => {
        stderr += data.toString();
        // pg_dump writes progress to stderr, so we log it
        process.stdout.write(data);
      });

      dumpProcess.on('close', (code) => {
        if (code === 0) {
          // Set restrictive permissions on dump file
          try {
            fs.chmodSync(dumpFile, 0o600);
          } catch (chmodErr) {
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
