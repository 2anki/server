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
      await page.waitForFunction(
        `new Promise(function(resolve) {
          var start = Date.now();
          function check() {
            if (window.MathJax && typeof window.MathJax.typesetPromise === 'function') {
              window.MathJax.typesetPromise().then(function() { resolve(true); }).catch(function() { resolve(true); });
            } else if (Date.now() - start > ${MATHJAX_SETTLE_MS}) {
              resolve(true);
            } else {
              setTimeout(check, 200);
            }
          }
          check();
        })`,
        { timeout: PDF_TIMEOUT_MS }
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
