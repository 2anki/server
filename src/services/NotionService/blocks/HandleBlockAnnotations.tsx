import TagRegistry from '../../../lib/parser/TagRegistry';
import { RichTextItemResponse } from '@notionhq/client/build/src/api-endpoints';
import notionColorToHex, { isNotionColorBackground } from '../NotionColors';

interface Annotations {
  underline: boolean;
  bold: boolean;
  italic: boolean;
  strikethrough: boolean;
  code: boolean;
  color?: string;
}

const HandleBlockAnnotations = (
  annotations: Annotations,
  text: RichTextItemResponse
) => {
  if (!text) {
    return null;
  }
  const content = text.plain_text;
  const color = annotations.color;
  // Compose all styles, allowing background + bold/italic/etc
  let styledContent: JSX.Element | string = content;
  if (annotations.code) {
    styledContent = <code>{styledContent}</code>;
  }
  if (annotations.strikethrough) {
    TagRegistry.getInstance().addStrikethrough(content);
    styledContent = <del>{styledContent}</del>;
  }
  if (annotations.italic) {
    styledContent = <em>{styledContent}</em>;
  }
  if (annotations.bold) {
    styledContent = <strong>{styledContent}</strong>;
  }
  if (annotations.underline) {
    styledContent = (
      <span style={{ borderBottom: '0.05em solid' }}>{styledContent}</span>
    );
  }
  if (color && isNotionColorBackground(color)) {
    styledContent = (
      <span style={{ backgroundColor: notionColorToHex(color) }}>
        {styledContent}
      </span>
    );
  }
  return <>{styledContent}</>;
};

export default HandleBlockAnnotations;
