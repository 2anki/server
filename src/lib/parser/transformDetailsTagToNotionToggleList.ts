export function transformDetailsTagToNotionToggleList(
  dom: cheerio.Root,
  details: cheerio.Element[]
) {
  return details.map((detail) => {
    const wrapper = dom('<ul class="toggle"><li></li></ul>');
    wrapper.find('li').append(dom(detail));
    return wrapper[0];
  });
}
