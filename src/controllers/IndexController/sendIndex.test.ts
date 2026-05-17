import { Response } from 'express';

import { sendIndex } from './sendIndex';
import { getIndexFileContents } from './getIndexFileContents';

jest.mock('./getIndexFileContents');

const mockedGet = getIndexFileContents as jest.MockedFunction<
  typeof getIndexFileContents
>;

function buildResponse() {
  return {
    status: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
  } as unknown as Response;
}

describe('sendIndex', () => {
  beforeEach(() => {
    mockedGet.mockReset();
  });

  it('sends the html with default 200 status when the build exists', () => {
    mockedGet.mockReturnValue('<html>ready</html>');
    const res = buildResponse();

    sendIndex(res);

    expect(res.status).not.toHaveBeenCalled();
    expect(res.send).toHaveBeenCalledWith('<html>ready</html>');
  });

  it('responds 503 with Retry-After when the build is mid-deploy', () => {
    mockedGet.mockReturnValue(null);
    const res = buildResponse();

    sendIndex(res);

    expect(res.status).toHaveBeenCalledWith(503);
    expect(res.set).toHaveBeenCalledWith('Retry-After', '5');
    expect(res.send).toHaveBeenCalledTimes(1);
  });
});
