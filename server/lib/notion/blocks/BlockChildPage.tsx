import { GetBlockResponse } from "@notionhq/client/build/src/api-endpoints";
import ReactDOMServer from "react-dom/server";
import BlockHandler from "../BlockHandler";

export const BlockChildPage = (
  block: GetBlockResponse,
  handler: BlockHandler
) => {
  /* @ts-ignore */
  const childPage = block.child_page;
  const api = handler.api;
  const page = api.getPage(block.id) || {};
  /* @ts-ignore */
  const icon = page.icon;
  
  if (handler.settings?.isTextOnlyBack && childPage) {
    return childPage.title;
  }

  return ReactDOMServer.renderToStaticMarkup(
    <a id={block.id} href={`https://notion.so/${block.id.replace(/\-/g, "")}`}>
      {icon && icon.type === "emoji" && (
        <span className="icon">{icon.emoji}</span>
      )}
      {childPage.title}
    </a>
  );
};
