import showdown from 'showdown';

export const markdownToHTML = (html: string) => {
  const converter = new showdown.Converter({
    noHeaderId: true,
    disableForced4SpacesIndentedSublists: true,
  });
  converter.setFlavor('github');
  return converter.makeHtml(html);
};
