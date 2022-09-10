import { TagElement, ToggleHeading } from '../types';

/**
 * findToggleHeadings transforms the HTML format to something 2anki.net understands.
 *
 * Limitations: due to the way Notion has implemented toggle headings in the export,
 * we are not supporting the proper formating for the toggle header. So it will not
 * be semantically correct (h1, h2, etc.). We just show plain text but the back will
 * perserve the formatting and be semantically correct.
 *
 * Hopefully Notion will improve this, adding structure for reference
 * <div class="page-body">
 *      <h1 id="e2b3cc96-2b45-4cfd-ae7c-8f17048e67e2" class="">
 *              <details open="">
 *                      <summary>Front with heading 1</summary>
 *              </details>
 *      </h1>
 *      <div class="indented">
 *              <h1 id="3c7316b3-053e-4963-9e21-f8c6bd26e99b" class="">
 *                      <details open="">
 *                              <summary>Back with heading 1</summary>
 *                      </details>
 *              </h1>
 *      </div>
 *
 * Known issues: We can create duplicates but Anki will coalasce the flashcards so it's
 * safe to ignore those for now.
 *
 * @param dom cheerio
 * @returns transformed toggle headings Cheerio[]
 */

export const findToggleHeadings = (dom: cheerio.Root): cheerio.Element[] => {
  const elements = dom('.page-body > *').toArray();
  let toggleHeadings: ToggleHeading[] = [];
  let i = 0;
  for (const element of elements) {
    const el = element as TagElement;
    if (el.tagName.match(/h[1-6]/)) {
      toggleHeadings[i] = {
        summary: dom(element).html(),
        details: null,
      };
    } else if (el.attribs.class === 'indented') {
      toggleHeadings[i++].details = dom(element).html();
    }
  }
  // @ts-ignore
  return toggleHeadings.map((th) =>
    dom(
      '<div>' +
        // @ts-ignore
        th.summary.replace('</summary>', `</summary>${th.details}`) +
        '</div>'
    )
  );
};
