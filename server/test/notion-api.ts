import path from "path";
import os from "os";

import * as dotenv from "dotenv";

import BlockHandler from "../lib/notion/BlockHandler";
import Settings from "../lib/parser/Settings";

import Note from "../lib/parser/Note";
import ParserRules from "../lib/parser/ParserRules";
import Workspace from "../lib/parser/WorkSpace";
import CustomExporter from "../lib/parser/CustomExporter";
import { configureAPI, pageId } from "./test-utils";
dotenv.config({ path: __dirname + "/.env" });

process.env.WORKSPACE_BASE = path.join(os.tmpdir(), "w");
const ws = new Workspace(true, "fs");

const api = configureAPI();

const defaultFront = (s: string) => `<div class="">${s}</div>`;

async function findCardByName(
  name: string,
  options: Object
): Promise<Note | undefined> {
  const flashcards = await loadCards(options);
  return flashcards.find((f) => f.name === defaultFront(name));
}

const loadCards = async (options: any): Promise<Note[]> => {
  const settings = new Settings(options);
  const rules = new ParserRules();
  const exporter = new CustomExporter("", ws.location);
  const bl = new BlockHandler(exporter, api);
  const decks = await bl.findFlashcards(pageId, rules, settings, []);
  return decks[0].cards;
};

test("Basic Cards from Blocks", async (t) => {
  const flashcards = await loadCards({ cloze: "false" });
  const card = flashcards[0];
  t.deepEqual(card.name, defaultFront("1 - This is a basic card"));
  t.deepEqual(
    card.back,
    `<p class="" id="f83ce56a-9039-4888-81be-375b19a84790">This is the back of the card</p>`
  );
});

test("Cloze Deletion from Blocks", async (t) => {
  const flashcards = await loadCards({ cloze: true });
  const card = flashcards[1];
  t.deepEqual(card.name, "2 - This is a {{c1::cloze deletion}}");
  t.deepEqual(
    card.back,
    `<p class="" id="34be35bd-db68-4588-85d9-e1adc84c45a5">Extra</p>`
  );
});

test("Input Cards from Blocks", async (t) => {
  const flashcards = await loadCards({ cloze: "false", input: "true" });
  t.assert(flashcards.find((n) => n.name == "6 - 21 + 21 is "));
});

test("Enable Cherry Picking Using 🍒 Emoji", async (t) => {
  const flashcards = await loadCards({ cherry: "true", cloze: "true" });
  t.true(flashcards.length === 2);
});

test("Only Create Flashcards From Toggles That Don't Have The 🥑 Emoji", async (t) => {
  const flashcards = await loadCards({ avocado: "true" });
  const avocado = flashcards.find((c) => c.name.includes("🥑"));
  t.assert(!avocado);
});

test("Add Notion Link", async (t) => {
  const expected =
    "https://www.notion.so/Notion-API-Test-Page-3ce6b147ac8a425f836b51cc21825b85#e5201f35c72240d38e3a5d218e5d80a5";
  const flashcards = await loadCards({
    "add-notion-link": true,
    parentBlockId: pageId,
  });
  const card = flashcards.find(
    (f) => f.name === defaultFront("1 - This is a basic card")
  );
  t.assert(card);
  t.deepEqual(card?.notionLink, expected);
});

test("Use Notion ID", async (t) => {
  const flashcards = await loadCards({ "use-notion-id": "true" });
  const card = flashcards.find(
    (f) => f.name === defaultFront("3 - 21 + 21 is #buddy")
  );
  const expected = "a5445230-bfa9-4bf1-bc35-a706c1d129d1";
  t.deepEqual(card?.notionId, expected);
});

test("Strikethrough Global Tags", async (t) => {
  const card = await findCardByName("This card has global tags", {
    tags: "true",
  });
  t.true(card?.tags.includes("global-tag"));
  t.true(card?.tags.includes("global-tag"));
});

test.skip("Strikethrough Local Tags", async (t) => {
  const card = await findCardByName("This card has three tags", {
    tags: "true",
  });
  const expected = ["global tag", "tag a", "tag b"];
  t.deepEqual(card?.tags, expected);
});

test.skip("Template Options", async (t) => {
  t.fail("to be implemented");
});

test.skip("Use Plain Text for Back", async (t) => {
  t.fail("to be implemented");
});

test.skip("Basic and Reversed", async (t) => {
  t.fail("to be implemented");
});

test.skip("Just the Reversed Flashcards", async (t) => {
  t.fail("to be implemented");
});

test.skip("Remove Underlines", async (t) => {
  t.fail("to be implemented");
});

test.skip("Download Media Files", async (t) => {
  t.fail("to be implemented");
});

test.skip("Preserve Newlines in the Toggle Header and Body", async (t) => {
  t.fail("to be implemented");
});

test.skip("Toggle Mode", async (t) => {
  const flashcards = await loadCards({});
  const nestedOnes = flashcards.find((c) => c.name.match(/Nested/i));
  t.assert(nestedOnes?.back);
});

test.skip("Use All Toggle Lists", async (t) => {
  t.fail("to be implemented");
});

test("Subpages", async (t) => {
  const settings = new Settings({ all: "true" });
  const rules = new ParserRules();
  const exporter = new CustomExporter("", ws.location);
  const bl = new BlockHandler(exporter, api);
  const decks = await bl.findFlashcards(pageId, rules, settings, []);
  t.assert(decks.length > 1);
  t.assert(decks[1].name.includes("::"));
});

test.skip("Maximum One Toggle Per Card", async (t) => {
  t.fail("to be implemented");
});
