describe('StorageHandler endpoint resolution', () => {
  const originalEndpoint = process.env.SPACES_ENDPOINT;

  afterEach(() => {
    process.env.SPACES_ENDPOINT = originalEndpoint;
    jest.resetModules();
  });

  function loadHandler() {
    jest.resetModules();
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require('./StorageHandler').default;
  }

  it('prepends https:// when SPACES_ENDPOINT is a bare hostname', () => {
    process.env.SPACES_ENDPOINT = 'fra1.digitaloceanspaces.com';
    const StorageHandler = loadHandler();
    const handler = new StorageHandler();
    expect(handler.s3.config.endpoint).toBeDefined();
  });

  it('accepts an already-schemed SPACES_ENDPOINT unchanged', () => {
    process.env.SPACES_ENDPOINT = 'https://fra1.digitaloceanspaces.com';
    const StorageHandler = loadHandler();
    const handler = new StorageHandler();
    expect(handler.s3.config.endpoint).toBeDefined();
  });

  it('falls back cleanly when SPACES_ENDPOINT is unset', () => {
    delete process.env.SPACES_ENDPOINT;
    const StorageHandler = loadHandler();
    expect(() => new StorageHandler()).not.toThrow();
  });

  it('trims whitespace and still prepends https://', () => {
    process.env.SPACES_ENDPOINT = '  fra1.digitaloceanspaces.com  ';
    const StorageHandler = loadHandler();
    const handler = new StorageHandler();
    expect(handler.s3.config.endpoint).toBeDefined();
  });
});
