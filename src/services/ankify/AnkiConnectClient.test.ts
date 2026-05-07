import {
  AnkiConnectClient,
  AnkiConnectError,
  AnkiConnectUnreachableError,
} from './AnkiConnectClient';

const makeFetch = (
  body: unknown,
  init: Partial<{ ok: boolean; status: number; statusText: string }> = {}
) =>
  jest.fn(async () => ({
    ok: init.ok ?? true,
    status: init.status ?? 200,
    statusText: init.statusText ?? 'OK',
    json: async () => body,
  })) as unknown as typeof fetch;

describe('AnkiConnectClient', () => {
  test('addNote sends a POST with action+version and returns the result', async () => {
    const fetchImpl = makeFetch({ result: 1234567890, error: null });
    const client = new AnkiConnectClient(
      'http://localhost:8765',
      fetchImpl,
      5000
    );

    const id = await client.addNote({
      deckName: 'My Deck',
      modelName: 'Basic',
      fields: { Front: 'q', Back: 'a' },
      tags: ['notion-sync'],
    });

    expect(id).toBe(1234567890);
    const callArgs = (fetchImpl as jest.Mock).mock.calls[0];
    expect(callArgs[0]).toBe('http://localhost:8765');
    const body = JSON.parse(callArgs[1].body);
    expect(body).toEqual({
      action: 'addNote',
      version: 6,
      params: {
        note: {
          deckName: 'My Deck',
          modelName: 'Basic',
          fields: { Front: 'q', Back: 'a' },
          tags: ['notion-sync'],
        },
      },
    });
  });

  test('omits params for parameterless actions like version/sync', async () => {
    const fetchImpl = makeFetch({ result: 6, error: null });
    const client = new AnkiConnectClient('http://x', fetchImpl);

    await client.ping();

    const body = JSON.parse((fetchImpl as jest.Mock).mock.calls[0][1].body);
    expect(body).toEqual({ action: 'version', version: 6 });
  });

  test('throws AnkiConnectError when the response carries an error string', async () => {
    const fetchImpl = makeFetch({ result: null, error: 'deck not found' });
    const client = new AnkiConnectClient('http://x', fetchImpl);

    await expect(client.deckNames()).rejects.toBeInstanceOf(AnkiConnectError);
  });

  test('throws AnkiConnectError when HTTP status is not OK', async () => {
    const fetchImpl = makeFetch(
      {},
      { ok: false, status: 500, statusText: 'Internal Server Error' }
    );
    const client = new AnkiConnectClient('http://x', fetchImpl);

    await expect(client.deckNames()).rejects.toBeInstanceOf(AnkiConnectError);
  });

  test('throws AnkiConnectUnreachableError when fetch rejects', async () => {
    const fetchImpl = jest.fn(async () => {
      throw new Error('connect ECONNREFUSED');
    }) as unknown as typeof fetch;
    const client = new AnkiConnectClient('http://x', fetchImpl);

    await expect(client.deckNames()).rejects.toBeInstanceOf(
      AnkiConnectUnreachableError
    );
  });
});
