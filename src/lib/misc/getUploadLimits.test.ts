import { getUploadLimits } from './getUploadLimits';

const about1GB = 10485760000;
describe('getUploadLimits', () => {
  test('default', () => {
    const limits = getUploadLimits();
    expect(limits.fileSize).toBe(about1GB);
  });
});
