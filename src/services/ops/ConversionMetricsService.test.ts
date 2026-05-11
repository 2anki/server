import { ConversionMetricsService } from './ConversionMetricsService';
import knex from 'knex';

describe('ConversionMetricsService', () => {
  let db: any;
  let service: ConversionMetricsService;

  beforeEach(() => {
    db = {
      raw: jest.fn().mockReturnValue('raw_result'),
    };
    service = new ConversionMetricsService(db as any);
  });

  it('returns null for metrics when query fails gracefully', async () => {
    const metrics = await service.getMetrics();

    expect(metrics.free_conversions_7d).toBe(null);
    expect(metrics.paid_conversions_7d).toBe(null);
    expect(metrics.free_conversion_success_rate_7d).toBe(null);
    expect(metrics.paid_conversion_success_rate_7d).toBe(null);
    expect(metrics.conversion_errors_7d_top_reasons).toBe(null);
    expect(metrics.failed_conversions_weekly).toBe(null);
  });

  it('has expected response shape', async () => {
    const metrics = await service.getMetrics();

    expect(metrics).toHaveProperty('free_conversions_7d');
    expect(metrics).toHaveProperty('paid_conversions_7d');
    expect(metrics).toHaveProperty('free_conversion_success_rate_7d');
    expect(metrics).toHaveProperty('paid_conversion_success_rate_7d');
    expect(metrics).toHaveProperty('conversion_errors_7d_top_reasons');
    expect(metrics).toHaveProperty('failed_conversions_weekly');
  });
});
