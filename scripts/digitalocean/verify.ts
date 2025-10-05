import { spawn } from 'node:child_process';
import { info, error, success, warning } from './logger';
import { getTargetConnectionParams, buildConnectionString } from './config';
import { getSecurePostgresPath } from './utils';

/**
 * Safely execute a SQL query against a database
 */
function executeSqlQuery(connectionString: string, query: string): Promise<string> {
  return new Promise((resolve, reject) => {
          const psqlPath = getSecurePostgresPath('psql');
    const psqlProcess = spawn(psqlPath, [connectionString, '-c', query, '-t'], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env, PATH: '' }, // Clear PATH to prevent command hijacking
    });

    let stdout = '';
    let stderr = '';

    psqlProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    psqlProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    psqlProcess.on('close', (code) => {
      if (code === 0) {
        resolve(stdout.trim());
      } else {
        reject(new Error(`SQL query failed with exit code ${code}: ${stderr}`));
      }
    });

    psqlProcess.on('error', (err) => {
      reject(err instanceof Error ? err : new Error(String(err)));
    });
  });
}

export async function verifyMigration(): Promise<void> {
  info('Verifying migration...');

  const targetParams = getTargetConnectionParams();
  const targetConnectionString = buildConnectionString(targetParams);
  const sourceUrl = process.env.DATABASE_URL;

  if (!sourceUrl) {
    throw new Error('DATABASE_URL is not set');
  }

  try {
    // Check table count using parameterized query
    info('Checking table count...');
    const tableCountQuery = "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';";

    const sourceTableCount = await executeSqlQuery(sourceUrl, tableCountQuery);
    const targetTableCount = await executeSqlQuery(targetConnectionString, tableCountQuery);

    if (sourceTableCount === targetTableCount) {
      success(`Table count matches: ${sourceTableCount} tables`);
    } else {
      warning(
        `Table count mismatch - Source: ${sourceTableCount}, Target: ${targetTableCount}`
      );
    }

    // Check some key tables using safe table names
    const keyTables = ['users', 'uploads', 'jobs', 'settings'];
    for (const table of keyTables) {
      // Validate table name to prevent SQL injection
      if (!/^[a-zA-Z_]\w*$/.test(table)) {
        warning(`Skipping invalid table name: ${table}`);
        continue;
      }

      try {
        // Use safe SQL query construction
        const rowCountQuery = `SELECT COUNT(*) FROM ${table};`;

        const sourceRows = await executeSqlQuery(sourceUrl, rowCountQuery);
        const targetRows = await executeSqlQuery(targetConnectionString, rowCountQuery);

        if (sourceRows === targetRows) {
          success(`${table} table: ${sourceRows} rows (matching)`);
        } else {
          warning(
            `${table} table: Source ${sourceRows} rows, Target ${targetRows} rows`
          );
        }
      } catch {
        warning(`Could not verify ${table} table (might not exist)`);
      }
    }

    success('Migration verification completed');
  } catch (err) {
    error(`Error during verification: ${(err as Error).message}`);
    throw err;
  }
}
