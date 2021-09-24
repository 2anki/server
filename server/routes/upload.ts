import path from "path";
import fs from "fs";
import os from "os";

import { nanoid } from "nanoid";
import express from "express";
import multer from "multer";
import aws from "aws-sdk";
import multerS3 from "multer-s3";

import { PrepareDeck } from "../parser/DeckParser";
import { ZipHandler } from "../handlers/zip";
import ErrorHandler from "../handlers/error";

import Package from "../parser/Package";

import StorageHandler from "../handlers/StorageHandler";
import { TEMPLATE_DIR, ALLOWED_ORIGINS } from "../constants";
import Settings from "../parser/Settings";
import TokenHandler from "../handlers/TokenHandler";
import DB from "../storage/db";

const ADVERTISEMENT = fs
  .readFileSync(path.join(TEMPLATE_DIR, "README.html"))
  .toString();

function TriggerUnsupportedFormat() {
  throw new Error(
    'Markdown support has been removed, please use <a class="button" href="https://www.notion.so/Export-as-HTML-bf3fe9e6920e4b9883cbd8a76b6128b7">HTML</a>'
  );
}

function cleanDeckName(name: string) {
  let _name = name;
  if (name.startsWith("&#x")) {
    _name = name.split(" ").slice(1).join("").trim();
  }
  console.log("cleanDeckName", _name);
  return _name;
}

async function handleUpload(
  s3: aws.S3,
  req: express.Request,
  res: express.Response
) {
  console.log("POST", req.originalUrl);
  const origin = req.headers.origin;

  const isLoggedIn = await TokenHandler.IsValidJWTToken(req.cookies.token);
  let access = null;
  if (isLoggedIn) {
    access = await DB("access_tokens")
      .where({ token: req.cookies.token })
      .returning(["owner"])
      .first();
  }

  if (!origin) {
    throw new Error("unknown origin");
  }

  const permitted = ALLOWED_ORIGINS.includes(origin);
  console.log("checking if", origin, "is whitelisted", permitted);
  if (!permitted) {
    return res.status(403).end();
  }
  console.log("permitted access to", origin);
  res.set("Access-Control-Allow-Origin", origin);
  try {
    const files = req.files as Express.Multer.File[];
    let packages: Package[] = [];

    for (const file of files) {
      const filename = file.originalname;
      const settings = new Settings(req.body || {});

      if (isLoggedIn) {
        try {
          // Note that the file filename and key are the same right now but that will not be true in the future
          await DB("uploads").insert({
            owner: access.owner,
            filename: filename,
            /* @ts-ignore */
            key: file.key,
          });
        } catch (error) {
          console.info("failed to register upload");
          console.error(error);
        }
      }

      const fileContents = await new Promise<string>((resolve, reject) => {
        s3.getObject(
          /* @ts-ignore */
          { Bucket: "spaces.2anki.net", Key: file.key },
          (err, data) => {
            if (err) {
              reject(err);
            } else {
              /* @ts-ignore */
              resolve(data.Body);
            }
          }
        );
      });

      console.log("filename", filename, "with settings", settings);
      if (filename.match(/.html$/)) {
        console.log("We have a non zip upload");
        const buffer = fs.readFileSync(file.path);
        const d = await PrepareDeck(
          filename,
          [{ name: filename, contents: buffer }],
          settings
        );
        const pkg = new Package(d.name, d.apkg);
        packages = packages.concat(pkg);
      } else if (filename.match(/.md$/)) {
        TriggerUnsupportedFormat();
      } else {
        const zipHandler = new ZipHandler();
        /* @ts-ignore */
        await zipHandler.build(fileContents);
        for (const fileName of zipHandler.getFileNames()) {
          console.log("file", fileName);
          if (fileName.match(/.html$/) && !fileName.includes("/")) {
            const d = await PrepareDeck(fileName, zipHandler.files, settings);
            packages.push(new Package(d.name, d.apkg));
          } else if (fileName.match(/.md$/)) {
            TriggerUnsupportedFormat();
          }
        }
      }
    }
    let payload;
    let plen;

    const first = packages[0];
    if (packages.length === 1) {
      if (!first.apkg) {
        const name = first ? first.name : "untitled";
        throw new Error(`Could not produce APKG for ${name}`);
      }
      payload = first.apkg;
      plen = Buffer.byteLength(first.apkg);
      res.set("Content-Type", "application/apkg");
      res.set("Content-Length", plen.toString());
      first.name = cleanDeckName(first.name);
      try {
        res.set("File-Name", first.name);
      } catch (err) {
        console.log("failed to set name", first.name);
      }
      res.attachment("/" + first.name);
      res.status(200).send(payload);
    } else if (packages.length > 1) {
      const filename = `Your decks-${nanoid()}.zip`;
      const ws = process.env.WORKSPACE_BASE;
      if (!ws) {
        throw new Error("Missing workspace value");
      }
      const pkg = path.join(ws, filename);
      payload = await ZipHandler.toZip(packages, ADVERTISEMENT);
      fs.writeFileSync(pkg, payload);
      try {
        res.set("File-Name", cleanDeckName(filename));
      } catch (err) {
        console.log("failed to set name", first.name);
      }
      res.download(pkg);
    } else {
      throw new Error(
        "Could not create any cards. Did you write any togglelists?"
      );
    }
  } catch (err) {
    console.error(err);
    ErrorHandler(res, err as Error);
  }
}
const router = express.Router();

let storage = new StorageHandler();

const upload = multer({
  limits: { fileSize: 100 * 1024 * 1024, fieldSize: 2 * 1024 * 1024 },
  storage: multerS3({
    s3: storage.s3,
    bucket: "spaces.2anki.net",
    key: function (request, file, cb) {
      const name = (Date.now().toString() + "-" + file.originalname).substring(
        0,
        255
      );
      cb(null, name);
    },
  }),
}).array("pakker", 21);

router.post("/", (req, res) => {
  /* @ts-ignore */
  upload(req, res, function (error) {
    if (error) {
      console.error(error);
      return res.status(500).end();
    } else {
      handleUpload(storage.s3, req, res);
    }
  });
});

export default router;
