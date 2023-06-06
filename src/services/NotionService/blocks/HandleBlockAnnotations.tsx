import TagRegistry from '../../../lib/parser/TagRegistry';
import { RichTextItemResponse } from '@notionhq/client/build/src/api-endpoints';

interface Annotations {
  underline: boolean;
  bold: boolean;
  italic: boolean;
  strikethrough: boolean;
  code: boolean;
}

const HandleBlockAnnotations = (
  annotations: Annotations,
  text: RichTextItemResponse
) => {
  if (!text) {
    return null;
  }
  // if (text.link) {
  //   const mangle = HandleBlockAnnotations(annotations, {
  //     content: text.content,
  //     link: null,
  //   });
  //   return <a href={text.link.url}>{mangle}</a>;
  // }
  const content = text.plain_text;
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
