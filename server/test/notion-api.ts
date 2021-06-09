import test from "ava";
import BlockHandler from "../handlers/BlockHandler";
import NotionAPIWrapper from "../notion/api";
import Settings from "../parser/Settings";

const pageId = "3ce6b147ac8a425f836b51cc21825b85";
const api = new NotionAPIWrapper(process.env.NOTION_KEY!);

test("Get Notion Page", async (t) => {
  const page = await api.getPage(pageId);
  console.log(page.properties.title);

  /* @ts-ignore */
  t.deepEqual(page.properties.Name.title[0].text.content, "Alexander Alemayhu");
});

test("Get Blocks", async (t) => {
  const topLevelToggles = await api.getToggleLists(
    "07a7b319183642b9afecdcc4c456f73d"
  );
  t.deepEqual(topLevelToggles.length, 14);
});

test("Basic Cards from Blocks", async (t) => {
  const settings = new Settings({ cloze: "false" });
  const toggles = await api.getToggleLists(pageId);
  const bl = new BlockHandler(api, toggles);
  const flashcards = await bl.getFlashcards(settings);
  const card = flashcards[0];

  t.deepEqual(card.name, "This is a basic card");
  t.deepEqual(card.back, "This is the back of the card");
});

test("Cloze Deletion from Blocks", async (t) => {
  const settings = new Settings({ cloze: "true" });
  const toggles = await api.getToggleLists(pageId);
  const bl = new BlockHandler(api, toggles);
  const flashcards = await bl.getFlashcards(settings);
  const card = flashcards[1];
  t.deepEqual(card.name, "This is a {{c1::cloze deletion}}");
  t.deepEqual(card.back, "Extra");
});

test.skip("Input Cards from Blocks", async (t) => {
  t.fail("to be implemented");
});

test.skip("Subpages", async (t) => {
  t.fail("to be implemented");
});
