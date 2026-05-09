import axios, { AxiosError } from 'axios';

import { makeInstrumentedAxios, OBSERVABILITY_SERVICES } from './instrumentedAxios';
import { ObservabilitySink } from './ObservabilitySink';
import {
  IObservabilityRepository,
  OutboundCallLogRow,
  RequestLogRow,
} from '../../data_layer/ObservabilityRepository';

jest.mock('axios', () => {
  const actual = jest.requireActual('axios');
  return {
    __esModule: true,
    default: {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
      isAxiosError: actual.isAxiosError,
    },
  };
});

const mockedAxios = axios as jest.Mocked<typeof axios>;

class FakeRepo implements IObservabilityRepository {
  inbound: RequestLogRow[] = [];
  outbound: OutboundCallLogRow[] = [];

  insertRequestLogs = async (rows: RequestLogRow[]) => {
    this.inbound.push(...rows);
  };
  insertOutboundCallLogs = async (rows: OutboundCallLogRow[]) => {
    this.outbound.push(...rows);
  };
  aggregateInboundByStatusClass = async () => [];
  topRoutesByLatency = async () => [];
  aggregateOutboundByService = async () => [];
  errorRateByRoute = async () => [];
  errorRateByService = async () => [];
}

const makeAxiosError = (status: number): AxiosError => {
  const err = new Error(`status ${status}`) as AxiosError;
  err.isAxiosError = true;
  err.response = {
    status,
    statusText: '',
    headers: {},
    config: {} as never,
    data: null,
  };
  return err;
};

describe('instrumentedAxios', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('proxies a successful GET to axios.get and records host+pathname (query stripped)', async () => {
    const repo = new FakeRepo();
    const sink = new ObservabilitySink(repo);
    const client = makeInstrumentedAxios(sink);

    mockedAxios.get.mockResolvedValueOnce({ status: 200, data: 'ok' });

    const url = 'https://api.notion.com/v1/pages/abc?token=secret';
    const result = await client.get('notion', url);

    expect(result).toEqual({ status: 200, data: 'ok' });
    expect(mockedAxios.get).toHaveBeenCalledWith(url, undefined);

    await sink.flush();
    expect(repo.outbound).toHaveLength(1);
    expect(repo.outbound[0]).toMatchObject({
      service: 'notion',
      endpoint: 'api.notion.com/v1/pages/abc',
      status_code: 200,
    });
    expect(repo.outbound[0].duration_ms).toBeGreaterThanOrEqual(0);
  });

  it('records non-2xx status from an axios error and rethrows the error untouched', async () => {
    const repo = new FakeRepo();
    const sink = new ObservabilitySink(repo);
    const client = makeInstrumentedAxios(sink);

    const err = makeAxiosError(403);
    mockedAxios.get.mockRejectedValueOnce(err);

    await expect(
      client.get('notion', 'https://api.notion.com/v1/pages/abc')
    ).rejects.toBe(err);

    await sink.flush();
    expect(repo.outbound[0].status_code).toBe(403);
  });

  it('records null status_code on network errors (no response)', async () => {
    const repo = new FakeRepo();
    const sink = new ObservabilitySink(repo);
    const client = makeInstrumentedAxios(sink);

    const err = new Error('socket hang up');
    mockedAxios.get.mockRejectedValueOnce(err);

    await expect(
      client.get('notion', 'https://api.notion.com/v1/pages/abc')
    ).rejects.toBe(err);

    await sink.flush();
    expect(repo.outbound[0].status_code).toBeNull();
  });

  it('rejects unknown service names at the wrapper boundary', async () => {
    const repo = new FakeRepo();
    const sink = new ObservabilitySink(repo);
    const client = makeInstrumentedAxios(sink);

    await expect(
      client.get('mystery' as never, 'https://example.com')
    ).rejects.toThrow(/unknown service/i);
    expect(mockedAxios.get).not.toHaveBeenCalled();
  });

  it('proxies POST/PUT/DELETE and records them too', async () => {
    const repo = new FakeRepo();
    const sink = new ObservabilitySink(repo);
    const client = makeInstrumentedAxios(sink);

    mockedAxios.post.mockResolvedValueOnce({ status: 201, data: {} });
    mockedAxios.put.mockResolvedValueOnce({ status: 200, data: {} });
    mockedAxios.delete.mockResolvedValueOnce({ status: 204, data: '' });

    await client.post('claude', 'https://api.anthropic.com/v1/messages', { x: 1 });
    await client.put('dropbox', 'https://content.dropboxapi.com/2/files/upload');
    await client.delete('google_drive', 'https://www.googleapis.com/drive/v3/files/abc');

    await sink.flush();
    expect(repo.outbound.map((r) => r.service)).toEqual([
      'claude',
      'dropbox',
      'google_drive',
    ]);
    expect(repo.outbound.map((r) => r.status_code)).toEqual([201, 200, 204]);
  });

  it('exposes the closed allowlist as OBSERVABILITY_SERVICES', () => {
    expect(OBSERVABILITY_SERVICES).toEqual(
      expect.arrayContaining(['notion', 'claude', 'dropbox', 'google_drive', 'patreon'])
    );
  });

  it('does not throw when sink itself rejects (instrumentation must never break the caller)', async () => {
    const sink = {
      recordOutboundCall: () => {
        throw new Error('boom');
      },
    };
    const client = makeInstrumentedAxios(sink as never);
    mockedAxios.get.mockResolvedValueOnce({ status: 200, data: 'ok' });
    const errSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);

    await expect(
      client.get('notion', 'https://api.notion.com/v1/pages/abc')
    ).resolves.toEqual({ status: 200, data: 'ok' });
    errSpy.mockRestore();
  });
});
