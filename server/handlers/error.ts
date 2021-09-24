import path from "path";
import fs from "fs";

import * as Sentry from "@sentry/node";
import express from "express";

import { TEMPLATE_DIR } from "../lib/constants";

const errorPage = fs
  .readFileSync(path.join(TEMPLATE_DIR, "error-message.html"))
  .toString();
function ErrorHandler(res: express.Response, err: Error) {
  Sentry.captureException(err);
  res.set("Content-Type", "text/html");
  const info = errorPage.replace("{err.message}", err.message);
  res.status(400).send(info);
}

export default ErrorHandler;
