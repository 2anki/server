import express, { response } from "express";
import jwt from "jsonwebtoken";

import User from "../lib/User";
import DB from "../storage/db";

const router = express.Router();

const SECRET = process.env.SECRET || "victory";

const isValidUser = (password: string, name: string, email: string) => {
  // TODO: do more validation
  if (!password || !name || !email) {
    return false;
  }
  return true;
};

router.post("/login", (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password || password.length < 8) {
    res.status(400).json({
      message: "Invalid user data. Required  email and password!",
    });
    return;
  }
  DB("users")
    .where({ email: email })
    .first()
    .then((user) => {
      if (!user) {
        res.status(400).json({
          message: "Unknown error. Please try again or register a new account.",
        });
      } else {
        const isMatch = User.ComparePassword(password, user.password);
        console.log("isMatch", isMatch);
        if (!isMatch) {
          return res.status(401).json({ message: "Invalid password." });
        } else {
          /* @ts-ignore */
          return jwt.sign(user, SECRET, (err, token) => {
            if (err) {
              console.error(err);
            }
            return res.status(200).json({ token: token });
          });
        }
      }
    });
});

router.post("/register", (req, res, next) => {
  // TODO: handle the user already exists (same password / email  or wrong )
  console.log("req.body", req.body);
  if (
    !req.body ||
    !isValidUser(req.body.password, req.body.name, req.body.email)
  ) {
    res.status(400).json({
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
      res.status(200).json({ message: "ok" });
    })
    .catch((err) => {
      console.error(err);
      next(err);
    });
});

export default router;
