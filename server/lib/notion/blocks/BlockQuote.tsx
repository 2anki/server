import { GetBlockResponse } from "@notionhq/client/build/src/api-endpoints";
import ReactDOMServer from "react-dom/server";
import { styleWithColors } from "../NotionColors";
import HandleBlockAnnotations from "./utils";

export const BlockQuote = (block: GetBlockResponse) => {
  /* @ts-ignore */
  const quote = block["quote"];
  const text = quote.text;

  return ReactDOMServer.renderToStaticMarkup(
    <blockquote className={styleWithColors(quote.color)} id={block.id}>
      {text.map((t: GetBlockResponse) => {
        /* @ts-ignore */
        let annotations = t.annotations;
        /* @ts-ignore */
        return HandleBlockAnnotations(annotations, t.text);
      })}
    </blockquote>  );
};
