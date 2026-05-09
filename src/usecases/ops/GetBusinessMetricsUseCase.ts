import {
  BusinessMetricsResponse,
  BusinessMetricsService,
} from '../../services/ops/BusinessMetricsService';

export class GetBusinessMetricsUseCase {
  constructor(private readonly service: BusinessMetricsService) {}

  execute(): Promise<BusinessMetricsResponse> {
    return this.service.getMetrics();
  }
}

export default GetBusinessMetricsUseCase;
