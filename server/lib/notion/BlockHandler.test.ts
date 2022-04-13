import path from "path";
import os from "os";

import * as dotenv from "dotenv";
import CustomExporter from "../parser/CustomExporter";
import Note from "../parser/Note";
import ParserRules from "../parser/ParserRules";

import Settings from "../parser/Settings";
import Workspace from "../parser/WorkSpace";
import BlockHandler from "./BlockHandler";
import NotionAPIWrapper from "./NotionAPIWrapper";

dotenv.config({ path: "test/.env" });
const api = new NotionAPIWrapper(process.env.NOTION_KEY!);

const loadCards = async (
  options: any,
  pageId: string,
  ws: Workspace,
  rules?: ParserRules
): Promise<Note[]> => {
  const settings = new Settings(options);
  const r = rules || new ParserRules();
  const exporter = new CustomExporter("", ws.location);
  const bl = new BlockHandler(exporter, api);
  const decks = await bl.findFlashcards(pageId, r, settings, []);
  return decks[0].cards;
};

beforeEach(() => {
  process.env.WORKSPACE_BASE = path.join(os.tmpdir(), "workspaces");
});

test("Get Notion Page", async () => {
  const page = await api.getPage("3ce6b147ac8a425f836b51cc21825b85");
  const title = await api.getPageTitle(page!, new Settings({}));
  expect(title).toBe("Notion API Test Page");
});

test("Get Blocks", async () => {
  // This should be mocked
  const blocks = await api.getBlocks("07a7b319183642b9afecdcc4c456f73d", true);
  /* @ts-ignore */
  const topLevelToggles = blocks.results.filter((t) => t.type === "toggle");
  expect(topLevelToggles.length).toEqual(14);
});

test.skip("Toggle Headings in HTML export", async () => {
  const r = new ParserRules();
  r.setFlashcardTypes(["heading"]);
  const cards = await loadCards(
    {},
    "25226df63b4d4895a71f3bba01d8a8f3",
    new Workspace(true, "fs"),
    r
  );
  console.log("cards", JSON.stringify(cards, null, 4));
  expect(cards.length).toBe(1);
});
