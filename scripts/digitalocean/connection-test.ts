import { execSync } from 'child_process';
import { info, error, success } from './logger.ts';
import { getTargetConnectionParams, buildConnectionString } from './config.ts';

export function testConnections(): void {
  info('Testing database connections...');

  // Test source connection
  try {
    info('Testing source database connection...');
    const sourceTestCmd = `psql "${process.env.DATABASE_URL}" -c "SELECT version();" -t`;
    execSync(sourceTestCmd, { stdio: 'pipe' });
    success('Source database connection successful');
  } catch (err) {
    error('Failed to connect to source database');
    error('Please check your DATABASE_URL and network connectivity');
    process.exit(1);
  }

  // Test target connection
  try {
    info('Testing target database connection...');
    const targetParams = getTargetConnectionParams();
    const targetConnectionString = buildConnectionString(targetParams);
    const targetTestCmd = `psql "${targetConnectionString}" -c "SELECT version();" -t`;
    execSync(targetTestCmd, { stdio: 'pipe' });
    success('Target database connection successful');
  } catch (err) {
    error('Failed to connect to target database');
    error(
      'Please check your DigitalOcean credentials and network connectivity'
    );
    process.exit(1);
  }
}
