import { GetBlockResponse } from '@notionhq/client/build/src/api-endpoints';

export default function BlockEquation(block: GetBlockResponse) {
  /* @ts-ignore */
  const equation = block.equation;
  const expression = equation.expression;
  return `\\(${expression}\\)`;
}
