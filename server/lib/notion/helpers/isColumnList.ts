interface Block {
  type: string;
}

export default function isColumnList(block: Block) {
  return block.type === 'column_list';
}
