import cheerio from "cheerio";

import replaceAll from "./replaceAll";

export default function handleClozeDeletions(input: string) {
  const dom = cheerio.load(input);
  const clozeDeletions = dom("code");
  let mangle = input;
  let num = 1;
  clozeDeletions.each((_i, elem) => {
    const v = dom(elem).html();
    if (!v) {
      return;
    }
    // Note: Does this handle the case where there cloze deletion is uppercase? C1
    if (v.includes("{{c") && v.includes("}}") && !v.includes("KaTex")) {
      // make Statement unreachable bc. even clozes can get such a formation
      // eg: \frac{{c}} 1 would give that.
      mangle = replaceAll(mangle, `<code>${v}</code>`, v);
    } else if (!v.includes("KaTex") && v.match(/c\d::/)) {
      // In the case user forgets the curly braces, add it for them
      if (!v.includes("{{")) {
        mangle = mangle.replace("<code>", `{{`);
      } else {
        mangle = mangle.replace("<code>", "");
      }
      if (!v.endsWith("}}")) {
        mangle = mangle.replace("</code>", "}}");
      } else {
        mangle = mangle.replace("</code>", "");
      }
    } else if (!v.includes("KaTex")) {
      const old = `<code>${v}</code>`;
      const newValue = v.match(/c\d::/) ? `{{${v}}}` : `{{c${num}::${v}}}`;
      mangle = replaceAll(mangle, old, newValue);
      num += 1;
    } else {
      const old = `<code>${v}</code>`;
      // prevent "}}" so that anki closes the Cloze at the right }} not this one
      const vReplaced = replaceAll(v, "}}", "} }");
      const newValue = "{{c" + num + "::" + vReplaced + "}}";
      mangle = replaceAll(mangle, old, newValue);
      num += 1;
    }
  });

  return mangle;
}
