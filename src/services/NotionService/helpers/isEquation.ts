export default function isEquation(block: { type: string }): boolean {
  return block.type === 'equation';
}
