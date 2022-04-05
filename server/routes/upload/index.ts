import path from "path";
import fs from "fs";

import { nanoid } from "nanoid";
import express from "express";
import multer from "multer";
import multerS3 from "multer-s3";

import { PrepareDeck } from "../../lib/parser/DeckParser";
import { ZipHandler } from "../../lib/anki/zip";
import ErrorHandler from "../../lib/misc/error";

import Package from "../../lib/parser/Package";

import StorageHandler from "../../lib/storage/StorageHandler";
import { TEMPLATE_DIR, ALLOWED_ORIGINS } from "../../lib/constants";
import Settings from "../../lib/parser/Settings";
import DB from "../../lib/storage/db";
import RequireAuthentication from "../../middleware/RequireAuthentication";
import ConversionJob from "../../lib/jobs/ConversionJob";
import { BytesToMegaBytes } from "../../lib/misc/file";

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
  return _name;
}

async function handleUpload(
  storage: StorageHandler,
  req: express.Request,
  res: express.Response
) {
  console.debug("POST " + req.originalUrl);
  const origin = req.headers.origin;

  const isLoggedIn = res.locals.owner;

  if (!origin) {
    throw new Error("unknown origin");
  }

  const permitted = ALLOWED_ORIGINS.includes(origin);
  console.info(`checking if ${origin} is whitelisted ${permitted}`);
  if (!permitted) {
    return res.status(403).end();
  }
  console.info("permitted access to " + origin);
  res.set("Access-Control-Allow-Origin", origin);
  try {
    const files = req.files as Express.Multer.File[];
    let packages: Package[] = [];

    for (const file of files) {
      const filename = file.originalname;
      const settings = new Settings(req.body || {});
      if (isLoggedIn) {
        try {
          await DB("uploads").insert({
            owner: res.locals.owner,
            filename,
            /* @ts-ignore */
            key: file.key,
            size_mb: BytesToMegaBytes(file.size),
          });
        } catch (error) {
          console.info("failed to register upload");
          console.error(error);
        }
      }

      /* @ts-ignore */
      const fileContents = await storage.getFileContents(file.key);

      if (filename.match(/.html$/)) {
        const d = await PrepareDeck(
          filename,
          [{ name: filename, contents: fileContents }],
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
        /* @ts-ignore */
        console.error(err.toString());
        console.info("failed to set name " + first.name);
      }

      // Persisting the deck to spaces
      try {
        await storage.uploadFile(
          storage.uniqify(first.name, "apkg", 255, "apkg"),
          first.apkg
        );
      } catch (err) {
        console.error("failed to upload to spaces", err);
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
      for (const pkg of packages) {
        try {
          await storage.uploadFile(
            storage.uniqify(pkg.name, "apkg", 255, "apkg"),
            pkg.apkg
          );
        } catch (err) {
          console.debug("failed to upload to spaces " + err);
        }
      }
      try {
        res.set("File-Name", cleanDeckName(filename));
      } catch (err) {
        console.debug("failed to set name ***");
      }
      res.status(200).send(payload);
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

const storage = new StorageHandler();

const upload = multer({
  limits: { fileSize: 100 * 1024 * 1024, fieldSize: 2 * 1024 * 1024 },
  storage: multerS3({
    s3: storage.s3,
    bucket: StorageHandler.DefaultBucketName(),
    key(request, file, cb) {
      let suffix = ".zip";
      if (
        file.originalname.includes(".") &&
        file.originalname.split(".").length > 1
      ) {
        const parts = file.originalname.split(".");
        suffix = parts[parts.length - 1];
      }
      cb(null, storage.uniqify(file.originalname, "upload", 256, suffix));
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
      handleUpload(storage, req, res);
    }
  });
});

router.get("/mine", RequireAuthentication, async (req, res) => {
  console.debug("download mine");
  try {
    const uploads = await DB("uploads")
      .where({ owner: res.locals.owner })
      .orderBy("id", "desc")
      .returning("*");
    res.json(uploads);
  } catch (error) {
    console.error(error);
  }
});

router.get("/active", RequireAuthentication, async (req, res) => {
  console.debug("getting jobs");
  try {
    ConversionJob.ResumeStaleJobs(DB, res.locals.owner);
    let c = new ConversionJob(DB);
    const jobs = await c.AllStartedJobs(res.locals.owner);
    res.send(jobs);
  } catch (error) {
    console.error(error);
  }
});

router.delete("/active/:id", RequireAuthentication, async (req, res) => {
  console.log("delete job", req.params.id);
  try {
    let c = new ConversionJob(DB);
    await c.completed(req.params.id, res.locals.owner);
    res.status(200).send();
  } catch (err) {
    res.status(500).send();
    console.error(err);
  }
});

router.delete("/mine/:key", RequireAuthentication, async (req, res) => {
  const key = req.params.key;
  console.log("delete", key);
  if (!key) {
    return res.status(400).send();
  }
  try {
    await DB("uploads").del().where({ owner: res.locals.owner, key: key });
    let s = new StorageHandler();
    await s.deleteWith(key);
    console.log("done deleting", key);
  } catch (error) {
    console.error(error);
    return res.status(500).send();
  }
  return res.status(200).send();
});

export default router;
