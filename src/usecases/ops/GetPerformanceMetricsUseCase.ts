import {
  PerformanceMetricsService,
  PerformanceMetricsResponse,
} from '../../services/ops/PerformanceMetricsService';

export class GetPerformanceMetricsUseCase {
  constructor(
    private readonly performanceMetricsService: PerformanceMetricsService
  ) {}

  execute(): Promise<PerformanceMetricsResponse> {
    return this.performanceMetricsService.getMetrics();
  }
}
