import { GetBlockResponse } from "@notionhq/client/build/src/api-endpoints";
import BlockHandler from "../../BlockHandler";
import getChildren from "../../helpers/getChildren";

export default async function BlockColumn(
    block: GetBlockResponse,
    handler: BlockHandler
) {
  return getChildren(block, handler);
}