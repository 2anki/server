import {
  GetBlockResponse,
  ListBlockChildrenResponse,
} from "@notionhq/client/build/src/api-endpoints";
import ReactDOMServer from "react-dom/server";
import BlockHandler from "../../BlockHandler";
import { styleWithColors } from "../../NotionColors";
import HandleBlockAnnotations, { HandleChildren } from "../utils";
import { convert } from "html-to-text"

const listStyles = ["disc", "circle", "square"];
export const BlockBulletList = async (
  block: GetBlockResponse,
  response: ListBlockChildrenResponse,
  handler: BlockHandler
) => {
  const items = [];

  for (const result of response.results) {
    handler.skip.push(result.id);
    /* @ts-ignore */
    const list = result.bulleted_list_item;
    if (!list) {
      break;
    }
    handler.skip.push(list.id);
    const children = await HandleChildren(result, handler);
    const text = list.text;
    const top = [];

    for (const t of text) {
      /* @ts-ignore */
      const annotations = t.annotations;
      top.push(HandleBlockAnnotations(annotations, t.text));
    }
    items.push(
      <li style={{ listStyleType: listStyles[0] }}>
        {top}
        {children && (
          <ul id={list.id} className={`bulleted-list${styleWithColors(list.color)}`}>
            <li style={{ listStyleType: listStyles[1] }}>{children}</li>
          </ul>
        )}
      </li>
    );
  }
  const markup = ReactDOMServer.renderToStaticMarkup(
    <ul id={block.id} className="bulleted-list">
      {items}
    </ul>
  );

  if (handler.settings?.isTextOnlyBack) {
    return convert(markup);
  }

  return markup;
};
