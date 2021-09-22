import crypto from "crypto";

import express from "express";
import jwt from "jsonwebtoken";

import User from "../lib/User";
import DB from "../storage/db";

import EmailHandler from "../handlers/EmailHandler";

const router = express.Router();

const isValidUser = (password: string, name: string, email: string) => {
  // TODO: do more validation
  if (!password || !name || !email) {
    return false;
  }
  return true;
};

router.get("/v/:id", (req, res, next) => {
  const verification_token = req.params.id;
  console.log("verification_token");
  if (!verification_token || verification_token.length < 128) {
    return res.redirect("/login");
  }
  DB("users")
    .where({ verification_token })
    .update({ verified: true })
    .then(() => res.redirect("/dashboard"))
    .catch((err) => next(err));
});

router.get("/logout", (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(400).json({ message: "Missing authorization header." });
  }
  /* @ts-ignore */
  jwt.verify(token, process.env.SECRET, (error, decodedToken) => {
    if (error) {
      res.status(401).json({
        message: "Unauthorized Access!",
      });
    } else {
      DB("access_tokens")
        .where({ token: token })
        .del()
        .then(() => {
          res.status(200).end();
        })
        .catch((err) => next(err));
    }
  });
});

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
          return jwt.sign(user, process.env.SECRET, (err, token) => {
            if (err) {
              console.error(err);
            }
            res.cookie("token", token);

            DB("access_tokens")
              .insert({
                token: token,
                owner: user.id,
              })
              .onConflict("owner")
              .merge()
              .then(() => {
                return res.status(200).json({ token: token });
              })
              .catch((err) => {
                console.error(err);
                next(err);
              });
          });
        }
      }
    });
});

router.post("/register", async (req, res, next) => {
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
  const verification_token = crypto.randomBytes(64).toString("hex");
  try {
    await EmailHandler.SendVerificationEmail(
      req.hostname,
      email,
      verification_token
    );
  } catch (error) {
    console.error(error);
    return next(error);
  }

  DB("users")
    .insert({
      name,
      password,
      email,
      verification_token,
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
