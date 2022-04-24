import { GetBlockResponse } from "@notionhq/client/build/src/api-endpoints";
import BlockHandler from "../BlockHandler";
import renderLink from "../helpers/renderLink";

export const BlockChildPage = async (
  block: GetBlockResponse,
  handler: BlockHandler
) => {
  /* @ts-ignore */
  const childPage = block.child_page;
  const api = handler.api;
  const page = await api.getPage(block.id);
  /* @ts-ignore */
  const icon = page.icon;
  
  if (handler.settings?.isTextOnlyBack && childPage) {
    return childPage.title;
  }

  return renderLink(childPage.title, block, icon);
};
