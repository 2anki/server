import { GetBlockResponse } from "@notionhq/client/build/src/api-endpoints";
import ReactDOMServer from "react-dom/server";
import { styleWithColors } from "../NotionColors";
import HandleBlockAnnotations from "./utils";

export const BlockCallout = (block: GetBlockResponse) => {
  /* @ts-ignore */
  const callout = block["callout"];
  const icon = callout.icon;
  const text = callout.text;
  // TODO: handle font-size

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
          let annotations = t.annotations;
          /* @ts-ignore */
          return HandleBlockAnnotations(annotations, t.text);
        })}
      </div>
    </figure>
  );
};
