import crypto from "crypto";

import express from "express";

import User from "../lib/User";
import DB from "../storage/db";

import EmailHandler from "../handlers/EmailHandler";
import TokenHandler from "../handlers/TokenHandler";

const router = express.Router();

const isValidUser = (password: string, name: string, email: string) => {
  if (!password || !name || !email) {
    return false;
  }
  return true;
};

router.post("/new-password", async (req, res, next) => {
  const reset_token = req.body.reset_token;
  const password = req.body.password;
  if (
    !reset_token ||
    reset_token.length < 128 ||
    !password ||
    password.length < 8
  ) {
    return res.status(400).send({ message: "invalid" });
  }

  try {
    await DB("users")
      .where({ reset_token })
      .update({ password: User.HashPassword(password), reset_token: null });
    res.status(200).send({ message: "ok" });
  } catch (error) {
    next(error);
  }
});

router.post("/forgot-password", async (req, res, next) => {
  if (!req.body.email) {
    return res.status(400).json({ message: "Email is required" });
  }
  const user = await DB("users")
    .where({ email: req.body.email, verified: true })
    .returning(["reset_token", "id"])
    .first();
  /* @ts-ignore */
  if (!user || !user.id) {
    return res.status(200).json({ message: "ok" });
  }
  if (user.reset_token) {
    return res.status(200).json({ message: "ok" });
  }
  const reset_token = crypto.randomBytes(64).toString("hex");
  try {
    await DB("users").where({ email: req.body.email }).update({ reset_token });
    await EmailHandler.SendResetEmail(
      req.hostname,
      req.body.email,
      reset_token
    );
    return res.status(200).json({ message: "ok" });
  } catch (error) {
    console.error(error);
    return next(error);
  }
});

router.get("/v/:id", async (req, res, next) => {
  const valid = await TokenHandler.IsValidVerificationToken(DB, req.params.id);
  if (!valid) {
    return res.redirect("/login#login");
  }
  const verification_token = req.params.id;
  DB("users")
    .where({ verification_token })
    .update({ verified: true })
    .then(() => res.redirect("/dashboard"))
    .catch((err) => next(err));
});

router.get("/logout", async (req, res, next) => {
  const isValid = await TokenHandler.IsValidJWTToken(req.cookies.token);
  if (!isValid) {
    return res.status(400).json({ message: "Missing authorization header." });
  }
  const token = req.cookies.token;
  res.clearCookie("token");
  DB("access_tokens")
    .where({ token: token })
    .del()
    .then(() => {
      res.status(200).end();
    })
    .catch((err) => {
      console.error(err);
      next(err);
    });
});

router.post("/login", async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password || password.length < 8) {
    return res.status(400).json({
      message: "Invalid user data. Required  email and password!",
    });
  }

  try {
    const user = await DB("users").where({ email: email }).first();
    if (!user) {
      return res.status(400).json({
        message: "Unknown error. Please try again or register a new account.",
      });
    }
    const isMatch = User.ComparePassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password." });
    } else {
      const token = await TokenHandler.NewJWTToken(user);
      if (token) {
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
      }
    }
  } catch (error) {
    next(error);
  }
});

router.post("/register", async (req, res, next) => {
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
    await DB("users")
      .insert({ name, password, email, verification_token })
      .returning(["id"]);
    await EmailHandler.SendVerificationEmail(
      req.hostname,
      email,
      verification_token
    );
    res.status(200).json({ message: "ok" });
  } catch (error) {
    console.error(error);
    return next(error);
  }
});

export default router;
