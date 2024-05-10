import { getUploadLimits } from './getUploadLimits';

describe('getUploadLimits', () => {
  test('not patron', () => {
    const limits = getUploadLimits({patron: false, subscriber: false});
    const about100MB = 104857600;
    expect(limits.fileSize).toBe(about100MB);
  });

  test('patron', () => {
    const limits = getUploadLimits({patron: true, subscriber: false});
    const about1GB = 10485760000;
    expect(limits.fileSize).toBe(about1GB);
  });

  test('subscriber', () => {
    const limits = getUploadLimits({patron: false, subscriber: true});
    const about500MB = 524288000;
    expect(limits.fileSize).toBe(about500MB);
  })
});
