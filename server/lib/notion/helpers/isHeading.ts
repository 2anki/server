import { GetBlockResponse } from "@notionhq/client/build/src/api-endpoints";

export default function isHeading(block: GetBlockResponse): boolean {
  /* @ts-ignore */
  switch (block.type) {
    case 'heading_1':
      return true;
    case 'heading_2':
      return true;
    case 'heading_3':
      return true;
    default:
      return false;
  }
}
