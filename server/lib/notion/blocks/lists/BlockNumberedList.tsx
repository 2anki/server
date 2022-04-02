import { GetBlockResponse } from "@notionhq/client/build/src/api-endpoints";
import ReactDOMServer from "react-dom/server";
import { styleWithColors } from "../../NotionColors";
import HandleBlockAnnotations from "../utils";

export const BlockNumberedList = (block: GetBlockResponse) => {
  /* @ts-ignore */
  const list = block["numbered_list_item"];
  const text = list.text;
  // TODO: handle list.type
  return ReactDOMServer.renderToStaticMarkup(
    <ol id={block.id} className={`numbered-list${styleWithColors(list.color)}`}>
      {text.map((t: GetBlockResponse) => {
        /* @ts-ignore */
        let annotations = t.annotations;
        /* @ts-ignore */
        return (
          <li>
            {/* @ts-ignore */}
            {HandleBlockAnnotations(annotations, t.text)}
          </li>
        );
      })}
    </ol>
  );
};
