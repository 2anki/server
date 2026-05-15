const puppeteer = {
  async launch() {
    throw new Error(
      'puppeteer mock invoked in tests. Run with PUPPETEER_AVAILABLE=true and the real module to exercise PdfRenderService.'
    );
  },
};

export default puppeteer;
