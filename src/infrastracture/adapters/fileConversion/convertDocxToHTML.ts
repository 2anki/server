import mammoth from 'mammoth';

export async function convertDocxToHTML(contents: Buffer): Promise<string> {
  const result = await mammoth.convertToHtml({ buffer: contents });
  if (result.messages.length > 0) {
    console.log('[convertDocxToHTML] conversion warnings', result.messages);
  }
  return result.value;
}
