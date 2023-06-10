import {
  EquationBlockObjectResponse,
  EquationRichTextItemResponse,
} from '@notionhq/client/build/src/api-endpoints';

export default function BlockEquation(
  block: EquationBlockObjectResponse | EquationRichTextItemResponse
) {
  const { equation } = block;
  const { expression } = equation;
  return `\\(${expression}\\)`;
}
