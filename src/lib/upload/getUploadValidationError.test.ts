import { getUploadValidationError } from './getUploadValidationError';
import { UploadedFile } from '../storage/types';

function makeFile(overrides: Partial<UploadedFile>): UploadedFile {
  return {
    originalname: 'export.html',
    mimetype: 'text/html',
    size: 1024,
    path: '/tmp/abc',
    fieldname: 'pakker',
    encoding: '7bit',
    destination: '/tmp',
    filename: 'abc',
    buffer: Buffer.alloc(0),
    stream: null as any,
    key: '',
    ...overrides,
  };
}

describe('getUploadValidationError', () => {
  test('returns error when no files are provided', () => {
    const error = getUploadValidationError([]);
    expect(error).not.toBeNull();
    expect(error!.message).toContain('select a file');
  });

  test('returns error when files is undefined', () => {
    const error = getUploadValidationError(undefined as any);
    expect(error).not.toBeNull();
    expect(error!.message).toContain('select a file');
  });

  test('returns error when file is zero bytes', () => {
    const error = getUploadValidationError([makeFile({ size: 0, originalname: 'ExportBlock-Part-1' })]);
    expect(error).not.toBeNull();
    expect(error!.message).toContain('empty');
  });

  test('returns error when an apkg file is uploaded', () => {
    const error = getUploadValidationError([makeFile({ originalname: '🧠 L4 Neurotransmission.apkg', size: 82138 })]);
    expect(error).not.toBeNull();
    expect(error!.message).toContain('already an Anki deck');
  });

  test('returns null for a valid html file', () => {
    const error = getUploadValidationError([makeFile({ originalname: 'export.html', size: 5000 })]);
    expect(error).toBeNull();
  });

  test('returns null for a valid zip file', () => {
    const error = getUploadValidationError([makeFile({ originalname: 'notion-export.zip', size: 20000 })]);
    expect(error).toBeNull();
  });
});
