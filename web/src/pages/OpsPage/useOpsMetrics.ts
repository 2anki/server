import { useQuery } from '@tanstack/react-query';

import { OpsMetricsResponse, OpsMetricsWindow } from './opsTypes';

const REFRESH_MS = 30_000;

const fetchOpsMetrics = async (
  window: OpsMetricsWindow
): Promise<OpsMetricsResponse> => {
  const response = await fetch(`/ops/api/metrics?window=${window}`, {
    credentials: 'include',
  });
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }
  return response.json();
};

export const useOpsMetrics = (window: OpsMetricsWindow) => {
  return useQuery<OpsMetricsResponse, Error>({
    queryKey: ['ops-metrics', window],
    queryFn: () => fetchOpsMetrics(window),
    refetchInterval: REFRESH_MS,
    refetchOnWindowFocus: true,
    refetchIntervalInBackground: false,
  });
};
