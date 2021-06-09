import { Client } from "@notionhq/client";

class NotionAPIWrapper {
  notion: Client;
  constructor(key: string) {
    this.notion = new Client({ auth: key });
  }

  async getPage(id: string) {
    const page = await this.notion.pages.retrieve({ page_id: id });
    return page;
  }

  async getToggleLists(id: string) {
    https: const response = await this.notion.blocks.children.list({
      block_id: id,
      page_size: 50,
    });
    return response.results.filter((block) => block.type === "toggle");
  }
}

export default NotionAPIWrapper;
