import express, { response } from "express";

import User from "../lib/User";
import DB from "../storage/db";

const router = express.Router();

const isValidUser = (password: string, name: string, email: string) => {
  // TODO: do more validation
  if (!password || !name || !email) {
    return false;
  }
  return true;
};

router.post("/register", (req, res, next) => {
  const password = User.HashPassword(req.body.password);
  const name = req.body.name;
  const email = req.body.email;

  // TODO: handle the user already exists (same password / email  or wrong )
  if (isValidUser(password, name, email)) {
    DB("users")
      .insert({
        name,
        password,
        email,
      })
      .returning(["id"])
      .then((users) => {
        console.info("User registered:", users[0].id);
        response.json({ status: 200, message: "ok" });
      })
      .catch((err) => {
        next(err);
      });
  }
});

export default router;
