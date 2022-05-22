import { GetBlockResponse } from '@notionhq/client/build/src/api-endpoints';
import BlockHandler from '../BlockHandler';
import renderLink from '../helpers/renderLink';

export default async function LinkToPage(
  block: GetBlockResponse,
  handler: BlockHandler,
) {
  /* @ts-ignore */
  const linkToPage = block.link_to_page;
  const page = await handler.api.getPage(linkToPage.page_id);
  const title = await handler.api.getPageTitle(page, handler.settings);
  /* @ts-ignore */
  const { icon } = page;
  return renderLink(title, block, icon);
}
