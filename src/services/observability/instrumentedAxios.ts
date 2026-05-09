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

const FIXED_HOST_ALLOWLIST: Record<ObservabilityService, readonly string[] | null> = {
  notion: null,
  claude: ['api.anthropic.com'],
  dropbox: null,
  google_drive: ['www.googleapis.com', 'oauth2.googleapis.com'],
  patreon: ['www.patreon.com', 'api.patreon.com'],
};

const isHostOnFixedAllowlist = (
  host: string,
  service: ObservabilityService
): boolean => {
  const allowlist = FIXED_HOST_ALLOWLIST[service];
  if (allowlist == null) return true;
  const lowered = host.toLowerCase();
  return allowlist.some((allowed) => lowered === allowed);
};

const PRIVATE_IPV4_PATTERNS: RegExp[] = [
  /^10\./,
  /^127\./,
  /^192\.168\./,
  /^169\.254\./,
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
  /^0\./,
  /^100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\./,
];

const isPrivateOrLoopbackHost = (host: string): boolean => {
  const lowered = host.toLowerCase();
  if (lowered === 'localhost' || lowered.endsWith('.localhost')) return true;
  if (lowered === '::1' || lowered === '[::1]') return true;
  if (lowered.startsWith('fc') || lowered.startsWith('fd')) return true;
  if (lowered.startsWith('fe80:')) return true;
  return PRIVATE_IPV4_PATTERNS.some((pattern) => pattern.test(lowered));
};

interface ParsedRequestUrl {
  endpoint: string;
  hostname: string;
  protocol: string;
  hostWithPort: string;
}

const parseRequestUrl = (url: string): ParsedRequestUrl => {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error(`[observability] invalid URL: ${url}`);
  }
  return {
    endpoint: `${parsed.host}${parsed.pathname}`,
    hostname: parsed.hostname,
    hostWithPort: parsed.host,
    protocol: parsed.protocol,
  };
};

const assertSafeUrlForService = (
  parsed: ParsedRequestUrl,
  service: ObservabilityService
): void => {
  if (parsed.protocol !== 'https:') {
    throw new Error(
      `[observability] only https URLs are allowed for ${service} (got ${parsed.protocol})`
    );
  }
  if (isPrivateOrLoopbackHost(parsed.hostname)) {
    throw new Error(
      `[observability] host "${parsed.hostname}" is not allowed for service "${service}" (private/loopback address)`
    );
  }
  if (!isHostOnFixedAllowlist(parsed.hostname, service)) {
    throw new Error(
      `[observability] host "${parsed.hostname}" is not allowed for service "${service}"`
    );
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
  const parsed = parseRequestUrl(url);
  assertSafeUrlForService(parsed, service);
  const endpoint = parsed.endpoint;
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
