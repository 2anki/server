import { info, error, success } from './logger';
import type { DatabaseConnectionParams } from './types';

export function validateEnvironment(): void {
  info('Validating environment variables...');

  // Check source database
  if (!process.env.DATABASE_URL) {
    error(
      'DATABASE_URL is not set. This should point to your source database.'
    );
    process.exit(1);
  }

  // Validate DATABASE_URL format
  try {
    new URL(process.env.DATABASE_URL);
  } catch {
    error('DATABASE_URL is not a valid URL format.');
    process.exit(1);
  }

  // Check DigitalOcean database configuration
  const requiredVars = [
    'DO_POSTGRES_PASSWORD',
    'DO_POSTGRES_HOST',
    'DO_POSTGRES_USER',
  ];

  for (const varName of requiredVars) {
    const envValue = process.env[varName];
    if (!envValue || envValue.trim() === '') {
      error(
        `${varName} is not set or is empty. Please provide your DigitalOcean database credentials.`
      );
      process.exit(1);
    }
  }

  // Validate host format (basic check)
  const doPostgresHost = process.env.DO_POSTGRES_HOST;
  if (doPostgresHost && !doPostgresHost.includes('.')) {
    error('DO_POSTGRES_HOST does not appear to be a valid hostname.');
    process.exit(1);
  }

  // Validate port if provided
  if (
    process.env.DO_POSTGRES_PORT &&
    Number.isNaN(Number.parseInt(process.env.DO_POSTGRES_PORT, 10))
  ) {
    error('DO_POSTGRES_PORT must be a valid number.');
    process.exit(1);
  }

  success('Environment variables validated');
}

export function getSourceConnectionParams(): DatabaseConnectionParams {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not set');
  }
  const dbUrl = new URL(databaseUrl);
  return {
    host: dbUrl.hostname,
    port: dbUrl.port || 5432,
    user: dbUrl.username,
    password: dbUrl.password,
    database: dbUrl.pathname.substring(1), // Remove leading slash
  };
}

export function getTargetConnectionParams(): DatabaseConnectionParams {
  const host = process.env.DO_POSTGRES_HOST;
  const user = process.env.DO_POSTGRES_USER;
  const password = process.env.DO_POSTGRES_PASSWORD;
  
  if (!host || !user || !password) {
    throw new Error('Required DigitalOcean database environment variables are not set');
  }
  
  return {
    host,
    port: process.env.DO_POSTGRES_PORT || '25060',
    user,
    password,
    database: process.env.DO_POSTGRES_DATABASE || 'defaultdb',
    sslmode: process.env.DO_POSTGRES_SSLMODE || 'require',
  };
}

export function buildConnectionString(
  params: DatabaseConnectionParams
): string {
  const sslSuffix = params.sslmode ? `?sslmode=${params.sslmode}` : '';
  return `postgresql://${params.user}:${encodeURIComponent(params.password)}@${params.host}:${params.port}/${params.database}${sslSuffix}`;
}

export function sanitizeForLogging(str: string): string {
  // Replace passwords and sensitive info in logs
  return str.replaceAll(
    /postgresql:\/\/[^:]+:[^@]+@/g,
    'postgresql://[USER]:[PASSWORD]@'
  );
}
