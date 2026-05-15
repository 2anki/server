import { useQuery } from '@tanstack/react-query';

import { PerformanceMetricsResponse } from './performanceTypes';

const REFRESH_MS = 30_000;

const fetchPerformanceMetrics =
  async (): Promise<PerformanceMetricsResponse> => {
    const response = await fetch('/api/ops/performance/metrics', {
      credentials: 'include',
    });
    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`);
    }
    return response.json();
  };

export const usePerformanceMetrics = () => {
  return useQuery<PerformanceMetricsResponse, Error>({
    queryKey: ['ops-performance-metrics'],
    queryFn: fetchPerformanceMetrics,
    refetchInterval: REFRESH_MS,
    refetchOnWindowFocus: true,
  });
};
