import { execSync } from 'child_process';
import { info, error, success } from './logger';
import { getTargetConnectionParams, buildConnectionString } from './config';

export function testConnections(): void {
  info('Testing database connections...');

  // Test source connection
  try {
    execSync(`psql "${process.env.DATABASE_URL}" -c "SELECT 1;" -t`, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
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
    execSync(`psql "${targetConnectionString}" -c "SELECT 1;" -t`, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    success('Target database connection: ✓');
  } catch {
    error('Failed to connect to target database');
    error('Please check your DigitalOcean database credentials');
    process.exit(1);
  }
}
