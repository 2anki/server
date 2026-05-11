import puppeteer from 'puppeteer';

const PDF_TIMEOUT_MS = 30_000;
const MATHJAX_SETTLE_MS = 2_000;

export default class PdfRenderService {
  async renderHtml(html: string): Promise<Buffer> {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'load' });
      await page.evaluate(
        (timeout) =>
          new Promise<void>((resolve) => {
            const start = Date.now();
            const check = () => {
              const mj = (globalThis as Record<string, unknown>).MathJax;
              if (
                mj &&
                typeof mj === 'object' &&
                'typesetPromise' in mj &&
                typeof (mj as Record<string, unknown>).typesetPromise ===
                  'function'
              ) {
                (mj as { typesetPromise: () => Promise<void> })
                  .typesetPromise()
                  .then(resolve)
                  .catch(resolve);
              } else if (Date.now() - start > timeout) {
                resolve();
              } else {
                setTimeout(check, 200);
              }
            };
            check();
          }),
        MATHJAX_SETTLE_MS
      );
      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '1cm', right: '1cm', bottom: '1cm', left: '1cm' },
        timeout: PDF_TIMEOUT_MS,
      });
      return Buffer.from(pdf);
    } finally {
      await browser.close();
    }
  }
}
