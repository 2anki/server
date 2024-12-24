import showdown from 'showdown';

export const markdownToHTML = (
  html: string,
  trimWhitespace: boolean = false
) => {
  const converter = new showdown.Converter({
    noHeaderId: true,
    disableForced4SpacesIndentedSublists: true,
    simpleLineBreaks: true,
  });
  converter.setFlavor('github');

  let processedHtml = html;

  if (trimWhitespace) {
    processedHtml = html.trim();
  }

  const htmlWithoutPreTags = converter
    .makeHtml(processedHtml)
    .replace(/<pre><code>|<\/code><\/pre>/g, '');
  return htmlWithoutPreTags;
};
