import { extractPdfText, PdfExtractionResult } from './extractPdfText';

jest.mock('pdf-parse', () => {
  return jest.fn();
});

import pdfParse from 'pdf-parse';

const mockPdfParse = pdfParse as jest.MockedFunction<typeof pdfParse>;

const FIXTURE_BUFFER = Buffer.from('fake-pdf-bytes');

describe('extractPdfText', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns page texts and metadata for a normal PDF', async () => {
    mockPdfParse.mockResolvedValueOnce({
      numpages: 3,
      text: 'Introduction\nThis is page one.\n\nHeading Two\nContent on page two.\n\nConclusion\nFinal summary here.',
      info: {},
      metadata: null,
      version: 'v1.10.100' as const,
      numrender: 3,
    });

    const result: PdfExtractionResult = await extractPdfText(FIXTURE_BUFFER);

    expect(result.isDrmLocked).toBe(false);
    expect(result.pageCount).toBe(3);
    expect(result.pages.length).toBeGreaterThan(0);
    expect(result.avgCharsPerPage).toBeGreaterThan(10);
  });

  it('detects DRM-locked PDFs where average chars per page is below threshold', async () => {
    mockPdfParse.mockResolvedValueOnce({
      numpages: 10,
      text: '',
      info: {},
      metadata: null,
      version: 'v1.10.100' as const,
      numrender: 0,
    });

    const result = await extractPdfText(FIXTURE_BUFFER);

    expect(result.isDrmLocked).toBe(true);
    expect(result.pageCount).toBe(10);
  });

  it('handles a single page PDF', async () => {
    mockPdfParse.mockResolvedValueOnce({
      numpages: 1,
      text: 'What is the capital of France?\nParis is the capital of France.',
      info: {},
      metadata: null,
      version: 'v1.10.100' as const,
      numrender: 1,
    });

    const result = await extractPdfText(FIXTURE_BUFFER);

    expect(result.isDrmLocked).toBe(false);
    expect(result.pageCount).toBe(1);
    expect(result.pages).toHaveLength(1);
  });

  it('propagates pdf-parse errors', async () => {
    mockPdfParse.mockRejectedValueOnce(new Error('Invalid PDF structure'));

    await expect(extractPdfText(FIXTURE_BUFFER)).rejects.toThrow(
      'Invalid PDF structure'
    );
  });
});
