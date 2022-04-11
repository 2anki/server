import { GetBlockResponse } from "@notionhq/client/build/src/api-endpoints";
import ReactDOMServer from "react-dom/server";
import NotionAPIWrapper from "../NotionAPIWrapper";

export const BlockChildPage = (
  block: GetBlockResponse,
  api: NotionAPIWrapper
) => {
  /* @ts-ignore */
  const childPage = block.child_page;
  const page = api.getPage(block.id) || {};
  /* @ts-ignore */
  const icon = page.icon;

  return ReactDOMServer.renderToStaticMarkup(
    <a id={block.id} href={`https://notion.so/${block.id.replace(/\-/g, "")}`}>
      {icon && icon.type === "emoji" && (
        <span className="icon">{icon.emoji}</span>
      )}
      {childPage.title}
    </a>
  );
};
