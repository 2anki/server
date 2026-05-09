import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

import { ObservabilitySink } from './ObservabilitySink';
import { getObservabilitySink } from './observabilitySinkInstance';

export const OBSERVABILITY_SERVICES = [
  'notion',
  'claude',
  'dropbox',
  'google_drive',
  'patreon',
] as const;

export type ObservabilityService = (typeof OBSERVABILITY_SERVICES)[number];

const isAllowedService = (service: string): service is ObservabilityService =>
  (OBSERVABILITY_SERVICES as readonly string[]).includes(service);

const stripQueryFromUrl = (url: string): string => {
  try {
    const parsed = new URL(url);
    return `${parsed.host}${parsed.pathname}`;
  } catch {
    const queryIndex = url.indexOf('?');
    return queryIndex >= 0 ? url.slice(0, queryIndex) : url;
  }
};

const recordSafely = (
  sink: ObservabilitySink,
  service: ObservabilityService,
  endpoint: string,
  statusCode: number | null,
  durationMs: number
) => {
  try {
    sink.recordOutboundCall({
      service,
      endpoint,
      status_code: statusCode,
      duration_ms: durationMs,
      created_at: new Date(),
    });
  } catch (error) {
    console.error('[observability] failed to record outbound call', error);
  }
};

const extractStatusFromError = (error: unknown): number | null => {
  if (axios.isAxiosError(error) && error.response != null) {
    return error.response.status;
  }
  return null;
};

type Verb = 'get' | 'post' | 'put' | 'delete';

const runWithBody = async <T>(
  verb: 'post' | 'put',
  url: string,
  data: unknown,
  config: AxiosRequestConfig | undefined
): Promise<AxiosResponse<T>> => axios[verb]<T>(url, data, config);

const runNoBody = async <T>(
  verb: 'get' | 'delete',
  url: string,
  config: AxiosRequestConfig | undefined
): Promise<AxiosResponse<T>> => axios[verb]<T>(url, config);

export interface InstrumentedAxios {
  get<T = unknown>(
    service: ObservabilityService,
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>>;
  post<T = unknown>(
    service: ObservabilityService,
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>>;
  put<T = unknown>(
    service: ObservabilityService,
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>>;
  delete<T = unknown>(
    service: ObservabilityService,
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>>;
}

const measure = async <T>(
  sink: ObservabilitySink,
  service: string,
  url: string,
  exec: () => Promise<AxiosResponse<T>>
): Promise<AxiosResponse<T>> => {
  if (!isAllowedService(service)) {
    throw new Error(
      `[observability] unknown service "${service}". Allowed: ${OBSERVABILITY_SERVICES.join(', ')}`
    );
  }
  const endpoint = stripQueryFromUrl(url);
  const start = Date.now();
  try {
    const response = await exec();
    recordSafely(sink, service, endpoint, response.status, Date.now() - start);
    return response;
  } catch (error) {
    recordSafely(sink, service, endpoint, extractStatusFromError(error), Date.now() - start);
    throw error;
  }
};

export const makeInstrumentedAxios = (sink: ObservabilitySink): InstrumentedAxios => ({
  get: (service, url, config) =>
    measure(sink, service, url, () => runNoBody('get', url, config)),
  post: (service, url, data, config) =>
    measure(sink, service, url, () => runWithBody('post', url, data, config)),
  put: (service, url, data, config) =>
    measure(sink, service, url, () => runWithBody('put', url, data, config)),
  delete: (service, url, config) =>
    measure(sink, service, url, () => runNoBody('delete', url, config)),
});

let cached: InstrumentedAxios | null = null;
const getInstrumentedAxios = (): InstrumentedAxios => {
  if (cached == null) {
    cached = makeInstrumentedAxios(getObservabilitySink());
  }
  return cached;
};

const proxy: InstrumentedAxios = {
  get: (service, url, config) => getInstrumentedAxios().get(service, url, config),
  post: (service, url, data, config) =>
    getInstrumentedAxios().post(service, url, data, config),
  put: (service, url, data, config) =>
    getInstrumentedAxios().put(service, url, data, config),
  delete: (service, url, config) => getInstrumentedAxios().delete(service, url, config),
};

export default proxy;
