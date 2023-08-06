import { SuffixFrom } from './file';
it('should return suffix jpg suffix', () => {
  expect(SuffixFrom('test.jpg')).toBe('.jpg');
});

it('should return suffix apkg suffix', () => {
  expect(SuffixFrom('79d465a9-cbe9-4312-a1c5-a7fd3780e0f3.apkg')).toBe('.apkg');
});
