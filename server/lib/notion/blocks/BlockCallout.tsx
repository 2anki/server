import { GetBlockResponse } from "@notionhq/client/build/src/api-endpoints";
import ReactDOMServer from "react-dom/server";
import BlockHandler from "../BlockHandler";
import getPlainText from "../helpers/getPlainText";
import { styleWithColors } from "../NotionColors";
import HandleBlockAnnotations from "./HandleBlockAnnotations";

export const BlockCallout = (block: GetBlockResponse, handler: BlockHandler) => {
  /* @ts-ignore */
  const callout = block.callout;
  const icon = callout.icon;
  const text = callout.text;
 
  if (handler.settings?.isTextOnlyBack) {
    return getPlainText(text);
  }

  return ReactDOMServer.renderToStaticMarkup(
    <figure
      id={block.id}
      className={`callout${styleWithColors(callout.color)}`}
      style={{ whiteSpace: "pre-wrap", display: "flex" }}
    >
      <div>
        {icon && icon.type === "emoji" && (
          <span className="icon">{icon.emoji}</span>
        )}
      </div>
      <div style={{ width: "100%" }}>
        {text.map((t: GetBlockResponse) => {
          /* @ts-ignore */
          const annotations = t.annotations;
          /* @ts-ignore */
          return HandleBlockAnnotations(annotations, t.text);
        })}
      </div>
    </figure>
  );
};
