import {
  ObservabilityQueryService,
  OpsMetricsResponse,
  OpsMetricsWindow,
  isOpsMetricsWindow,
} from '../../services/observability/ObservabilityQueryService';

const DEFAULT_WINDOW: OpsMetricsWindow = '24h';

export class GetOpsMetricsUseCase {
  constructor(private readonly queryService: ObservabilityQueryService) {}

  execute(rawWindow: unknown): Promise<OpsMetricsResponse> {
    const window = isOpsMetricsWindow(rawWindow) ? rawWindow : DEFAULT_WINDOW;
    return this.queryService.getMetrics(window);
  }
}

export default GetOpsMetricsUseCase;
