import { GetBlockResponse } from "@notionhq/client/build/src/api-endpoints";
import ReactDOMServer from "react-dom/server";
import { styleWithColors } from "../NotionColors";
import HandleBlockAnnotations from "./utils";

const BlockParagraph = (block: GetBlockResponse): string | null => {
  /* @ts-ignore */
  const paragraph = block["paragraph"];
  const text = paragraph.text;

  return ReactDOMServer.renderToStaticMarkup(
    <p className={styleWithColors(paragraph.color)} id={block.id}>
      {text.map((t: GetBlockResponse) => {
        /* @ts-ignore */
        let annotations = t.annotations;
        /* @ts-ignore */
        return HandleBlockAnnotations(annotations, t.text);
      })}
    </p>
  );
};

export default BlockParagraph;
