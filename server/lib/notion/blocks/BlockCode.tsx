import { GetBlockResponse } from "@notionhq/client/build/src/api-endpoints";
import ReactDOMServer from "react-dom/server";
import { styleWithColors } from "../NotionColors";
import HandleBlockAnnotations from "./utils";

const BlockCode = (block: GetBlockResponse) => {
  /* @ts-ignore */
  const code = block.code;
  const text = code.text;

  return ReactDOMServer.renderToStaticMarkup(
    <pre id={block.id} className={`code code-wrap${styleWithColors(code.color)}`}>
      <code>
        {text.map((t: GetBlockResponse) => {
          /* @ts-ignore */
          const annotations = t.annotations;
          /* @ts-ignore */
          return HandleBlockAnnotations(annotations, t.text);
        })}
      </code>
    </pre>
  );
};

export default BlockCode;
