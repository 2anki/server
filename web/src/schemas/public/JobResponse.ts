import Jobs from './Jobs';

/**
 * API response shape for a job — extends the DB type with fields that are
 * computed server-side and not stored as columns, so kanel can regenerate
 * Jobs.ts freely without losing these.
 */
export default interface JobResponse extends Jobs {
  restartable: boolean;
}
