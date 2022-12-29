import { LinkToPageBlockObjectResponse } from '@notionhq/client/build/src/api-endpoints';
import BlockHandler from '../../BlockHandler/BlockHandler';
import renderLink from '../../helpers/renderLink';
import getBlockIcon, { WithIcon } from '../getBlockIcon';

export default async function LinkToPage(
  block: LinkToPageBlockObjectResponse,
  handler: BlockHandler
) {
  const linkToPage =
    block.link_to_page.type === 'page_id'
      ? block.link_to_page.page_id
      : undefined;
  if (!linkToPage) {
    return `Unsupported link ${JSON.stringify(block)}`;
  }
  const page = await handler.api.getPage(linkToPage);
  const title = await handler.api.getPageTitle(page, handler.settings);
  return renderLink(title, block, getBlockIcon(page as WithIcon));
}
