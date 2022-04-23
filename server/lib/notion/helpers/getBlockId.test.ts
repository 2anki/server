import { GetBlockResponse } from "@notionhq/client/build/src/api-endpoints";

export default function getBlockId(block: GetBlockResponse): string {
    return block.id.replace(/-/g, "");
};