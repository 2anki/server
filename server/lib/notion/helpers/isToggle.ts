import { GetBlockResponse } from "@notionhq/client/build/src/api-endpoints";

export default function isToggle(
    block: GetBlockResponse
): boolean {
    /* @ts-ignore */
    return block.type === "toggle"
}