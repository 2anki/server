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
  const color = text.annotations?.color;
  // Always prioritize background color if present, using NotionColors util
  if (color && isNotionColorBackground(color)) {
    return (
      <span style={{ backgroundColor: notionColorToHex(color) }}>
        {content}
      </span>
    );
  }
  if (annotations.underline) {
    return (
      <span
        style={{
          borderBottom: annotations.underline ? '0.05em solid' : '',
        }}
      >
        {content}
      </span>
    );
  }
  if (annotations.bold) {
    return <strong>{content}</strong>;
  }
  if (annotations.italic) {
    return <em>{content}</em>;
  }
  if (annotations.strikethrough) {
    TagRegistry.getInstance().addStrikethrough(content);
    return <del>{content}</del>;
  }
  if (annotations.code) {
    return <code>{content}</code>;
  }
  return <>{content}</>;
};

export default HandleBlockAnnotations;
