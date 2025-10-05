import type { Colors } from './types.ts';

// ANSI color codes for console output
const colors: Colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

export function log(message: string, color: keyof Colors = 'reset'): void {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

export function error(message: string): void {
  log(`❌ ERROR: ${message}`, 'red');
}

export function success(message: string): void {
  log(`✅ ${message}`, 'green');
}

export function info(message: string): void {
  log(`ℹ️  ${message}`, 'blue');
}

export function warning(message: string): void {
  log(`⚠️  ${message}`, 'yellow');
}
