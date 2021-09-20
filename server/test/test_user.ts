import test from "ava";

import User from "../lib/User";

test("Password hashing", async (t) => {
  const password = "ichiban";
  const hash = User.HashPassword(password);
  t.true(User.ComparePassword(password, hash));
});
