import PdfRenderService from './PdfRenderService';

const PUPPETEER_AVAILABLE = process.env.PUPPETEER_AVAILABLE === 'true';

(PUPPETEER_AVAILABLE ? describe : describe.skip)('PdfRenderService', () => {
  it('renders simple HTML to a PDF buffer', async () => {
    const service = new PdfRenderService();
    const html = '<html><body><h1>Hello</h1></body></html>';
    const pdf = await service.renderHtml(html);

    expect(Buffer.isBuffer(pdf)).toBe(true);
    expect(pdf.length).toBeGreaterThan(0);
    expect(pdf.subarray(0, 5).toString()).toBe('%PDF-');
  }, 30_000);
});
