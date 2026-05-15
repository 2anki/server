import { Knex } from 'knex';

export interface JobDurationPercentiles {
  window: '24h' | '7d';
  p50_ms: number | null;
  p95_ms: number | null;
  p99_ms: number | null;
  count: number;
}

export interface JobStatusBreakdown {
  status: string;
  count: number;
}

export interface SlowJob {
  id: number;
  type: string | null;
  duration_ms: number;
  card_count: number | null;
  completed_at: string;
}

export interface SignupCountryBreakdownItem {
  country: string;
  count: number;
}

export interface PerformanceMetricsResponse {
  generated_at: string;
  durations: JobDurationPercentiles[];
  status_breakdown_24h: JobStatusBreakdown[];
  slowest_jobs_24h: SlowJob[];
  signup_countries_7d: SignupCountryBreakdownItem[];
}

const TERMINAL_STATUSES = ['done', 'failed', 'cancelled', 'interrupted'];

export class PerformanceMetricsService {
  constructor(private readonly db: Knex) {}

  async getMetrics(): Promise<PerformanceMetricsResponse> {
    const [d24, d7, statuses, slowest, countries] = await Promise.all([
      this.getDurationPercentiles(1),
      this.getDurationPercentiles(7),
      this.getStatusBreakdown(1),
      this.getSlowestJobs(1, 20),
      this.getSignupCountries(7),
    ]);
    return {
      generated_at: new Date().toISOString(),
      durations: [
        { window: '24h', ...d24 },
        { window: '7d', ...d7 },
      ],
      status_breakdown_24h: statuses,
      slowest_jobs_24h: slowest,
      signup_countries_7d: countries,
    };
  }

  private async getDurationPercentiles(
    sinceDays: number
  ): Promise<Omit<JobDurationPercentiles, 'window'>> {
    const result = (await this.db.raw(
      `SELECT
         percentile_disc(0.5) WITHIN GROUP (ORDER BY EXTRACT(EPOCH FROM (last_edited_time - created_at)) * 1000) AS p50,
         percentile_disc(0.95) WITHIN GROUP (ORDER BY EXTRACT(EPOCH FROM (last_edited_time - created_at)) * 1000) AS p95,
         percentile_disc(0.99) WITHIN GROUP (ORDER BY EXTRACT(EPOCH FROM (last_edited_time - created_at)) * 1000) AS p99,
         COUNT(*) AS total
       FROM jobs
       WHERE status = 'done'
         AND last_edited_time >= NOW() - (? * INTERVAL '1 day')
         AND created_at IS NOT NULL
         AND last_edited_time IS NOT NULL`,
      [sinceDays]
    )) as { rows: { p50: string | null; p95: string | null; p99: string | null; total: string }[] };
    const row = result.rows[0];
    return {
      p50_ms: row?.p50 != null ? Math.round(Number(row.p50)) : null,
      p95_ms: row?.p95 != null ? Math.round(Number(row.p95)) : null,
      p99_ms: row?.p99 != null ? Math.round(Number(row.p99)) : null,
      count: row?.total != null ? Number(row.total) : 0,
    };
  }

  private async getStatusBreakdown(
    sinceDays: number
  ): Promise<JobStatusBreakdown[]> {
    const rows = (await this.db('jobs')
      .whereIn('status', TERMINAL_STATUSES)
      .where(
        'last_edited_time',
        '>=',
        this.db.raw("NOW() - (? * INTERVAL '1 day')", [sinceDays])
      )
      .select('status')
      .count<{ status: string; count: string }[]>('* as count')
      .groupBy('status')
      .orderBy('count', 'desc')) as { status: string; count: string }[];
    return rows.map((row) => ({
      status: row.status,
      count: Number(row.count),
    }));
  }

  private async getSlowestJobs(
    sinceDays: number,
    limit: number
  ): Promise<SlowJob[]> {
    const result = (await this.db.raw(
      `SELECT id, type, card_count, last_edited_time AS completed_at,
              EXTRACT(EPOCH FROM (last_edited_time - created_at)) * 1000 AS duration_ms
       FROM jobs
       WHERE status = 'done'
         AND last_edited_time >= NOW() - (? * INTERVAL '1 day')
         AND created_at IS NOT NULL
       ORDER BY duration_ms DESC NULLS LAST
       LIMIT ?`,
      [sinceDays, limit]
    )) as {
      rows: {
        id: number;
        type: string | null;
        card_count: number | null;
        completed_at: Date | string;
        duration_ms: string;
      }[];
    };
    return result.rows.map((row) => ({
      id: Number(row.id),
      type: row.type,
      card_count: row.card_count != null ? Number(row.card_count) : null,
      completed_at:
        row.completed_at instanceof Date
          ? row.completed_at.toISOString()
          : row.completed_at,
      duration_ms: Math.round(Number(row.duration_ms)),
    }));
  }

  private async getSignupCountries(
    sinceDays: number
  ): Promise<SignupCountryBreakdownItem[]> {
    const rows = (await this.db('users')
      .whereNotNull('signup_country')
      .where(
        'created_at',
        '>=',
        this.db.raw("NOW() - (? * INTERVAL '1 day')", [sinceDays])
      )
      .select('signup_country')
      .count<{ signup_country: string; count: string }[]>('* as count')
      .groupBy('signup_country')
      .orderBy('count', 'desc')) as { signup_country: string; count: string }[];
    return rows.map((row) => ({
      country: row.signup_country,
      count: Number(row.count),
    }));
  }
}
