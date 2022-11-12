export default class NotionID {
  static fromString(query: string): string {
    const comps = query.split('/');
    const title = comps[comps.length - 1];
    const parts = title.split('-');
    return parts[parts.length - 1];
  }
}
