const sanitizeTags = (tags: string[]): string[] =>
  tags.map(($1) => $1.trim().replace(/\s+/g, '-'));

export default sanitizeTags;
