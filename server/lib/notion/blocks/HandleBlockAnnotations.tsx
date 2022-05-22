import TagRegistry from '../../parser/TagRegistry';

interface Annotations {
  underline: boolean;
  bold: boolean;
  italic: boolean;
  strikethrough: boolean;
  code: boolean;
}

const HandleBlockAnnotations = (
  annotations: Annotations,
  text: { content: string; link: null | { url: string } }
) => {
  if (!text || !text.content) {
    return null;
  }
  const { content } = text;

  if (text.link) {
    const mangle = HandleBlockAnnotations(annotations, {
      content: text.content,
      link: null,
    });
    /* @ts-ignore */
    return <a href={text.link.url}>{mangle}</a>;
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
