import { GetBlockResponse } from '@notionhq/client/build/src/api-endpoints';

export default function BlockEquation(block: GetBlockResponse) {
  /* @ts-ignore */
  const { equation } = block;
  const { expression } = equation;
  return `\\(${expression}\\)`;
}
