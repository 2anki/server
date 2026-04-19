describe('StorageHandler endpoint resolution', () => {
  const originalEndpoint = process.env.SPACES_ENDPOINT;
  const originalRegion = process.env.SPACES_REGION;

  afterEach(() => {
    process.env.SPACES_ENDPOINT = originalEndpoint;
    process.env.SPACES_REGION = originalRegion;
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

  it('throws a clear error when both SPACES_ENDPOINT and SPACES_REGION are unset', () => {
    delete process.env.SPACES_ENDPOINT;
    delete process.env.SPACES_REGION;
    const StorageHandler = loadHandler();
    expect(() => new StorageHandler()).toThrow(
      /Storage region is not configured/
    );
  });

  it('starts cleanly when SPACES_ENDPOINT is unset but SPACES_REGION is', () => {
    delete process.env.SPACES_ENDPOINT;
    process.env.SPACES_REGION = 'fra1';
    const StorageHandler = loadHandler();
    expect(() => new StorageHandler()).not.toThrow();
  });

  it('trims whitespace and still prepends https://', () => {
    process.env.SPACES_ENDPOINT = '  fra1.digitaloceanspaces.com  ';
    const StorageHandler = loadHandler();
    const handler = new StorageHandler();
    expect(handler.s3.config.endpoint).toBeDefined();
  });

  it('derives the region from a DO Spaces endpoint when SPACES_REGION is unset', async () => {
    process.env.SPACES_ENDPOINT = 'fra1.digitaloceanspaces.com';
    delete process.env.SPACES_REGION;
    const StorageHandler = loadHandler();
    const handler = new StorageHandler();
    const region = await handler.s3.config.region();
    expect(region).toBe('fra1');
  });

  it('honours an explicit SPACES_REGION over the endpoint hint', async () => {
    process.env.SPACES_ENDPOINT = 'fra1.digitaloceanspaces.com';
    process.env.SPACES_REGION = 'sfo3';
    const StorageHandler = loadHandler();
    const handler = new StorageHandler();
    const region = await handler.s3.config.region();
    expect(region).toBe('sfo3');
  });

});
