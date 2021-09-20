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
  // TODO: handle the user already exists (same password / email  or wrong )
  console.log("req.body", req.body);
  if (
    !req.body ||
    !isValidUser(req.body.password, req.body.name, req.body.email)
  ) {
    res.json({
      status: 400,
      message: "Invalid user data. Required name, email and password!",
    });
    return;
  }

  const password = User.HashPassword(req.body.password);
  const name = req.body.name;
  const email = req.body.email;
  DB("users")
    .insert({
      name,
      password,
      email,
    })
    .returning(["id"])
    .then((users) => {
      console.info("User registered:", users[0].id);
      res.json({ status: 200, message: "ok" });
    })
    .catch((err) => {
      console.error(err);
      next(err);
    });
});

export default router;
