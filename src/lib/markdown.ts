import showdown from 'showdown';

export const markdownToHTML = (html: string) => {
  const converter = new showdown.Converter({
    noHeaderId: true,
  });

  return converter.makeHtml(html);
};
