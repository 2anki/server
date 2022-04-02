import path from "path";
import os from "os";

import { getDeck } from "../../test/test-utils";
import Settings from "./Settings";

beforeEach(() => {
  process.env.WORKSPACE_BASE = path.join(os.tmpdir(), "workspaces");
});

test.skip("Toggle Headings", async () => {
  const deck = await getDeck(
    "Toggle Hea 0e02b 2.html",
    new Settings({ cherry: "false" })
  );
  expect(deck.cards.length).toBe(1);
});

test.skip("Grouped cloze deletions", async () => {
  const deck = await getDeck(
    "Grouped Cloze Deletions fbf856ad7911423dbef0bfd3e3c5ce5c 3.html",
    new Settings({ cherry: "false", cloze: "true" })
  );
  // TODO: make sure we actually check for the cloze index c1, c2, etc.
  expect(deck.name).toBe("Grouped Cloze Deletions");
  expect(deck.cards.length).toBe(20);
});
