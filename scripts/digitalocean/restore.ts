import { spawn } from 'child_process';
import { info, error, success } from './logger';
import { getTargetConnectionParams, buildConnectionString } from './config';
import { getSecurePostgresPath } from './utils';

export function restoreDatabase(dumpFile: string): Promise<void> {
  info('Restoring database dump to target...');

  const targetParams = getTargetConnectionParams();
  const targetConnectionString = buildConnectionString(targetParams);

  try {
    // Get secure path to psql
    const psqlPath = getSecurePostgresPath('psql');
    
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
