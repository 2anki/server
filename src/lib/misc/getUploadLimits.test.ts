import { getUploadLimits } from './getUploadLimits';

describe('getUploadLimits', () => {
  test('not patron', () => {
    const limits = getUploadLimits(false);
    const about100MB = 104857600;
    expect(limits.fileSize).toBe(about100MB);
  });

  test('paying', () => {
    const limits = getUploadLimits(true);
    const about1GB = 10485760000;
    expect(limits.fileSize).toBe(about1GB);
  });
});
