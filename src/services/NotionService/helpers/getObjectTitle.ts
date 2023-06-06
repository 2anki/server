import {
  GetDatabaseResponse,
  GetPageResponse,
} from '@notionhq/client/build/src/api-endpoints';

export default function getObjectTitle(
  p: GetDatabaseResponse | GetPageResponse
): string {
  try {
    // TODO: remove the ignore lines
    // @ts-ignore
    const { properties } = p;
    // @ts-ignore
    if (p.object === 'database' && p.title) {
      // @ts-ignore
      return p.title.map((text) => text.plain_text).join('');
    }
    if (!properties) {
      return 'untitled';
    }
    if (properties.title) {
      return properties.title.title[0].plain_text;
    }
    if (properties.Name) {
      return properties.Name.title[0].plain_text;
    }

    const title = Object.keys(properties).find((k) => {
      const propValue = properties[k];
      if (propValue && Array.isArray(propValue)) {
        return properties[k].title[0].plain_text;
      }
      if (propValue && propValue.title) {
        return propValue.title[0].text.content;
      }
      return null;
    });
    if (title) {
      return title;
    }
  } catch (error) {
    return 'untitled';
  }
  return 'untitled';
}
