import { getNotionId } from './getNotionId';

describe('getNotionId', () => {
  it('should be able to identify a GetNotionID', () => {
    expect(
      getNotionId(
        'https://www.notion.so/alemayhu/HTML-test-4aa53621a84a4660b69e9953f3938685'
      )
    ).toBe('4aa53621a84a4660b69e9953f3938685');
  });
  it('should be undefined', () => {
    expect(getNotionId('')).toBe(undefined);
  });
});
