export default function isMention(block: { type: string }): boolean {
  return block.type === 'mention';
}
