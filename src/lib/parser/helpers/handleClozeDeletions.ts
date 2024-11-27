import cheerio from 'cheerio';

import replaceAll from './replaceAll';

export default function handleClozeDeletions(input: string) {
  // Find the highest existing cloze number or default to 0
  const existingClozes = input.match(/c(\d+)::/g);
  let num = 1;
  if (existingClozes) {
    const m = existingClozes.map((c) => parseInt(c.match(/\d+/)![0]));
    const maxCloze = Math.max(...m);
    num = maxCloze + 1;
  }

  const dom = cheerio.load(input);
  const clozeDeletions = dom('code');
  let mangle = input;
  clozeDeletions.each((_i, elem) => {
    const v = dom(elem).html();
    if (!v) {
      return;
    }
    // Note: Does this handle the case where there cloze deletion is uppercase? C1
    if (v.includes('{{c') && v.includes('}}') && !v.includes('KaTex')) {
      // make Statement unreachable bc. even clozes can get such a formation
      // eg: \frac{{c}} 1 would give that.
      mangle = replaceAll(mangle, `<code>${v}</code>`, v);
    } else if (!v.includes('KaTex') && v.match(/c\d::/)) {
      // In the case user forgets the curly braces, add it for them
      if (!v.includes('{{')) {
        mangle = mangle.replace('<code>', '{{');
      } else {
        mangle = mangle.replace('<code>', '');
      }
      if (!v.endsWith('}}')) {
        mangle = mangle.replace('</code>', '}}');
      } else {
        mangle = mangle.replace('</code>', '');
      }
    } else if (!v.includes('KaTex')) {
      const old = `<code>${v}</code>`;
      const newValue = v.match(/c\d::/) ? `{{${v}}}` : `{{c${num}::${v}}}`;
      mangle = replaceAll(mangle, old, newValue);
      num += 1;
    } else {
      const old = `<code>${v}</code>`;
      // Remove 'KaTex:' from the content
      const vReplaced = v.replace('KaTex:', '');
      // Add space only for standalone KaTeX (when there's just one code block)
      const isStandalone = (mangle.match(/<code>/g) || []).length === 1;
      const newValue = isStandalone
        ? `{{c${num}::${vReplaced} }}`
        : `{{c${num}::${vReplaced}}}`;
      mangle = replaceAll(mangle, old, newValue);
      num += 1;
    }
  });

  return mangle;
}
