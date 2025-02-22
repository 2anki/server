export function splitContentIntoChunks(content: string): string[] {
  const chunkSize = 2 * 1024 * 1024; // Reduced to 2MB chunks
  const chunks: string[] = [];
  let offset = 0;

  while (offset < content.length) {
    let end = Math.min(offset + chunkSize, content.length);
    if (end < content.length) {
      const nextParagraph = content.indexOf('\n\n', end - 1000);
      if (nextParagraph !== -1 && nextParagraph < end + 1000) {
        end = nextParagraph;
      } else {
        const nextSentence = content.indexOf('. ', end - 200);
        if (nextSentence !== -1 && nextSentence < end + 200) {
          end = nextSentence + 1;
        }
      }
    }

    chunks.push(content.slice(offset, end));
    offset = end;
  }

  return chunks;
}
