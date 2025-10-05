import { execSync } from 'child_process';
import { info, error, success, warning } from './logger';
import { getTargetConnectionParams, buildConnectionString } from './config';

export function verifyMigration(): void {
  info('Verifying migration...');

  const targetParams = getTargetConnectionParams();
  const targetConnectionString = buildConnectionString(targetParams);

  try {
    // Check table count
    info('Checking table count...');
    const sourceTableCountCmd = `psql "${process.env.DATABASE_URL}" -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" -t`;
    const targetTableCountCmd = `psql "${targetConnectionString}" -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" -t`;

    const sourceTableCount = execSync(sourceTableCountCmd, {
      encoding: 'utf8',
    }).trim();
    const targetTableCount = execSync(targetTableCountCmd, {
      encoding: 'utf8',
    }).trim();

    if (sourceTableCount === targetTableCount) {
      success(`Table count matches: ${sourceTableCount} tables`);
    } else {
      warning(
        `Table count mismatch - Source: ${sourceTableCount}, Target: ${targetTableCount}`
      );
    }

    // Check some key tables
    const keyTables = ['users', 'uploads', 'jobs', 'settings'];
    for (const table of keyTables) {
      try {
        const sourceRowCountCmd = `psql "${process.env.DATABASE_URL}" -c "SELECT COUNT(*) FROM ${table};" -t`;
        const targetRowCountCmd = `psql "${targetConnectionString}" -c "SELECT COUNT(*) FROM ${table};" -t`;

        const sourceRows = execSync(sourceRowCountCmd, {
          encoding: 'utf8',
        }).trim();
        const targetRows = execSync(targetRowCountCmd, {
          encoding: 'utf8',
        }).trim();

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
