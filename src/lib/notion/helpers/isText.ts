export default function isText(block: { type: string }): boolean {
  return block.type === 'text';
}
