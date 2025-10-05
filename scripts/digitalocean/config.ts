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
    if (!process.env[varName] || process.env[varName]!.trim() === '') {
      error(
        `${varName} is not set or is empty. Please provide your DigitalOcean database credentials.`
      );
      process.exit(1);
    }
  }

  // Validate host format (basic check)
  if (!process.env.DO_POSTGRES_HOST!.includes('.')) {
    error('DO_POSTGRES_HOST does not appear to be a valid hostname.');
    process.exit(1);
  }

  // Validate port if provided
  if (
    process.env.DO_POSTGRES_PORT &&
    isNaN(parseInt(process.env.DO_POSTGRES_PORT))
  ) {
    error('DO_POSTGRES_PORT must be a valid number.');
    process.exit(1);
  }

  success('Environment variables validated');
}

export function getSourceConnectionParams(): DatabaseConnectionParams {
  const dbUrl = new URL(process.env.DATABASE_URL!);
  return {
    host: dbUrl.hostname,
    port: dbUrl.port || 5432,
    user: dbUrl.username,
    password: dbUrl.password,
    database: dbUrl.pathname.substring(1), // Remove leading slash
  };
}

export function getTargetConnectionParams(): DatabaseConnectionParams {
  return {
    host: process.env.DO_POSTGRES_HOST!,
    port: process.env.DO_POSTGRES_PORT || '25060',
    user: process.env.DO_POSTGRES_USER!,
    password: process.env.DO_POSTGRES_PASSWORD!,
    database: process.env.DO_POSTGRES_DATABASE || 'defaultdb',
    sslmode: process.env.DO_POSTGRES_SSLMODE || 'require',
  };
}

export function buildConnectionString(
  params: DatabaseConnectionParams
): string {
  return `postgresql://${params.user}:${encodeURIComponent(params.password)}@${params.host}:${params.port}/${params.database}${params.sslmode ? `?sslmode=${params.sslmode}` : ''}`;
}

export function sanitizeForLogging(str: string): string {
  // Replace passwords and sensitive info in logs
  return str.replace(
    /postgresql:\/\/[^:]+:[^@]+@/g,
    'postgresql://[USER]:[PASSWORD]@'
  );
}
