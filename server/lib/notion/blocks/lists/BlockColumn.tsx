import { GetBlockResponse } from "@notionhq/client/build/src/api-endpoints";
import BlockHandler from "../../BlockHandler";
import { HandleChildren } from "../utils";

export default async function BlockColumn(
    block: GetBlockResponse,
    handler: BlockHandler
) {
  return HandleChildren(block, handler);
}