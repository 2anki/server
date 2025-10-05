export interface DatabaseConnectionParams {
  host: string;
  port: string | number;
  user: string;
  password: string;
  database: string;
  sslmode?: string;
}

export interface Colors {
  reset: string;
  bright: string;
  red: string;
  green: string;
  yellow: string;
  blue: string;
  magenta: string;
  cyan: string;
}
