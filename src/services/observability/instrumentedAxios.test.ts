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

  it('rejects URLs whose host is not on a fixed-host service allowlist (SSRF guard)', async () => {
    const repo = new FakeRepo();
    const sink = new ObservabilitySink(repo);
    const client = makeInstrumentedAxios(sink);

    await expect(
      client.get('claude', 'https://attacker.example.com/exfil')
    ).rejects.toThrow(/host.*not allowed.*claude/i);
    expect(mockedAxios.get).not.toHaveBeenCalled();

    await expect(
      client.get('google_drive', 'https://evil.com/file')
    ).rejects.toThrow(/host.*not allowed.*google_drive/i);

    await expect(
      client.get('patreon', 'https://api.notion.com/v1/pages/abc')
    ).rejects.toThrow(/host.*not allowed.*patreon/i);
  });

  it('rejects private/loopback hosts on every service (SSRF deny-list)', async () => {
    const repo = new FakeRepo();
    const sink = new ObservabilitySink(repo);
    const client = makeInstrumentedAxios(sink);

    const privateHosts = [
      'https://localhost/internal',
      'https://127.0.0.1/internal',
      'https://10.0.0.1/internal',
      'https://192.168.1.1/internal',
      'https://172.16.0.1/internal',
      'https://169.254.169.254/latest/meta-data',
      'https://[::1]/internal',
    ];

    for (const url of privateHosts) {
      await expect(client.get('notion', url)).rejects.toThrow(
        /private\/loopback address/i
      );
      await expect(client.get('dropbox', url)).rejects.toThrow(
        /private\/loopback address/i
      );
    }
    expect(mockedAxios.get).not.toHaveBeenCalled();
  });

  it('allows arbitrary public hosts for variable-host services (notion media, dropbox files)', async () => {
    const repo = new FakeRepo();
    const sink = new ObservabilitySink(repo);
    const client = makeInstrumentedAxios(sink);

    mockedAxios.get.mockResolvedValue({ status: 200, data: 'ok' });

    await expect(
      client.get(
        'notion',
        'https://prod-files-secure.s3.us-west-2.amazonaws.com/abc/def?X-Amz-Signature=xyz'
      )
    ).resolves.toEqual({ status: 200, data: 'ok' });

    await expect(
      client.get(
        'dropbox',
        'https://uc8a13c9bd5f6e64ad7f78a14e0c.dl.dropboxusercontent.com/cd/0/get/abc'
      )
    ).resolves.toEqual({ status: 200, data: 'ok' });
  });

  it('rejects non-https URLs even when the host would otherwise be allowed', async () => {
    const repo = new FakeRepo();
    const sink = new ObservabilitySink(repo);
    const client = makeInstrumentedAxios(sink);

    await expect(
      client.get('notion', 'http://api.notion.com/v1/pages/abc')
    ).rejects.toThrow(/https/i);
    expect(mockedAxios.get).not.toHaveBeenCalled();
  });

  it('rejects malformed URLs with a clear error before reaching axios', async () => {
    const repo = new FakeRepo();
    const sink = new ObservabilitySink(repo);
    const client = makeInstrumentedAxios(sink);

    await expect(client.get('notion', 'not a url')).rejects.toThrow(/invalid url/i);
    expect(mockedAxios.get).not.toHaveBeenCalled();
  });

  it('accepts every documented production host', async () => {
    const repo = new FakeRepo();
    const sink = new ObservabilitySink(repo);
    const client = makeInstrumentedAxios(sink);

    mockedAxios.get.mockResolvedValue({ status: 200, data: 'ok' });

    const cases: Array<[Parameters<typeof client.get>[0], string]> = [
      ['notion', 'https://api.notion.com/v1/pages/abc'],
      ['claude', 'https://api.anthropic.com/v1/messages'],
      ['dropbox', 'https://content.dropboxapi.com/2/files/upload'],
      ['google_drive', 'https://www.googleapis.com/drive/v3/files/abc'],
      ['google_drive', 'https://oauth2.googleapis.com/token'],
      ['patreon', 'https://www.patreon.com/api/oauth2/v2/identity'],
    ];

    for (const [service, url] of cases) {
      await expect(client.get(service, url)).resolves.toEqual({
        status: 200,
        data: 'ok',
      });
    }
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
