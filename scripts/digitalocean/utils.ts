import fs from 'node:fs';
import path from 'node:path';

/**
 * Find executable in PATH without using external dependencies
 */
export function findExecutable(command: string): string | null {
  const envPath = process.env.PATH || '';
  const pathDirs = envPath.split(path.delimiter);
  
  for (const dir of pathDirs) {
    const fullPath = path.join(dir, command);
    try {
      if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
        // Check if file is executable (on Unix systems)
        if (process.platform !== 'win32') {
          const stats = fs.statSync(fullPath);
          if (stats.mode & Number.parseInt('111', 8)) {
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
 * Get the absolute path to a PostgreSQL command with security validation
 */
export function getSecurePostgresPath(command: string): string {
  const executablePath = findExecutable(command);
  if (!executablePath) {
    throw new Error(`${command} command not found in PATH. Please install PostgreSQL client.`);
  }
  
  // Validate that the command is in a trusted directory
  const trustedPaths = [
    '/usr/bin/',
    '/usr/local/bin/',
    '/opt/homebrew/bin/',
    '/Applications/Postgres.app/Contents/Versions/',
  ];
  
  const isInTrustedPath = trustedPaths.some(trustedPath => 
    executablePath.startsWith(trustedPath)
  );
  
  if (!isInTrustedPath) {
    throw new Error(`${command} found in untrusted location: ${executablePath}. Expected in: ${trustedPaths.join(', ')}`);
  }
  
  return executablePath;
}